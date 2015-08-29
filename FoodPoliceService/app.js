var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/healthcard/:food', function (req, res) {
  var result = {};
  result.name = req.params.food;
  var nutrients = {};
  nutrients.Carbohydrates = 1.0;
  nutrients.Cholestrol = 1.0;
  nutrients.Fiber = 1.0;
  nutrients.Protein = 1.0;
  nutrients.Fat = 1.0;
  result.nutrients = nutrients;
  
  res.send(JSON.stringify(result));
});

app.post('/healthcard', function (req, res) {
  var result = {};
  result.name = "parsed food type";
  var nutrients = {};
  nutrients.Carbohydrates = 1.0;
  nutrients.Cholestrol = 1.0;
  nutrients.Fiber = 1.0;
  nutrients.Protein = 1.0;
  nutrients.Fat = 1.0;
  result.nutrients = nutrients;
  
  console.log(req.body);
  res.send(JSON.stringify(result));
});

var server = app.listen(8889, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});