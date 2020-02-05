const path = require('path');

function loadTest (testName) {
    const [filename, targetTestName] = testName.split(' :: ');

    let beforeFn = () => {};
    global.before = async function before (fn) {
        beforeFn = fn;
    };

    let afterFn = () => {};
    global.after = async function after (fn) {
        afterFn = fn;
    };

    let targetTest = null;
    global.test = async function test(testName, fn) {
        if (testName === targetTestName) {
            targetTest = fn;
        }
    }

    require(path.resolve(process.cwd(), filename));

    return { targetTest, beforeFn, afterFn };
}

async function main () {
    const { targetTest, beforeFn, afterFn } = loadTest(process.env.TEST_NAME);

    const startTime = Date.now();
    let status = 'Pending';
    await beforeFn();
    try {
        await targetTest();
        status = 'Passed';
    } catch (e) {
        status = 'Failed';
        console.error(e);
    }
    await afterFn();

    const shortenedTestName = process.env.TEST_NAME.replace(process.cwd() + '/', '');
    console.log('%s %s in %dms', status, shortenedTestName, Date.now() - startTime);
    process.exit(status === 'Passed' ? 0 : 1);
}

main();
