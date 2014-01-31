var gulp = require('gulp'),
    tasks = require('gulp-load-tasks')(),
    fs = require('fs'),
    mde = require('markdown-extra');



gulp.task('test', function () {
    fs.readdir('projects', function (err, files) {
        var projects = [],
            nb = files.length;

        [].forEach.call(files, function (file, i) {
            fs.readFile('projects/' + file, { encoding: 'utf8' }, function (err, markdown) {
                if (! err) {
                    projects.push({
                        content: mde.content(markdown),
                        metadata: mde.metadata(markdown, function (data) {
                            var split = data.split("\n"),
                                i;

                            data = {};

                            for (i in split) {
                                var line = split[i].split(': ');
                                data[line[0]] = line[1];
                            }

                            return data;
                        })
                    });

                    if (i == nb - 1) {
                        console.log(projects);
                    }
                }
            });
        });
    });
});