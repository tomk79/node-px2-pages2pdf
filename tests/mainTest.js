var assert = require('assert');
var path = require('path');
var fs = require('fs');
var phpjs = require('phpjs');
var rmdir = require('rmdir');
var _baseDir = __dirname+'/stub_datadir/output_dir/';

function dataClean( cb ){
	cb = cb || function(){};
	if( fs.existsSync(_baseDir) ){
		rmdir( _baseDir, function(){
			cb(!fs.existsSync(_baseDir));
		} );
	}else{
		cb(!fs.existsSync(_baseDir));
	}
	return;
}

describe('テストデータをPDFに変換するテスト', function() {

	it("テストデータをPDFに変換する", function(done) {
		this.timeout(60*1000);

		require('../libs/main.js')
			.pages2pdf(
				[ // 印刷対象のページ
					'/',
					'/sample_pages/',
					'/sample_pages/001.html'
				] ,
				__dirname+'/testdata/htdocs/.px_execute.php' ,
				_baseDir ,
				{
					'progress': function(message, done, max){
						console.log(done+'/'+max+': '+message);
					} ,
					'complete': function(result, err){
						assert.ok( result );
						done();
					}
				}
			)
		;

	});

});

describe('テスト後にデータディレクトリを削除する', function() {

	it("テスト後の後始末", function(done) {
		dataClean(function(result){
			assert.ok( result );
			assert.ok( !fs.existsSync(_baseDir+'db.json') );
			assert.ok( !fs.existsSync(_baseDir) );
			done();
		});

	});

});

