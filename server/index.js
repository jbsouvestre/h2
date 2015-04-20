/*jshint strict: false, node: true, camelcase: false*/
var RSVP = require('rsvp');
var config = require('./config');
var utils = require('./utils');
var colors = require('colors');
var _ = require('underscore');

var countries = require('country-data').countries.all;
var languages = require('country-data').languages.all;

var express = require('express');
var Twitter = require('twitter');

var path = require('path');
var fs = require('fs');

var VERSION = require('../package.json').version;

var app = express();

var langJSON = _(languages).map(function(lang) {
    return {
        id: lang.id,
        name: lang.name
    };
});

app.set('views', './public');
app.set('view engine', 'jade');

app.use('/', express.static(
    path.join(__dirname, '..', 'public')
));

app.get('/search', function(req, res) {

    var query = req.query;
    var search = searchTwitter(query);

    search.then(function(totalCount) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            success: true,
            results: _.extend({
                count: totalCount
            }, query)
        }));
    }, function(err) {
        res.setHeader('Content-Type', 'application/json');
        res.status(400);
        res.end(JSON.stringify({
            success: false,
            results: {
                error: err
            }
        }));
    });
});

app.get('/', function(req, res) {
    res.render('index', {
        version: VERSION
    });
});

app.get('/countries', function(req, res) {
    res.setHeader('Content-Type', 'application/json');

    var countriesJSON = _(countries).map(function(country) {
        return {
            id: country.alpha2,
            name: country.name
        };
    });
    res.end(JSON.stringify(countriesJSON));
});


app.get('/languages', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(langJSON));
});


function searchTwitter(params) {
    var totalCount = 0;
    var client = new Twitter(config);

    var promise = new RSVP.Promise(function(resolve, reject) {

        function parseResults(err, tweets, response) {

            if (err) {
                console.log('[ERROR]'.red, err);
                reject(err);
                return;
            }

            console.log('[DEBUG] Successfully retrieved batch of tweets'.grey);
            console.log('[DEBUG] contains', tweets.statuses.length, 'tweets');
            totalCount += tweets.statuses.length;
            console.log('[DEBUG] Request took : '.grey + tweets.search_metadata.completed_in);
            if (tweets.search_metadata.next_results) {
                return count(query, tweets.search_metadata.next_results);
            } else {
                console.log(tweets.search_metadata);
                console.log('[SUCCESS] Finished !'.green);
                console.log('[SUCCESS] Total: ' + totalCount);
                resolve(totalCount);
            }
        }

        function count(query, next) {
            if (next) {
                console.log('[DEBUG] Starting query on '.grey + next);
                var params = utils.decodeParam(next);
                client.get('search/tweets', params, parseResults);
            }
        }

        console.log('[DEBUG] Initialization'.grey);
        console.log(params);
        var query = _.extend({
            count: 100
        }, params);

        if (query.lang) {
            query.lang = require('country-data').lookup.languages({
                name: query.lang
            })[0].alpha2;

        }

        console.info('[INFO] Searching for '.blue, query);
        client.get('search/tweets', query, parseResults);
    });
    return promise;
}

var server = app.listen(process.env.PORT || 8888, function() {
    console.log('server started at %s', process.env.PORT || 8888);
});