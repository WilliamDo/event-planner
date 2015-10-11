var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');

var txUrl = "http://localhost:7474/db/data/transaction/commit";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/*****************************************************************************
 * Util
 ****************************************************************************/

function cypher(query, params, callback) {
  var headers = { 'Authorization': 'Basic ' + new Buffer("neo4j:password").toString('base64') };
  request.post({ uri: txUrl, headers: headers, json: { statements: [{statement: query, parameters: params}] } }, function(err, res) {
    callback(err, res.body);
  });
}

function cypherMultiple(statements, callback) {
  console.log("cypherMultiple");
  console.log(statements);
  var headers = { 'Authorization': 'Basic ' + new Buffer("neo4j:password").toString('base64') };
  request.post({ uri: txUrl, headers: headers, json: { statements: statements } }, function(err, res) {
    callback(err, res.body);
  });
}

/*****************************************************************************
 * API
 ****************************************************************************/

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post('/event', function(req, res) {
  var params = {organiser: req.params.name, title: req.body.title, start: req.body.start, end: req.body.end};
  var createQuery = "match (organiser:Person {name: {name}}) create (organiser)-[:ORGANISE]->(:Event {title: {title}, start: {start}, end: {end}})";

  cypher(createQuery, params, function(err, response) {
    res.json(response);
  });

});

app.get('/event/:eventId', function(req, res) {
  var query = "MATCH (e:Event) WHERE ID(e) = {eventId} RETURN e";
  var params = { eventId: parseInt(req.params.eventId) };

  cypher(query, params, function(err, response) {
    if (response.results[0].data.length == 1) {
      res.json(response.results[0].data[0].row[0]);
    } else {
      res.json(response);
    }
  });
});

app.get('/event/:eventId/posts', function(req, res) {
  var query = "match (person:Person)-[:POST]-(comment:Comment)-[:ON]-(event:Event) where id(event) = {eventId} return {name: person.name, message: comment.content, url: person.image, timestamp: comment.timestamp} order by comment.timestamp desc";
  var params = { eventId: parseInt(req.params.eventId) };

  cypher(query, params, function(err, response) {
    var posts = response.results[0].data.map(function(item) {
      return item.row[0];
    });
    res.json(posts);
  });
});

app.post('/event/:eventId/posts', function(req, res) {
  req.body.timestamp = new Date().getTime();
  var params = {eventId: parseInt(req.params.eventId), name: req.body.name, content: req.body.message};
  var createQuery = "match (p:Person {name: {name}}), (event:Event) where id(event) = {eventId} create (comment:Comment {content:{content}, timestamp: timestamp()}) create (p)-[:POST]->(comment) create (comment)-[:ON]->(event)";

  cypher(createQuery, params, function(err, response) {
    res.json(response);
  });

});

app.get('/event/:eventId/people', function(req, res) {
  var query = "match (me:Person {name: 'Lightning'})-[:FRIEND]-(friend:Person) optional match (friend)-[invitation:INVITE]-(event:Event) where id(event) = {eventId} return { name: friend.name, invitation: invitation, url: friend.image }";
  var params = { eventId: parseInt(req.params.eventId) };

  cypher(query, params, function(err, response) {
    var invitations = response.results[0].data.map(function(item) {
      return item.row[0];
    });
    res.json(invitations);
  });
});

app.post('/event/:eventId/people', function(req, res) {
  var invitations = req.body.invitations.split(",");
  var deleteQuery = "match (:Person)-[invitation:INVITE]-(event:Event) where id(event) = {eventId} delete invitation";
  var createQuery = "match (p:Person), (event:Event) where id(event) = {eventId} and p.name in {invitations} create (event)-[:INVITE]->(p)";

  var eventId = parseInt(req.params.eventId);
  var statements = [{statement: deleteQuery, parameters: {eventId: eventId}}, {statement: createQuery, parameters: {eventId: eventId, invitations: invitations}}];

  cypherMultiple(statements, function(err, response) {
    res.json(response);
  });

});

var server = app.listen(3000, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Listening at http://%s:%s', host, port);
});
