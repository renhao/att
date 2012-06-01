var fs = require("fs"),
	url = require('url'),
	http = require('http'),
	smushit = require('node-smushit/lib/smushit');

var saveBinary = function(binaryUrl, path, success, fail){
	var urlObj = url.parse(binaryUrl),
		options = {
			host: urlObj.host,
			port: urlObj.port,
			path: urlObj.pathname
		};

	var request = http.get(options, function(res){
		var data = '';
		res.setEncoding('binary');
		res.on('data', function(chunk){
			data += chunk;
		});
		res.on('end', function(){
			fs.writeFile(path, data, 'binary', function(err){
				if (err){
					fail && fail();
				}else{
					success && success();
				}
			});
		});
	});

	if(fail){
		request.on("error", fail);
	}
};


/**
 * @name smushit
 */
exports.name = "smushit";

/**
 * @option from {String}
 * @option to {String}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, callback){
	var from = options.from,
		to = options.to,
		fileContent;

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
	}
		
	smushit.smushit(from, function(response){
		try{
			response = JSON.parse(response);
		}catch(err){
			return callback(err);
		}
		if(response.error){
			return callback(new Error(response.error));
		}
		saveBinary(response.dest, to, function(){
			callback();
		}, function(err){
			callback(err || new Error("error occur while save image"));
		});
	}, callback);
};