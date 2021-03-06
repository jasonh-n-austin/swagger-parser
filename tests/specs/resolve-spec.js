require('../test-environment.js');

describe('Resolution tests', function() {
    'use strict';

    beforeEach(function() {
        env.parser.defaults.dereference$Refs = false;
    });

    afterEach(function() {
        env.parser.defaults.dereference$Refs = true;
    });

    describe('Success tests', function() {
        it('should not resolve shorthand pointers if "resolve$Refs" is false',
            function(done) {
                env.parser.parse(env.getPath('good/shorthand-refs.yaml'), {resolve$Refs: false}, function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.shorthandRefs);

                    // The metadata should not contain any $refs
                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal({});

                    done();
                });
            }
        );

        it('should resolve shorthand "definition" references',
            function(done) {
                env.parser.parse(env.getPath('good/shorthand-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.shorthandRefs);

                    var $refs = {};
                    $refs.pet = $refs['#/definitions/pet'] = env.resolved.pet;
                    $refs.error = $refs['#/definitions/error'] = env.resolved.error;

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should not resolve external pointers if "resolveExternal$Refs" is false',
            function(done) {
                env.parser.parse(env.getPath('good/external-refs.yaml'), {resolveExternal$Refs: false}, function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.externalRefs);

                    // The metadata should not contain any $refs, since they are all external
                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal({});

                    done();
                });
            }
        );

        it('should not resolve external pointers',
            function(done) {
                env.parser.parse(env.getPath('good/external-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.externalRefs);

                    var $refs = {};
                    $refs['pet.yaml'] = $refs['./pet.yaml'] = $refs['../../files/good/pet.yaml'] = $refs[env.getAbsolutePath('good/pet.yaml')] = env.resolved.pet;
                    $refs['./pet'] = $refs[env.getAbsolutePath('good/pet')] = env.resolved.pet;
                    $refs['error.json'] = $refs[env.getAbsolutePath('good/error.json')] = env.resolved.errorExternal;
                    $refs['text.txt'] = $refs[env.getAbsolutePath('good/text.txt')] = env.resolved.text;

                    if (env.isNode) {
                        $refs['image.gif'] = $refs[env.getAbsolutePath('good/image.gif')] = env.resolved.image;
                    }
                    else {
                        // Browsers differ in how they convert binary data to strings,
                        // so we can't compare the exact data for the external image file
                        expect(metadata.$refs['image.gif']).to.be.a('string').and.not.empty;
                        expect(metadata.$refs['image.gif']).to.equal(metadata.$refs[env.getAbsolutePath('good/image.gif')]);
                        delete metadata.$refs['image.gif'];
                        delete metadata.$refs[env.getAbsolutePath('good/image.gif')]
                    }

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should resolve all types of references',
            function(done) {
                env.parser.parse(env.getPath('good/refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.refs);

                    var $refs = {};
                    $refs['pet'] = $refs['#/definitions/pet'] = $refs['#/paths//pets/post/responses/200/schema'] = env.resolved.pet;
                    $refs['pet.yaml'] = $refs['../../files/good/pet.yaml'] = $refs[env.getAbsolutePath('good/pet.yaml')] = env.resolved.pet;
                    $refs['./error.json'] = $refs[env.getAbsolutePath('good/error.json')] = env.resolved.errorExternal;

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should resolve nested references',
            function(done) {
                env.parser.parse(env.getPath('good/nested-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.nestedRefs);

                    var $refs = {};
                    $refs['pet'] = $refs['#/definitions/pet'] = env.resolved.pet;
                    $refs['error'] = $refs['#/definitions/error'] = env.resolved.error;
                    $refs['errorWrapper'] = $refs['#/definitions/errorWrapper'] = env.resolved.errorWrapper;

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should resolve internal references in external files',
            function(done) {
                env.parser.parse(env.getPath('good/external-backrefs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.externalBackRefs);

                    var $refs = {};
                    $refs['pet'] = $refs['#/definitions/pet'] = env.resolved.pet;
                    $refs['error'] = $refs['#/definitions/error'] = $refs['error-backref.yml'] = $refs[env.getAbsolutePath('good/error-backref.yml')] = env.resolved.errorBackref;
                    $refs['#/definitions/pet/properties/type/enum'] = ['cat', 'dog', 'bird'];
                    $refs['external-backrefs-path.yml'] = $refs[env.getAbsolutePath('good/external-backrefs-path.yml')] = env.resolved.externalBackRefsPath;

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should resolve non-object references',
            function(done) {
                env.parser.parse(env.getPath('good/non-object-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.nonObjectRefs);

                    var $refs = {
                        "#/definitions/error/properties/code/minimum": 400,
                        "#/definitions/pet/properties/name/type": "string",
                        "#/definitions/pet/properties/type/enum": ["cat", "dog", "bird"]
                    };

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should resolve circular references',
            function(done) {
                env.parser.parse(env.getPath('good/circular-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.circularRefs);

                    var $refs = {};
                    $refs['person'] = $refs['#/definitions/person'] = env.resolved.circularRefsPerson;
                    $refs['parent'] = $refs['#/definitions/parent'] = env.resolved.circularRefsParent;
                    $refs['child'] = $refs['#/definitions/child'] = env.resolved.circularRefsChild;

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );

        it('should ignore $refs that aren\'t strings',
            function(done) {
                env.parser.parse(env.getPath('good/non-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    expect(api).to.deep.equal(env.resolved.nonRefs);

                    var $refs = {};
                    $refs['$ref'] = $refs['#/definitions/$ref'] = env.resolved.nonRef;

                    expect(metadata).to.satisfy(env.isMetadata);
                    expect(metadata.$refs).to.deep.equal($refs);

                    done();
                });
            }
        );
    });


    describe('Reference-equality tests', function() {

        it('should resolve matching shorthand references to the same object instance',
            function(done) {
                env.parser.parse(env.getPath('good/shorthand-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    // The $refs should all point to the same object instance
                    expect(metadata.$refs.pet).to.equal(metadata.$refs['#/definitions/pet']);
                    expect(metadata.$refs.error).to.equal(metadata.$refs['#/definitions/error']);

                    done();
                });
            }
        );

        it('should resolve different-but-matching references to the same object instance',
            function(done) {
                env.parser.parse(env.getPath('good/refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    // The "pet" $refs should all point to the same object instance
                    var pet$Ref = metadata.$refs['pet'];
                    expect(pet$Ref).to.equal(metadata.$refs['#/definitions/pet']);
                    expect(pet$Ref).to.equal(metadata.$refs['#/paths//pets/post/responses/200/schema']);
                    expect(pet$Ref).to.equal(metadata.$refs['pet.yaml']);
                    expect(pet$Ref).to.equal(metadata.$refs['../../files/good/pet.yaml']);
                    expect(pet$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/pet.yaml')]);

                    // The "error" $refs should all point to the same object instance
                    var error$Ref = metadata.$refs['./error.json'];
                    expect(error$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/error.json')]);

                    done();
                });
            }
        );

        it('should resolve matching external references to the same object instance',
            function(done) {
                env.parser.parse(env.getPath('good/external-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    // The "pet" $refs should all point to the same object instance
                    var pet$Ref = metadata.$refs['pet.yaml'];
                    expect(pet$Ref).to.equal(metadata.$refs['./pet.yaml']);
                    expect(pet$Ref).to.equal(metadata.$refs['../../files/good/pet.yaml']);
                    expect(pet$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/pet.yaml')]);

                    // The "error" $refs should all point to the same object instance
                    var error$Ref = metadata.$refs['error.json'];
                    expect(error$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/error.json')]);

                    done();
                });
            }
        );

        it('should resolve different external references to different object instances',
            function(done) {
                env.parser.parse(env.getPath('good/different-file-ext.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    // The "pet.yaml" $refs should all point to the same object instance
                    var yaml$Ref = metadata.$refs['pet.yaml'];
                    expect(yaml$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/pet.yaml')]);

                    // The "pet.yml" $refs should all point to the same object instance
                    var yml$Ref = metadata.$refs['pet.yml'];
                    expect(yml$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/pet.yml')]);

                    // The "pet.json" $refs should all point to the same object instance
                    var json$Ref = metadata.$refs['pet.json'];
                    expect(json$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/pet.json')]);

                    // The $refs should all reference different object instances
                    expect(yaml$Ref).not.to.equal(yml$Ref);
                    expect(yaml$Ref).not.to.equal(json$Ref);
                    expect(yml$Ref).not.to.equal(json$Ref);

                    // The $refs should all have the same value
                    expect(yaml$Ref).to.deep.equal(env.resolved.pet);
                    expect(yml$Ref).to.deep.equal(env.resolved.pet);
                    expect(json$Ref).to.deep.equal(env.resolved.pet);

                    done();
                });
            }
        );

        it('should resolve matching nested references to the same object instance',
            function(done) {
                env.parser.parse(env.getPath('good/nested-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    // The "pet" $refs should all point to the same object instance
                    var pet$Ref = metadata.$refs['pet'];
                    expect(pet$Ref).to.equal(metadata.$refs['#/definitions/pet']);

                    // The "error" $refs should all point to the same object instance
                    var error$Ref = metadata.$refs['error'];
                    expect(error$Ref).to.equal(metadata.$refs['#/definitions/error']);

                    // The "errorWrapper" $refs should all point to the same object instance
                    var errorWrapper$Ref = metadata.$refs['errorWrapper'];
                    expect(errorWrapper$Ref).to.equal(metadata.$refs['#/definitions/errorWrapper']);

                    done();
                });
            }
        );

        it('should resolve matching back-references to the same object instance',
            function(done) {
                env.parser.parse(env.getPath('good/external-backrefs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    // The "pet" $refs should all point to the same object instance
                    var pet$Ref = metadata.$refs['pet'];
                    expect(pet$Ref).to.equal(metadata.$refs['#/definitions/pet']);

                    // The "error" $refs should all point to the same object instance
                    var error$Ref = metadata.$refs['error'];
                    expect(error$Ref).to.equal(metadata.$refs['#/definitions/error']);
                    expect(error$Ref).to.equal(metadata.$refs['error-backref.yml']);
                    expect(error$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/error-backref.yml')]);

                    // The "paths" $refs should all point to the same object instance
                    var paths$Ref = metadata.$refs['external-backrefs-path.yml'];
                    expect(paths$Ref).to.equal(metadata.$refs[env.getAbsolutePath('good/external-backrefs-path.yml')]);

                    done();
                });
            }
        );
    });


    describe('File caching tests', function() {

        it('multiple references to an external $ref should only parse the file once',
            function(done) {
                env.parser.parse(env.getPath('good/refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    var paths;
                    if (env.isBrowser) {
                        expect(metadata.files).to.have.lengthOf(0);
                        paths = metadata.urls.map(function(url) { return url.href; });
                    }
                    else {
                        expect(metadata.urls).to.have.lengthOf(0);
                        paths = metadata.files;
                    }

                    expect(paths).to.have.same.members([
                        env.getAbsolutePath('good/refs.yaml'),
                        env.getAbsolutePath('good/error.json'),
                        env.getAbsolutePath('good/pet.yaml')
                    ]);

                    done();
                });
            }
        );

        it('multiple references to an external file should only parse the file once',
            function(done) {
                env.parser.parse(env.getPath('good/external-refs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    var paths;
                    if (env.isBrowser) {
                        expect(metadata.files).to.have.lengthOf(0);
                        paths = metadata.urls.map(function(url) { return url.href; });
                    }
                    else {
                        expect(metadata.urls).to.have.lengthOf(0);
                        paths = metadata.files;
                    }

                    expect(paths).to.have.same.members([
                        env.getAbsolutePath('good/external-refs.yaml'),
                        env.getAbsolutePath('good/error.json'),
                        env.getAbsolutePath('good/pet.yaml'),
                        env.getAbsolutePath('good/pet'),
                        env.getAbsolutePath('good/text.txt'),
                        env.getAbsolutePath('good/image.gif')
                    ]);

                    done();
                });
            }
        );

        it('multiple references and back-references among external files should only parse each file once',
            function(done) {
                env.parser.parse(env.getPath('good/external-backrefs.yaml'), function(err, api, metadata) {
                    if (err) return done(err);

                    var paths;
                    if (env.isBrowser) {
                        expect(metadata.files).to.have.lengthOf(0);
                        paths = metadata.urls.map(function(url) { return url.href; });
                    }
                    else {
                        expect(metadata.urls).to.have.lengthOf(0);
                        paths = metadata.files;
                    }

                    expect(paths).to.have.same.members([
                        env.getAbsolutePath('good/external-backrefs.yaml'),
                        env.getAbsolutePath('good/external-backrefs-path.yml'),
                        env.getAbsolutePath('good/error-backref.yml')
                    ]);

                    done();
                });
            }
        );
    });

});
