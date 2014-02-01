var gulp = require('gulp'),
    tasks = require('gulp-load-tasks')(),
    fs = require('fs'),
    md = require('markdown'),
    mde = require('markdown-extra');



var parseOnProjects = function (callback) {
    fs.readdir('projects', function (err, files) {
        var projects = [],
            nb = files.length;

        [].forEach.call(files, function (file, i) {
            fs.readFile('projects/' + file, { encoding: 'utf8' }, function (err, markdown) {
                if (! err) {
                    var project = {
                            content: md.parse(mde.content(markdown))
                        },

                        metadata = mde.metadata(markdown, function (data) {
                            var split = data.split("\n"),
                                i;

                            data = {};

                            for (i in split) {
                                var line = split[i].split(': ');
                                data[line[0]] = eval(line[1]);
                            }

                            return data;
                        });

                    for (var key in metadata) {
                        if (metadata.hasOwnProperty(key)) {
                            project[key] = metadata[key];
                        }
                    }

                    projects.push(project);

                    if (i == nb - 1) {
                        callback(projects);
                    }
                }
            });
        });
    });
};



gulp.task('default', function() {
    var locals = {};

    parseOnProjects(function (projects) {
        locals.projects = projects;
    });

    gulp.src('./assets/layout/index.jade')
        .pipe(tasks.jade({
            locals: locals
        }))
        .pipe(gulp.dest('./'))
})
