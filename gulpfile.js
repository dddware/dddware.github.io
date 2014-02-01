var gulp = require('gulp'),
    tasks = require('gulp-load-tasks')(),
    Promise = require('promise'),
    rp = require('request-promise');



// GitHub API endpoints

var cfg = {
        baseUrl: 'https://api.github.com',
        org: 'dddware'
    },

    makeGetRequest = function (uri) {
        return rp({
            uri: cfg.baseUrl + uri,
            headers: {
                'User-Agent': 'gulp'
            },
            auth: { // TODO: remove this once we're good to go (60 requests/hour will be quite enough for an occasional build)
                user: 'neemzy',
                pass: 'L375payforit'
            }
        });
    },

    getRepos = function () {
        return makeGetRequest('/orgs/' + cfg.org + '/repos')
            .then(function (repos) {
                repos = JSON.parse(repos);
                var promises = [];

                // Make requests to get current repo's language list
                for (var i in repos) {
                    promises.push(
                        Promise.from(
                            makeGetRequest('/repos/' + cfg.org + '/' + repos[i].name + '/languages')
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
    };



gulp.task('projects', function () {
    var locals = {};

    getRepos().then(function (repos) {
        locals.repos = repos;

        gulp.src('./assets/layout/index.jade')
            .pipe(tasks.jade({
                locals: locals
            }))
            .pipe(gulp.dest('./'))
    });
});

gulp.task('styles', function () {
    gulp.src('./assets/stylesheets/style.styl')
        .pipe(tasks.stylus())
        .pipe(gulp.dest('./assets/stylesheets'));
});

gulp.task('default', function () {
    gulp.run('projects', 'styles');
});