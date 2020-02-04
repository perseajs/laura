#!/usr/bin/env node

const cluster = require('cluster');
const fs      = require('fs');
const path    = require('path');

const NUM_WORKERS = process.env.NUM_WORKERS || require('os').cpus().length;

function readDir (dir) {
    const entities = fs.readdirSync(dir, { withFileTypes: true });
    const childPaths = entities.map(entity => {
        const childPath = path.resolve(dir, entity.name);
        return entity.isDirectory() ? readDir(childPath) : childPath;
    })
    return Array.prototype.concat(...childPaths);
}

function discoverTests (regex) {
    const registeredTests = [];
    for (const filename of readDir(process.cwd())) {
        if (!regex.test(filename)) { continue; }

        global.test = function test(testName, fn) {
            registeredTests.push(filename + ' :: ' + testName);
        }
        require(path.resolve(process.cwd(), filename));
    }

    delete global.test;

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

run(discoverTests(new RegExp(process.argv[2])));
