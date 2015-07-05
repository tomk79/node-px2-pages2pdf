/**
 * Static HTTP Server
 */
module.exports = new (function(){

	var fs = require('fs');
	var express = require('express'),
		app = express();
	var server = require('http').Server(app);


	this.start = function(htdocs, port, options){

		// middleware
		app.use( express.static(htdocs) );

		// {$_port}番ポートでLISTEN状態にする
		server.listen( port, function(){
			console.log('message: server-standby');
		} );

	}

})();
