var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var multer  = require('multer');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser({ keepExtensions: true, uploadDir: "uploads" }));  

/*Configure the multer.*/

app.use(multer({ dest: './uploads/',
 rename: function (fieldname, filename) {
    return filename+Date.now();
  },
onFileUploadStart: function (file) {
  console.log(file.originalname + ' is starting ...')
},
onFileUploadComplete: function (file) {
  console.log(file.fieldname + ' uploaded to  ' + file.path)
  done=true;
}
}));


app.get('/api/healthcard/:food', function (req, res) {
  var r=require("request");
var txUrl = "http://localhost:7474/db/data/transaction/commit";
	function cypher(query,params,cb) {
		request.post({uri:txUrl,
          json:{statements:[{statement:query,parameters:params}]}},
         function(err,res) { cb(err,res.body)})
	}

	var query="MATCH (fd:Food)-[r:CONTAINS]-(ingredients) WHERE fd.name = 'Dosa' RETURN fd.name As Food, SUM(r.Quantity * ingredients.Calories) As Total_Calories, SUM(r.Quantity * ingredients.Carbohydrate) AS Total_Carbohydrate, SUM(r.Quantity* ingredients.Cholestrol) as Total_Cholestrol, SUM(r.Quantity* ingredients.Fiber) as Total_Fiber,SUM(r.Quantity* ingredients.Protein) as Total_Protein"
	var params={limit: 10}
	
	var responseJSON = {};
	var cb=function(err,data) { console.log(JSON.stringify(data)) ; responseJSON = JSON.stringify(data); res.end(mockResponse(null));}

	cypher(query,params,cb)

});

function mockResponse(input){
  var result = {};
  result.name = "Dosa";
  var nutrients = {};
  nutrients.Carbohydrates = 1.0;
  nutrients.Cholestrol = 1.0;
  nutrients.Fiber = 1.0;
  nutrients.Protein = 1.0;
  nutrients.Fat = 1.0;
  result.nutrients = nutrients;
  
  return JSON.stringify(result);
}
app.post('/api/healthcard',function(req,res){
  if(done==true){
    console.log(req.files);
    res.end(mockResponse(null));
  }
});

var server = app.listen(8889, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});