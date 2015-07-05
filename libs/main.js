/**
 * px2-pages2pdf
 */
module.exports = new (function(){
	var fs = require('fs');
	var path = require('path');
	var mkdirp = require('mkdirp');
	var phantomjs = require('phantomjs');
	var twig = require('twig').twig;
	var utils = require(__dirname+'/utils.js');

	var _pages, _entry_script, _outputDir, _options;

	/**
	 * ページをPDFに出力する
	 */
	this.pages2pdf = function(pages, entry_script, outputDir, options){
		_pages = pages;
		if( typeof(pages) == typeof('') ){
			_pages = [pages];
		}
		_entry_script = entry_script;
		_outputDir = outputDir;
		_options = options||{};

		var px2Server = require(__dirname+'/px2Server.js').start(entry_script, 8080);
		var pdfServer = require(__dirname+'/pdfServer.js').start(_outputDir, 8081);

		utils.iterateFnc([
			function(itFnc, arg){
				// データディレクトリを作成
				mkdirp(_outputDir, function(){
					itFnc.next(arg);
				});
			} ,
			function(itFnc, arg){
				// 各ページのキャプチャを保存
				utils.iterate(
					pages ,
					function(it, row, idx){
						var fileName = utils.md5(row)+'.png';
						// console.log(row);
						utils.spawn(
							phantomjs.path,
							[
								__dirname + '/children/_phantom_capture.js',
								'http://127.0.0.1:8080'+row ,
								_outputDir + '/' + fileName ,
								1000 ,
								600 ,
								'Mozilla/5.0'
							] ,
							{
								complete: function(){
									// console.log(row+' -> completed!');
									it.next();
								}
							}
						);
					},
					function(){
						itFnc.next(arg);
					}
				);

			} ,
			function(itFnc, arg){
				// HTMLを作成して保存
				var htmlParts = '';
				var tplParts = fs.readFileSync(__dirname+'/tpl/page.html');
				tplParts = tplParts.toString();
				// console.log(tplParts);

				utils.iterate(
					pages ,
					function(it, row, idx){
						var fileName = utils.md5(row)+'.png';
						htmlParts += twig({
							data: tplParts
						}).render({'imagePath': './'+fileName});
						// console.log(htmlParts);

						it.next();
					},
					function(){
						var tplFrame = fs.readFileSync(__dirname+'/tpl/pdf.html');
						tplFrame = tplFrame.toString();

						var htmlFin = twig({
							data: tplFrame
						}).render({'content': htmlParts});
						// console.log(htmlFin);

						fs.writeFile(
							_outputDir + '/index.html' ,
							htmlFin ,
							function(){
								itFnc.next(arg);
							}
						);
					}
				);

			} ,
			function(itFnc, arg){
				// PDFを作成して保存

				utils.spawn(
					phantomjs.path,
					[
						__dirname + '/children/_phantom_pdf.js',
						'http://127.0.0.1:8081/index.html' ,
						_outputDir + '/print.pdf' ,
						1000 ,
						600 ,
						'Mozilla/5.0'
					] ,
					{
						complete: function(){
							// console.log(row+' -> completed!');
							itFnc.next();
						}
					}
				);

			} ,
			function(itFnc, arg){
				_options.complete(true);
			}
		]).start({});

	}

})();