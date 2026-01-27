import fs from 'fs';
import path from 'path';
import { addProperty } from '@wdio/junit-reporter'
import { browser } from '@wdio/globals'
import { expect } from 'chai';

type MochaClientResultTree = {
    title: string;
    passed: boolean;
    duration: number;
    suites: MochaClientResultTree[];
    tests: MochaClientResultTree[];
    err?: Error;
};

// This function will recursively create describe/it blocks from the browser test results
// to take advantage of the wdio mocha reporter functionality.
function makeSuiteFromBrowserResults (result: MochaClientResultTree) {
    if (!result) {
        return;
    }
    
    describe(result.title, () => {
        result.tests.forEach((test) => {
            it(test.title, () => {
                addProperty('error', test.err ? test.err.message : ':)');
                if (test.err) {
                    throw new Error(test.err.message);
                }
                expect(test.passed).to.be.true;
            });
        });

        result.suites.forEach(makeSuiteFromBrowserResults);
    });
}

export function mochaBrowserSpec(suiteName: string, testPath: string) {
    describe(suiteName, () => {
        before(async () => {
            await browser.url(`/tests/new/${testPath}?nostart`)
        });
        
        it (`runs the browser test suite`, async () => {
            await browser.setTimeout({ script: 5 * 60 * 1000 });
            const testResults = JSON.parse(await browser.executeAsyncScript(`window.runTests(arguments[arguments.length - 1])`, []));
            
            expect(testResults).to.be.a('object');
            expect(testResults).to.not.be.empty;

            describe (`${suiteName} (browser tests)`, () => {
                testResults.suites.forEach(makeSuiteFromBrowserResults);
            });
        });
    });

}

function getLogIcon(level: string) {
   switch(level.toUpperCase()) {
       case 'SEVERE':
       case 'ERROR':   return '🔴';
       case 'WARNING': return '🟡';
       case 'INFO':    return '🔵';
       case 'DEBUG':   return '🟣';
       default:        return '⚪';
   }
}

function printBrowserLogs(logs) {
   if (logs.length === 0) {
       console.log('📝 No browser logs found');
       return;
   }
   
   console.log(`\n📋 Browser Logs (${logs.length} entries):`);
   console.log('─'.repeat(80));
   
   logs.forEach((log) => {
       const timestamp = new Date(log.timestamp).toISOString();
       const icon = getLogIcon(log.level);
       const level = log.level.padEnd(7);
       
       console.log(`${icon} ${level} | ${timestamp} | ${log.message}`);
   });
   
   console.log('─'.repeat(80));
}

export async function runTestsAndWriteResults(suiteName: string, testPath: string) {
    let testResults;
    describe(suiteName, function () {
        it(`runs the browser test suite and saves results`, async function () {
            await browser.setTimeout({ script: 5 * 60 * 1000 });

            const url = `/tests/new/${testPath}?nostart`;
            console.log(`Navigating to: ${url}`);
            await browser.url(url);

            // Wait for window.runTests to be available (scripts may still be loading)
            const startTime = Date.now();
            while (!await browser.executeAsyncScript(`arguments[arguments.length - 1](typeof window.runTests === 'function')`, [])) {
                if (Date.now() - startTime > 30000) {
                    throw new Error('window.runTests not available after 30s');
                }
                await new Promise(r => setTimeout(r, 50));
            }

            testResults = JSON.parse(await browser.executeAsyncScript(`window.runTests(arguments[arguments.length - 1])`, []));
            expect(testResults).to.be.a('object');
            expect(testResults).to.not.be.empty;

            const resultsDir = path.resolve(process.env.GITHUB_WORKSPACE || process.cwd(), `tests`, `browser`, `results`);
            if (!fs.existsSync(resultsDir)){
                fs.mkdirSync(resultsDir);
            }

            const resultsFilePath = path.join(resultsDir, `${suiteName}.json`);
            fs.writeFileSync(resultsFilePath, JSON.stringify(testResults, null, 2), 'utf-8');

            // print browser logs so they're available in the GHA
            const logs = await browser.executeScript(`return window._getConsoleLogs()`, []);
            printBrowserLogs(logs);

            // weird nested setup, but here to report the results from the browser test suite at the end for a console summary
            // GHA will use a test reporter to print the saved results files directly in a nice UI.
            context(`${suiteName} results`, () => {
                for (const test of testResults.tests) {
                    it(test.fullTitle, () => {
                        expect(test.err.message).to.not.be.ok;
                    });
                }
                for (const test of testResults.failures) {
                    it(test.fullTitle, () => {
                        expect(test.err.message).to.not.be.ok;
                    });
                }
            });

            expect(testResults.stats.failures).to.equal(0, `There are ${testResults.stats.failures} failures in the test suite`);
            expect(testResults.stats.pending).to.equal(0, `There are ${testResults.stats.pending} pending tests in the test suite`);
        });

    });
}
