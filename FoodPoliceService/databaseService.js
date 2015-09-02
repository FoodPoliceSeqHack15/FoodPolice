var request = require('request');
//var neo4j = "http://neo4j:foodpolice@ec2-52-3-149-53.compute-1.amazonaws.com:7474/db/data/transaction/commit";


	var neo4j = "http://localhost:7474/db/data/transaction/commit";

	function getPersonsNutrientsInfoForPastWeek(personName, callback){
        var query="MATCH (p:Person)-[r:ATE]-(f:Food) WHERE p.name = '" + personName + "'AND r.Date <= 20150830 AND r.Date >= 20150824 RETURN f.name As FoodName, r.Quantity As QuantityAte"
        runQuery(query, function(err, personFoodData){
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
                    callback(err, result);
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
	function addFoodItemAddedByPerson(personName, foodItemName, callback){
        var query = "MATCH (u:Person {name:'" + personName + "'}), (r:Food {name:'" + foodItemName +  "'}) CREATE (u)-[:ATE {Date:20150825, Quantity:3.0}]->(r)";
        runQuery(query, function(err){
            console.log('addFoodItemAddedByPerson: Added person food info');
            callback(err);
        })
    }
	
	function runQuery(query, callback){

        function cypher(query,params,cb) {
            request.post({uri:neo4j,
                    json:{statements:[{statement:query,parameters:params}]}},
                function(err,res) {
                    cb(err,res.body)
                })
        }

        var params={limit: 10}

        var responseJSON = {};
        var cb=function(err,data) {
            callback(err, data);
        }

        cypher(query,params,cb)

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
	
	// Exports
	module.exports =  {
		getPersonsNutrientsInfoForPastWeek : getPersonsNutrientsInfoForPastWeek,
		getFoodNutrientsInfo : getFoodNutrientsInfo,
		addFoodItemAddedByPerson : addFoodItemAddedByPerson
	};



    

   