var fs   = require('fs'),
    path = require('path');

describe('Real-world tests', function() {
    'use strict';

    var testsCreated = 0;
    var realWorldDir = path.join(__dirname, '..', 'files', 'real-world');

    createTests(realWorldDir);

    if (testsCreated === 0) {
        throw new Error('Unable to initialize real-world tests. Check the "' + realWorldDir + '" directory.');
    }

    /**
     * Creates unit tests for all Swagger files in the given directory and its sub-directories.
     * @param {string}  dir
     */
    function createTests(dir) {
        fs.readdirSync(dir).forEach(function(name) {
            var fullName = path.join(dir, name);
            var ext = path.extname(name);
            var stat = fs.statSync(fullName);

            if (stat.isFile() &&
                ['.json', '.yaml', '.yml'].indexOf(ext) >= 0) {
                // This is a Swagger file, so create a test
                createTest(fullName);
            }
            else if (stat.isDirectory()) {
                // Recursively process this sub-directory
                createTests(fullName);
            }
        });
    }

    /**
     * Creates a unit test for the given Swagger file.
     * @param {string} file
     */
    function createTest(file) {
        testsCreated++;
        it(testsCreated + ') ' + path.relative(realWorldDir, file),
            function(done) {
                // Some of these APIs are REALLY big, so increase the timeouts
                this.timeout(6000); 
                this.slow(3000);

                env.parser.parse(file, function(err, api, metadata) {
                    if (err) {
                        expect(err).to.be.an.instanceOf(ReferenceError);
                        expect(err.message).to.contain('circular reference(s) detected')
                    }

                    expect(api).to.be.an('object').and.not.empty;
                    expect(api.swagger).to.be.a('string').and.not.empty;
                    expect(api.info).to.be.an('object').and.not.empty;
                    expect(api.paths).to.be.an('object');                   // <-- api.paths can be empty
                    expect(metadata).to.satisfy(env.isMetadata);
                    done();
                });
            }
        );
    }
});
