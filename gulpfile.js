var gulp = require('gulp'),
    tasks = require('gulp-load-tasks')(),
    Promise = require('promise'),
    rp = require('request-promise'),
    fs = require('fs'),
    md = require('markdown'),
    mde = require('markdown-extra'),
    auth;



try {
    auth = require('./lib/auth');
} catch (e) {
    auth = null;
}



var cfg = {
        baseUrl: 'https://api.github.com',
        org: 'dddware'
    },

    getRequest = function (uri) {
        return rp({
            uri: cfg.baseUrl + uri,
            headers: {
                'User-Agent': 'gulp'
            },
            auth: auth
        });
    },

    getMembers = function () {
        return getRequest('/orgs/' + cfg.org + '/members')
            .then(function (members) {
                return JSON.parse(members);
            });
    },

    getRepos = function () {
        return getRequest('/orgs/' + cfg.org + '/repos')
            .then(function (repos) {
                repos = JSON.parse(repos);
                var promises = [];

                // Make requests to get current repo's language list
                for (var i in repos) {
                    promises.push(
                        Promise.from(
                            getRequest('/repos/' + cfg.org + '/' + repos[i].name + '/languages')
                                .then(function (data) {
                                    data = JSON.parse(data);

                                    var languages = {},
                                        total = 0;

                                    // Add up bytes to get total codebase size
                                    for (var language in data) {
                                        total += data[language];
                                    }

                                    // Turn numbers into percentages
                                    for (var language in data) {
                                        languages[language.toLowerCase()] = data[language] / total * 100;
                                    }

                                    return languages;
                                })
                        )
                    );
                }

                // Return global promise of above requests resolution
                return Promise.all(promises).then(function (languages) {
                    for (var i in repos) {
                        repos[i].languages = languages[i];
                    }

                    return repos;
                });
            });
    },

    getProjects = function () {
        // Main promise of reading folder and parsing its files
        return new Promise(function (resolve, reject) {
            fs.readdir('assets/projects/', function (err, files) {
                if (err) {
                    reject(err);
                }

                var promises = [],
                    nb = files.length;

                // Markdown files parsing promises
                [].forEach.call(files, function (file, i) {
                    promises.push(
                        new Promise(function (resolve, reject) {
                            fs.readFile('assets/projects/' + file, { encoding: 'utf8' }, function (err, markdown) {
                                if (err) {
                                    reject(err);
                                } else {
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

                                    resolve(project);
                                }
                            });
                        })
                    );
                });

                Promise.all(promises).then(function (projects) {
                    resolve(projects);
                });
            });
        });
    };



gulp.task('github', function () {
    var promises = [getMembers(), getRepos(), getProjects()];

    Promise.all(promises).then(function (results) {
        var locals = {
            members: results[0],
            repos: results[1],
            projects: results[2],
            org: cfg.org
        };

        gulp.src('./assets/layout/index.jade')
            .pipe(tasks.jade({
                locals: locals
            }))
            .pipe(gulp.dest('./'));
    });
});

gulp.task('styles', function () {
    gulp.src('./assets/stylesheets/style.styl')
        .pipe(tasks.stylus())
        .pipe(gulp.dest('./assets/stylesheets'));
});

gulp.task('watch', function() {
    gulp.watch(['./assets/**/*'], ['github', 'styles']);
});

gulp.task('default', ['github', 'styles']);