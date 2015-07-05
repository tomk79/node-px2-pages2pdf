# tomk79/node-px2-pages2pdf


## インストール - Install

```bash
$ npm install px2-pages2pdf --save
```


## 使い方 - Usage

```js
require('px2-pages2pdf')
	.pages2pdf(
		[ // 印刷対象のページ
			'/',
			'/sample_page/',
			'/sample_page/001.html'
		] ,
		'/path/to/pickles2/htdocs/.px_execute.php' ,
		'/path/to/output/dir/' ,
		{
			'progress': function(message, done, max){
				console.log(done+'/'+max+': '+message);
			} ,
			'complete': function(result, err){
				if(result){
					console.log('completed!');
				}else{
					console.log(err);
				}
				process.exit();
			}
		}
	)
;

```

