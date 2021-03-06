$(function() {
    ace.config.set("basePath", "www/js");
    var sourceEditor = ace.edit("source");
    sourceEditor.setTheme("ace/theme/github");
    var session = sourceEditor.getSession();
    session.setTabSize(2);
    session.setMode("ace/mode/yaml");
    session.on('change', hideResults);

    var resultsEditor = ace.edit("results-output");
    resultsEditor.setTheme("ace/theme/github");
    resultsEditor.setReadOnly(true);
    resultsEditor.getSession().setMode("ace/mode/json");

    $('#parse').click(parse);

    var api, metadata, err;

    function parse() {
        hideResults();

        try {
            var options = {
                parseYaml: $('#parseYaml')[0].checked,
                resolve$Refs: $('#resolveRefs')[0].checked,
                resolveExternal$Refs: $('#resolveExternalRefs')[0].checked,
                dereference$Refs: $('#dereferenceRefs')[0].checked,
                validateSchema: $('#validateSchema')[0].checked,
                strictValidation: $('#strictValidation')[0].checked
            };

            var preParser = options.parseYaml ? swagger.parser.__.safeLoad : JSON.parse;
            var obj = preParser(sourceEditor.getValue());
            swagger.parser.parse(obj, options, function(e, a, m) {
                err = e;
                api = a;
                metadata = m;
                showResults();
            });
        }
        catch (e) {
            err = e;
            showResults();
        }
    }

    function showResults() {
        if (err) {
            $('#results-error').removeClass('hidden')[0].scrollIntoView();
            $('#results-error-message').html(err.message.replace(/\n/g, '<br/>'));
        }
        else {
            $('#results-success').removeClass('hidden')[0].scrollIntoView();
            $('#results-refs').text(Object.keys(metadata.$refs).length);
            $('#results-files').text(metadata.urls.length);
            $('#results-output').removeClass('hidden');
            resultsEditor.setValue(JSON.stringify(api, null, 2));
            resultsEditor.selection.clearSelection();
        }

        $('#results').addClass('in');
    }

    function hideResults() {
        $('#results').removeClass('in');
        $('#results-success,#results-error,#results-output').addClass('hidden');
    }
});
