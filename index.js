#!/usr/bin/env node

const cluster = require('cluster');
const fs      = require('fs');
const path    = require('path');

const NUM_WORKERS = process.env.NUM_WORKERS || require('os').cpus().length;

function loadTests (files) {
    global.before = () => {};
    global.after = () => {};

    const registeredTests = [];
    for (const filename of files) {
        const fullFilename = path.resolve(process.cwd(), filename)

        global.test = function test(testName, fn) {
            registeredTests.push(fullFilename + ' :: ' + testName);
        }
        require(fullFilename);
    }

    delete global.test;
    delete global.before;
    delete global.after;

    return registeredTests;
}

function run (tests) {
    const report = { startTime: Date.now(), pass: 0, fail: 0 };
    const toRun = Array.from(tests)

    cluster.setupMaster({ exec: path.resolve(__dirname, 'worker.js'), });
    const workers = [];
    for (let i = 0; i < NUM_WORKERS && toRun.length > 0; i++) {
        workers.push(
            cluster.fork({ TEST_NAME: toRun.shift() })
        );
    }

    cluster.on('exit', (worker, code, signal) => {
        if (code === 0) {
            report.pass += 1;
        } else {
            report.fail += 1;
        }

        workers.splice(workers.indexOf(worker), 1);

        if (toRun.length > 0) {
            cluster.fork({ TEST_NAME: toRun.shift() })
        }

        if (workers.length === 0) {
            console.log(`${report.pass} / ${report.pass + report.fail} tests passed in ${Date.now() - report.startTime}ms`);
            if (report.fail !== 0) {
                process.exit(1);
            }
        }
    });
}

const files = process.argv.slice(2).filter(v => !v.startsWith('-'));
if (files.length === 0) {
    console.log(`
usage: laura ...files
    `.trim())
    process.exit(1);
} else {
    run(loadTests(files));
}
