var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var multer  = require('multer');
var https = require("https");
var querystring = require('querystring');
var url = require('url');
var path = require('path');
var fs = require('fs');

var upload_path = "http://ec2-52-3-149-53.compute-1.amazonaws.com:8889/api/healthcard/uploads/"
var neo4j = "http://neo4j:foodpolice@ec2-52-3-149-53.compute-1.amazonaws.com:7474/db/data/transaction/commit";

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


app.get('/api/echo', function (req, res){	
	console.log('echo');
	res.end("echo");
});

app.get('/api/healthcard/uploads/:image', function (req, res){	
	var image = req.params.image;
	console.log(image);
	var filePath1 = path.join(__dirname, 'uploads');
	var filePath = path.join(filePath1, image);
      console.log(filePath);
    var stat = fs.statSync(filePath);

    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size
    });

    var readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);

});

app.get('/api/healthcard/:food', function (req, res) {
    
	// Build the post string from an object
	var post_data = JSON.stringify({"classifier_id":37403,"image_url":"https://shainashealy.files.wordpress.com/2013/05/img_1312.jpg"});
    
    var https_options = url.parse('https://www.metamind.io/vision/classify');
	https_options.method = 'POST';
	https_options.headers = {
            "Authorization": "Basic NKj0szyKbXEMoA77vPXDEANe3lpbOIjQnmTWerRDNVZE0cp1QA",
			'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
	
	console.log(https_options);
	
	var post_request = https.request(https_options, function(response) {
        response.setEncoding('utf8');
		console.log("hello");
        response.on('data', function (chunk) {
			console.log('Response: ' + chunk);
			var classify = JSON.parse(chunk);	
			var txUrl = neo4j;
			function cypher(query,params,cb) {
				request.post({uri:txUrl,
				json:{statements:[{statement:query,parameters:params}]}},
				function(err,res) { cb(err,res.body)})
			}
		
			var foodId = req.params.food;
			var query="MATCH (fd:Food)-[r:CONTAINS]-(ingredients) WHERE fd.name='" +  classify.predictions[0].class_name + "' RETURN fd.name As Food, SUM(r.Quantity * ingredients.Calories) As Total_Calories, SUM(r.Quantity * ingredients.Carbohydrate) AS Total_Carbohydrate, SUM(r.Quantity* ingredients.Cholestrol) as Total_Cholestrol, SUM(r.Quantity* ingredients.Fiber) as Total_Fiber,SUM(r.Quantity* ingredients.Protein) as Total_Protein"
			var params={limit: 10}
		
			var responseJSON = {};
			var cb=function(err,data) { console.log(JSON.stringify(data)); res.end(parseResponse(data));}

			cypher(query,params,cb)
	
		  
        });
    });
	
	// post the data
	post_request.write(post_data);
	console.log("next");
	post_request.end();
	
	

});

function parseResponse(input){
  var result = {};
  result.food = input.results[0].data[0].row[0];
  var nutrients = {};
  nutrients.calories = input.results[0].data[0].row[1]; 
  nutrients.cholestrol = input.results[0].data[0].row[2];
  nutrients.fiber = input.results[0].data[0].row[3];
  nutrients.protein = input.results[0].data[0].row[4];
  
  result.nutrients = nutrients;
  return JSON.stringify(result);
}
app.post('/api/healthcard',function(req,res){
  console.log('POST:/api/healthcard');
  if(done==true){
    var file_path = upload_path + req.files.filename.name;
    console.log(file_path);     
	// Build the post string from an object
	var post_data = JSON.stringify({"classifier_id":37403,"image_url":file_path});
    
    var https_options = url.parse('https://www.metamind.io/vision/classify');
	https_options.method = 'POST';
	https_options.headers = {
            "Authorization": "Basic NKj0szyKbXEMoA77vPXDEANe3lpbOIjQnmTWerRDNVZE0cp1QA",
			'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
	
	console.log(https_options);
	
	var post_request = https.request(https_options, function(response) {
        response.setEncoding('utf8');
		console.log("hello");
        response.on('data', function (chunk) {
			console.log('Response: ' + chunk);
			var classify = JSON.parse(chunk);	
			var txUrl = neo4j;
			function cypher(query,params,cb) {
				request.post({uri:txUrl,
				json:{statements:[{statement:query,parameters:params}]}},
				function(err,res) { cb(err,res.body)})
			}
		
			var foodId = req.params.food;
			var query="MATCH (fd:Food)-[r:CONTAINS]-(ingredients) WHERE fd.name='" +  classify.predictions[0].class_name + "' RETURN fd.name As Food, SUM(r.Quantity * ingredients.Calories) As Total_Calories, SUM(r.Quantity * ingredients.Carbohydrate) AS Total_Carbohydrate, SUM(r.Quantity* ingredients.Cholestrol) as Total_Cholestrol, SUM(r.Quantity* ingredients.Fiber) as Total_Fiber,SUM(r.Quantity* ingredients.Protein) as Total_Protein"
			var params={limit: 10}
		
			var responseJSON = {};
			var cb=function(err,data) { console.log(JSON.stringify(data)); res.end(parseResponse(data));}

			cypher(query,params,cb)
	
		  
        });
    });
	
	// post the data
	post_request.write(post_data);
	console.log("next");
	post_request.end(); 
  }
});

var server = app.listen(8889, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
