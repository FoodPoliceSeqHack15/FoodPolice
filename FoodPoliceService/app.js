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

app.get('/api/dashboard/:user', function (req, res){	
	console.log('GET:/api/dashboard/');
	var userId = req.params.user;
	var result = {};
	var expected = {};
	expected.calories = '2500';
	expected.carbohydrates = '3000';
	expected.cholestrol = '3000';
	expected.fiber = '2000';
	expected.protein = '1000';
	
	
	var actual = {};
	actual.calories = '1500';
	actual.carbohydrates = '4000';
	actual.cholestrol = '2000';
	actual.fiber = '3000';
	actual.protein = '2000';
	
	result.expected = expected;
	result.actual = actual;
	
	getPersonsNutrientsInfoForPastWeek(userId, function(err,data){
		console.log(data);
		var dataObj = JSON.parse(data);
		actual.calories = dataObj.calories;
		actual.carbohydrates = dataObj.carbohydrates;
		actual.cholestrol = dataObj.cholestrol;
		actual.fiber = dataObj.fiber;
		actual.protein = dataObj.protein;
		return res.end(JSON.stringify(result));
	});
	
});

app.get('/api/recommendation/:user', function (req, res){	
	console.log('GET:/api/recommendation/');
	var userId = req.params.user;
	var result = {};
	var advised = ['Dosa', 'Idli', 'Roti'];
	
	result.advised = advised;
	
	return res.end(JSON.stringify(result));
});

function runQuery(query, callback){

	function cypher(query,params,cb) {
		request.post({uri:neo4j,
		json:{statements:[{statement:query,parameters:params}]}},
		function(err,res) { 
			cb(err,res.body)
		})
	}

	//console.log(query);
	var params={limit: 10}
		
	var responseJSON = {};
	var cb=function(err,data) { 
	//    console.log('Response From Server: ' + data);
	//    console.log(JSON.stringify(data));
		callback(err, data);
	}

	cypher(query,params,cb)

}
function getPersonsNutrientsInfoForPastWeek(personName, callback){
	var query="MATCH (p:Person)-[r:ATE]-(f:Food) WHERE p.name = '" + personName + "'AND r.Date <= 20150830 AND r.Date >= 20150824 RETURN f.name As FoodName, r.Quantity As QuantityAte"
	runQuery(query, function(err, personFoodData){
		//console.log('getPersonsNutrientsInfoForPastWeek: Got person info');
		var result = {};
		result.calories = 0; 
		result.carbohydrates = 0;
		result.cholestrol = 0;
		result.fiber = 0;
		result.protein = 0;

  		var foodItemCount = personFoodData.results[0].data.length;
  		//console.log(foodItemCount);
  		
			function repeater(i){
				if(i < foodItemCount){
					var foodName = personFoodData.results[0].data[i].row[0];
					var quantity = personFoodData.results[0].data[i].row[1];
				
					getFoodNutrientsInfo(foodName, function(err, foodNutrientsData){
			//			console.log("getPersonsNutrientsInfoForPastWeek AftergettingFoodDate: " + JSON.stringify(foodNutrientsData));
						result.calories = result.calories + (quantity * foodNutrientsData.nutrients.calories);
						result.carbohydrates = result.carbohydrates + (quantity * foodNutrientsData.nutrients.carbohydrates);
						result.cholestrol = result.cholestrol + (quantity * foodNutrientsData.nutrients.cholestrol);
						result.fiber = result.fiber + (quantity * foodNutrientsData.nutrients.fiber);
						result.protein = result.protein + (quantity * foodNutrientsData.nutrients.protein);
						repeater(i+1);
					});	
				}
				else{
					callback(err, JSON.stringify(result));
				}
									
			}

			repeater(0);

		
	})
}


function getFoodNutrientsInfo(foodName, callback){
	var query="MATCH (fd:Food)-[r:CONTAINS]-(ingredients) WHERE fd.name='" +  foodName + "' RETURN fd.name As Food, SUM(r.Quantity * ingredients.Calories) As Total_Calories, SUM(r.Quantity * ingredients.Carbohydrate) AS Total_Carbohydrate, SUM(r.Quantity* ingredients.Cholestrol) as Total_Cholestrol, SUM(r.Quantity* ingredients.Fiber) as Total_Fiber,SUM(r.Quantity* ingredients.Protein) as Total_Protein"
	runQuery(query, function(err, foodNutrientsData){
		var result = {};
  		
  		result.food = foodNutrientsData.results[0].data[0].row[0];
  		//console.log(result.food);
		var nutrients = {};
		nutrients.calories = foodNutrientsData.results[0].data[0].row[1]; 
		nutrients.carbohydrates = foodNutrientsData.results[0].data[0].row[2];
		nutrients.cholestrol = foodNutrientsData.results[0].data[0].row[3];
		nutrients.fiber = foodNutrientsData.results[0].data[0].row[4];
		nutrients.protein = foodNutrientsData.results[0].data[0].row[5];
		console.log(nutrients.protein);
		result.nutrients = nutrients;
		callback(err, result);
	})
}


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
    
	console.log('GET /api/healthcard/:food');
	var foodId = req.params.food;
	console.log(foodId);	
	
	var txUrl = neo4j;
	function cypher(query,params,cb) {
		request.post({uri:txUrl,
		json:{statements:[{statement:query,parameters:params}]}},
		function(err,res) { cb(err,res.body)})
	}
	
	var query="MATCH (fd:Food)-[r:CONTAINS]-(ingredients) WHERE fd.name='" +  foodId + "' RETURN fd.name As Food, SUM(r.Quantity * ingredients.Calories) As Total_Calories, SUM(r.Quantity * ingredients.Carbohydrate) AS Total_Carbohydrate, SUM(r.Quantity* ingredients.Cholestrol) as Total_Cholestrol, SUM(r.Quantity* ingredients.Fiber) as Total_Fiber,SUM(r.Quantity* ingredients.Protein) as Total_Protein"
	var params={limit: 10}
		
	var responseJSON = {};
	var cb=function(err,data) {  res.end(parseResponse(data));}

	cypher(query,params,cb)
});

function addFoodItemAddedByPerson(personName, foodItemName, callback){
	var query = "MATCH (u:Person {name:'" + personName + "'}), (r:Food {name:'" + foodItemName +  "'}) CREATE (u)-[:ATE {Date:20150825, Quantity:3.0}]->(r)";
	runQuery(query, function(err){
		console.log('addFoodItemAddedByPerson: Added person food info');
		callback(err);
	})
}


app.post('/api/healthcard',function(req,res){
  console.log('POST:/api/healthcard');
  
  if(done==true){
    var file_path = upload_path + req.files.filename.name;
    console.log(file_path);     
	// Build the post string from an object
	var post_data = JSON.stringify({"classifier_id":37434,"image_url":file_path});
    
    var https_options = url.parse('https://www.metamind.io/vision/classify');
	https_options.method = 'POST';
	https_options.headers = {
            "Authorization": "Basic NKj0szyKbXEMoA77vPXDEANe3lpbOIjQnmTWerRDNVZE0cp1QA",
			'Content-Type': 'application/json',
            'Content-Length': post_data.length
        }
	
	var post_request = https.request(https_options, function(response) {
        response.setEncoding('utf8');
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
			var cb=function(err,data) { 
				addFoodItemAddedByPerson("Sankalp", foodId, function(err){
					console.log("Added to DB: ");
					res.end(parseResponse(data));
				})
			}

			cypher(query,params,cb)
	
		  
        });
    });
	
	// post the data
	post_request.write(post_data);
	console.log("next");
	post_request.end(); 
  }
});

function parseResponse(input){
  console.log(JSON.stringify(input));

  var result = {};
  result.food = input.results[0].data[0].row[0];
  var nutrients = {};
  nutrients.calories = input.results[0].data[0].row[1];
  nutrients.carbohydrates = input.results[0].data[0].row[2];  
  nutrients.cholestrol = input.results[0].data[0].row[3];
  nutrients.fiber = input.results[0].data[0].row[4];
  nutrients.protein = input.results[0].data[0].row[5];
  
  result.nutrients = nutrients;
  return JSON.stringify(result);
}

function parseFoodResponse(input){
  var result = {};
  var parsedInput = JSON.parse(input);
  result.food = parsedInput.data[0].row[0];
  var nutrients = {};
  nutrients.calories = parsedInput.data[0].row[1]; 
  nutrients.carbohydrates = parsedInput.data[0].row[2];
  nutrients.cholestrol = parsedInput.data[0].row[3];
  nutrients.fiber = parsedInput.data[0].row[4];
  nutrients.protein = parsedInput.data[0].row[4];

  result.nutrients = nutrients;
  return JSON.stringify(result);
}

function parsePersonResponse(input){
  var result = {};
  var parsedInput = JSON.parse(input);
  var foodItemCount = parsedInput.data.length;

  for ( var i = 0; i < foodItemCount; i++) {
		var foodName = parsedInput.data[i].row[0];
		var foodNutrientsData = getFoodNutrientsInfo(foodName);
		console.log(JSON.stringify(foodNutrientsData));
		var quantity = parsedInput.data[i].row[1];
  }
  return JSON.stringify(result);
}
function getFoodNutrientsInfo(foodName, callback){
	var query="MATCH (fd:Food)-[r:CONTAINS]-(ingredients) WHERE fd.name='" +  foodName + "' RETURN fd.name As Food, SUM(r.Quantity * ingredients.Calories) As Total_Calories, SUM(r.Quantity * ingredients.Carbohydrate) AS Total_Carbohydrate, SUM(r.Quantity* ingredients.Cholestrol) as Total_Cholestrol, SUM(r.Quantity* ingredients.Fiber) as Total_Fiber,SUM(r.Quantity* ingredients.Protein) as Total_Protein"
	runQuery(query, function(err, foodNutrientsData){
		var result = {};
  		
  		result.food = foodNutrientsData.results[0].data[0].row[0];
  		console.log(result.food);
		var nutrients = {};
		nutrients.calories = foodNutrientsData.results[0].data[0].row[1]; 
		nutrients.carbohydrates = foodNutrientsData.results[0].data[0].row[2];
		nutrients.cholestrol = foodNutrientsData.results[0].data[0].row[3];
		nutrients.fiber = foodNutrientsData.results[0].data[0].row[4];
		nutrients.protein = foodNutrientsData.results[0].data[0].row[5];
		console.log(nutrients.protein);
		result.nutrients = nutrients;
		callback(err, result);
	})
}
var server = app.listen(8889, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
