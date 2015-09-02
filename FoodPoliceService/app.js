var express = require('express');
var request = require('request');
var multer  = require('multer');
var querystring = require('querystring');
var url = require('url');
var path = require('path');
var fs = require('fs');
var dbService = require('./databaseService.js');
var classificationService = require('./classificationService.js');

var app = express();
//TODO externalize these into properties or command line
var upload_path = "http://ec2-52-3-149-53.compute-1.amazonaws.com:8889/api/healthcard/uploads/"



//Configure the multer
app.use(multer( {   dest: './uploads/',
                    rename: function (fieldname, filename) {
                        return filename+Date.now();
                },
                    onFileUploadStart: function (file) {
                        //console.log(file.originalname + ' is starting ...')
                },
                onFileUploadComplete: function (file) {
                    //console.log(file.fieldname + ' uploaded to  ' + file.path)
                    done=true;
                }
}));

// Service health checkup API
app.get('/api/echo', function (req, res){	
	console.log('echo');
	res.end("echo");
});

// API Dashboard for weekly consumption for user
app.get('/api/dashboard/:userid', function (req, res){
    //console.log('GET:/api/dashboard/');
    var userId = req.params.userid;

    // Hard coded excepted weekly nutrient limits
	var expected = {};
	expected.calories = '2500';
	expected.carbohydrates = '3000';
	expected.cholestrol = '3000';
	expected.fiber = '2000';
	expected.protein = '1000';

    var result = {};
    var actual = {};
    result.expected = expected;
    result.actual = actual;

    // get the weekly intake from the database
	dbService.getPersonsNutrientsInfoForPastWeek(userId, function(err,data){
		result.actual = data;
		return res.end(JSON.stringify(result));
	});
});

// API Meal Recommendation : Get the recommended meal for the user-id
app.get('/api/recommendation/:userid', function (req, res){
	//console.log('GET:/api/recommendation/');
	var userId = req.params.userid;

    // Hard coded response for now
    //TODO implement using the usage data and recommended weekly diet
    var result = {};
	var advised = ['Dosa', 'Idli', 'Roti'];
	result.advised = advised;
	
	return res.end(JSON.stringify(result));
});


// API Image Repository: Get an image by image-name
app.get('/api/healthcard/uploads/:imagename', function (req, res){
	var image = req.params.imagename;
	console.log(image);
	var filePath1 = path.join(__dirname, 'uploads');
	var filePath = path.join(filePath1, image);

    var stat = fs.statSync(filePath);
    //console.log(filePath);
    res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size
    });

    // Stream out the image from the file to response
    var readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

});

// API Get health card for a food (food-id)
app.get('/api/healthcard/:foodid', function (req, res) {
	//console.log('GET /api/healthcard/:foodid');
	var foodId = req.params.foodid;
	//console.log(foodId);

    dbService.getFoodNutrientsInfo(foodId, function(err,data){
        res.end(JSON.stringify(data));
    });
});

// API Get health card for a image
app.post('/api/healthcard',function(req,res){
    //console.log('POST:/api/healthcard');

    if(done==true){

        var file_path = upload_path + req.files.filename.name;
        //console.log(file_path);
        
		classificationService.classify(file_path, function(err, foodName){
			dbService.getFoodNutrientsInfo(foodName, function(err, foodInfo){
                dbService.addFoodItemAddedByPerson("Sankalp", foodName, function(err){
                    //console.log("Added to DB: ");
                    res.end(JSON.stringify(foodInfo));
				});
			});
		});
    }
});

var server = app.listen(8889, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
