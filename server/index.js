/*jshint strict: false, node: true, camelcase: false*/
var RSVP = require('rsvp');
var config = require('./config');
var utils = require('./utils');
var colors = require('colors');
var _ = require('underscore');

var express = require('express');
var Twitter = require('twitter');

var path = require('path');

var app = express();

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
    }, function() {
        console.error('error');
    });


});

app.get('/', function(req, res) {
    res.render('index', {});
});

var totalCount = 0;

function searchTwitter(params) {
    var client = new Twitter(config);

    var promise = new RSVP.Promise(function(resolve, reject) {

        function parseResults(tweets, response) {
            console.log('[DEBUG] Successfully retrieved batch of tweets'.grey);
            console.log('[DEBUG] contains', response.statuses.length, 'tweets');
            totalCount += response.statuses.length;
            console.log('[DEBUG] Request took : '.grey + response.search_metadata.completed_in);
            if (response.search_metadata.next_results) {
                return count(query, response.search_metadata.next_results);
            } else {
                console.log(response.search_metadata);
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

        console.info('[INFO] Searching for '.blue, query);
        client.get('search/tweets', query, parseResults);


    });
    return promise;
}


var server = app.listen(3000, function() {
    console.log('server started');
});