var https = require("https");
var url = require('url');
var config_classifier_id = 3734;

function classify(imagePath, callback){
		var post_data = JSON.stringify({"classifier_id":config_classifier_id,"image_url":imagePath});

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
                //console.log('Response: ' + chunk);
                var classify = JSON.parse(chunk);
                var classid = classify.predictions[0].class_name;
				callback(null, classid);
			});
		});
        // post the data
        post_request.write(post_data);
        console.log("next");
        post_request.end();
}
module.exports = {
	classify:classify
}