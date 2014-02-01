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
            }
        });
    },

    getRepos = function () {
        return makeGetRequest('/orgs/' + cfg.org + '/repos')
            .then(function (data) {
                return JSON.parse(data);
            });
    },

    getLanguages = function (repo) {
        return makeGetRequest('/repos/' + cfg.org + '/' + repo + '/languages')
            .then(function (data) {
                data = JSON.parse(data);
                var total = 0;

                // Add up code bytes per language to get total size
                for (var i in data) {
                    total += data[i];
                }

                // Turn numbers to percentages
                for (var i in data) {
                    data[i] = data[i] / total * 100;
                }

                return data;
            });
    }



gulp.task('default', function () {
    var locals = {};

    getRepos().then(function (repos) {
        var promises = [];

        for (var i in repos) {
            promises.push(getLanguages(repos[i].name).then(function (languages) {
                repos[i].languages = languages;
            }));
        }

        Promise.all(promises).then(function () {
            locals.repos = repos;

            gulp.src('./assets/layout/index.jade')
                .pipe(tasks.jade({
                    locals: locals
                }))
                .pipe(gulp.dest('./'))
        });
    });
})
