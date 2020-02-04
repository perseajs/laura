const path = require('path');

global.test = async function test(testName, fn) {
    if (testName === targetTestName) {
        const startTime = Date.now();
        try {
            await fn();
            console.log('Passed %s in %dms', process.env.TEST_NAME, Date.now() - startTime);
            process.exit(0);
        } catch (e) {
            console.log('Failed %s in %dms', process.env.TEST_NAME, Date.now() - startTime);
            console.error(e);
            process.exit(1);
        }
    }
}

const [filename, targetTestName] = process.env.TEST_NAME.split(' :: ');

require(path.resolve(process.cwd(), filename));
