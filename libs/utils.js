/**
 * node utilities
 */
(function(exports){
	var _fs = require('fs');
	var _pathCurrentDir = process.cwd();

	/**
	 * システムコマンドを実行する(exec)
	 */
	exports.exec = function(cmd, fnc, opts){
		opts = opts||{};
		if( opts.cd ){
			process.chdir( opts.cd );
		}
		var proc = require('child_process').exec(cmd, fnc);
		if( opts.cd ){
			process.chdir( _pathCurrentDir );
		}
		return proc;
	}

	/**
	 * システムコマンドを実行する(spawn)
	 */
	exports.spawn = function(cmd, cliOpts, opts){
		opts = opts||{};
		if( opts.cd ){
			process.chdir( opts.cd );
		}
		// console.log( opts.cd );
		// console.log( process.cwd() );

		var proc = require('child_process').spawn(cmd, cliOpts);
		if( opts.success ){ proc.stdout.on('data', opts.success); }
		if( opts.error ){ proc.stderr.on('data', opts.error); }
		if( opts.complete ){ proc.on('close', opts.complete); }

		if( opts.cd ){
			process.chdir( _pathCurrentDir );
		}
		// console.log( process.cwd() );

		return proc;
	}

	/**
	 * MD5 encode
	 */
	exports.md5 = function(str){
		return require('crypto').createHash('md5').update(str, 'utf8').digest('hex');
	}

	/**
	 * 直列処理
	 */
	exports.iterate = function(ary, fnc, fncComplete){
		new (function( ary, fnc ){
			this.idx = -1;
			this.idxs = [];
			for( var i in ary ){
				this.idxs.push(i);
			}
			this.ary = ary||[];
			this.fnc = fnc||function(){};
			this.fncComplete = fncComplete||function(){};

			this.next = function(){
				if( this.idx+1 >= this.idxs.length ){
					this.fncComplete();
					return this;
				}
				this.idx ++;
				this.fnc( this, this.ary[this.idxs[this.idx]], this.idxs[this.idx] );
				return this;
			}
			this.next();
		})(ary, fnc);
	}

	/**
	 * 関数の直列処理
	 */
	exports.iterateFnc = function(aryFuncs){
		function iterator( aryFuncs ){
			aryFuncs = aryFuncs||[];

			var idx = 0;
			var funcs = aryFuncs;

			this.start = function(arg){
				arg = arg||{};
				if(funcs.length <= idx){return this;}
				(funcs[idx++])(this, arg);
				return this;
			}

			this.next = this.start;
		}
		return new iterator(aryFuncs);
	}

})(exports);
