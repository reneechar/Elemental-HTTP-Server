const http = require('http');
const fs = require('fs');
const qs = require('querystring');

const server = http.createServer((request,response) => {

	if (request.method === 'GET') {
		let pathName;
		let contentType;
		
		if (request.url === '/') {
			pathName = './public/index.html';
			contentType = 'text/html';

		}  else if(request.url.indexOf('.css') > -1){
			pathName = './public' + request.url;
			contentType = 'text/css';
		} else {
			pathName = './public' + request.url;
			contentType = 'text/html';
		}
		
		fs.readFile(pathName, (err,data) => {
			let statusCode;
			if (err) {
				statusCode = 404;
				pathName = './public/404.html'
				fs.readFile(pathName, (e, errData) => {
					response.writeHead(statusCode, {
						'Content-Type': 'text/html',
						'Content-Length': errData.toString().length,
						'Server': 'nginx/1.4.6 (Ubuntu)',
						'Connection': 'keep-alive'
					})
				response.write(errData.toString());
				response.end();

				})
			} else {
				statusCode = 200;
				response.writeHead(statusCode, {
					'Content-Type': contentType,
					'Content-Length': data.toString().length,
					'Server': 'nginx/1.4.6 (Ubuntu)',
					'Connection': 'keep-alive'
				})

				response.write(data.toString());
				response.end();
			}
		})

	} else if (request.method === 'POST') {
		
		request.on('data', (data) => {
			let body =  data.toString();

			request.on('end',() => {
				const bodyObj = qs.parse(body);
				const elementFilePath = './public/' + bodyObj.elementName.toLowerCase() + '.html';
				console.log(elementFilePath);
				const file = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${bodyObj.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${bodyObj.elementName}</h1>
  <h2>H</h2>
  <h3>${bodyObj.elementAtomicNumber}</h3>
  <p>${bodyObj.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`
				fs.writeFile(elementFilePath, file);
			})
		})
		

	} else if (request.method === 'PUT') {
		//need some ways to figure out where in your files to add more information
		//use template literal = ${newFile}

	} else if (request.method === 'DELETE') {
		
	} else {

	}


});

server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened a server on ${address.port}`);
});