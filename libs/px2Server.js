/**
 * Pickles2 webserver emurator
 */
module.exports = new (function(){

	var fs = require('fs');
	var path = require('path');
	var mime = require('mime');
	var express = require('express'),
		app = express();
	var server = require('http').Server(app);
	var spawn = require('child_process').spawn;


	this.start = function(pxExecute, port, options){

		// middleware
		app.use( function (req, res, next) {
			var mimeType = mime.lookup(req.originalUrl);
			if(req.originalUrl.match(new RegExp('\\/$'))){
				mimeType = mime.lookup(req.originalUrl+'index.html');
			}
			var output = '';
			switch( mime.extension(mimeType) ){
				case 'html':
				case 'htm':
				case 'js':
				case 'css':
					var child = spawn(
						'php',
						[
							pxExecute ,
							'-o', 'json',
							req.originalUrl
						]
					);
					child.stdout.on('data', function(data){
						output += data.toString();
					});
					child.on('close', function(code){
						var parsedJson = JSON.parse(output);
						var document_body = (new Buffer(parsedJson.body_base64, 'base64')).toString();
						res.writeHead(200, 'OK', { 'Content-Type': mimeType });
						res.write(document_body);
						res.end();
					});
					break;

				default:
					var docRoot = path.dirname(pxExecute);
					fs.readFile( docRoot + req.originalUrl, function(error, bin){
						if(error) {
							res.writeHead(404, 'Not Found', {
								'Connection': 'close' ,
								'Content-Type': 'text/html'
							});
							res.write('<!DOCTYPE html>');
							res.write('<html>');
							res.write('<head>');
							res.write('<meta charset="UTF-8" />');
							res.write('<title>404 Not found.</title>');
							res.write('</head>');
							res.write('<body>');
							res.write('<h1>404 Not found.</h1>');
							res.write('<p>File NOT found.</p>');
							res.write('</body>');
							res.write('</html>');
							res.end();
						} else {
							res.writeHead(200, 'OK', { 'Content-Type': mimeType });
							res.write(bin);
							res.end();
						}
					});
					break;
			}
		});


		// {$_port}番ポートでLISTEN状態にする
		server.listen( port, function(){
			console.log('message: server-standby');
		} );

	}

})();
