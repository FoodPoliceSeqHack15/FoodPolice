var cool = require('cool-ascii-faces');
var express = require('express');
var url = require('url');
var app = express();
var fs = require("fs");
var request = require('request');

var weeklyCholestrolLimit = 100;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.get('/', function(request, response) {
//  response.render('pages/index');ß
//});

var neo4j = "http://neo4j:foodpolice@ec2-52-3-149-53.compute-1.amazonaws.com:7474/db/data/transaction/commit";

function runQuery(query, callback){

	function cypher(query,params,cb) {
		request.post({uri:neo4j,
		json:{statements:[{statement:query,parameters:params}]}},
		function(err,res) { 
			cb(err,res.body)
		})
	}

	console.log(query);
	var params={limit: 10}
		
	var responseJSON = {};
	var cb=function(err,data) { 
	    console.log('Response From Server: ' + data);
	    console.log(JSON.stringify(data));
		callback(err, data);
	}

	cypher(query,params,cb)

}

function addFoodItemAddedByPerson(personName, foodItemName, callback){
	var query = "MATCH (u:Person {name:'" + personName + "'}), (r:Food {name:'" + foodItemName +  "'}) CREATE (u)-[:ATE {Date:20150825, Quantity:3.0}]->(r)";
	runQuery(query, function(err){
		console.log('addFoodItemAddedByPerson: Added person food info');
		callback(err);
	})
}

function getPersonsNutrientsInfoForPastWeek(personName, callback){
	var query="MATCH (p:Person)-[r:ATE]-(f:Food) WHERE p.name = '" + personName + "'AND r.Date <= 20150830 AND r.Date >= 20150824 RETURN f.name As FoodName, r.Quantity As QuantityAte"
	runQuery(query, function(err, personFoodData){
		console.log('getPersonsNutrientsInfoForPastWeek: Got person info');
		var result = {};
		result.calories = 0; 
		result.carbohydrates = 0;
		result.cholestrol = 0;
		result.fiber = 0;
		result.protein = 0;

  		var foodItemCount = personFoodData.results[0].data.length;
  		console.log(foodItemCount);
  		
			function repeater(i){
				if(i < foodItemCount){
					var foodName = personFoodData.results[0].data[i].row[0];
					var quantity = personFoodData.results[0].data[i].row[1];
				
					getFoodNutrientsInfo(foodName, function(err, foodNutrientsData){
						console.log("getPersonsNutrientsInfoForPastWeek AftergettingFoodDate: " + JSON.stringify(foodNutrientsData));
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





app.get('/', function(request, response){
	var result = ''
	var times = process.env.TIMES || 5
	for(i=0;i < times; i++)
	{
		result += cool();
	}

	response.send(result);

});

app.get('/api/getsummary', function (req, res) {
  	console.log('Getting summary about person: ', req.query.PersonName);
  	// var resultForFoodStat = JSON.parse(fs.readFileSync('food.json'));
  	// var stringifiedString = JSON.stringify(resultForFoodStat)
  	// console.log(stringifiedString);
  	// var parsedString = parseResponse(stringifiedString);
  	// console.log(parsedString);

    addFoodItemAddedByPerson("Sankalp", "Idli", function(err){
    	console.log("End: ");

  		res.send('PersonName: ' + req.query.PersonName);
    })
  	
  	
});

app.get('/cool', function(request, response) {
  response.send(cool());
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


