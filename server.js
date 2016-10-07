const http = require('http');
const fs = require('fs');
const qs = require('querystring');

let elementList = ['Hydrogen','Helium']


function updateIndexHTML() {
	let LIs = ''
	elementList.forEach(element => {
		LIs += `  <li>\n      <a href="${'/' + element.toLowerCase() + '.html'}">${element}</a>\n    </li>\n   `;
	})

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>The Elements</h1>
  <h2>These are all the known elements.</h2>
  <h3>These are ${elementList.length}</h3>
  <ol>
  ${LIs}
  </ol>
</body>
</html>`;

}

function justName(pathName) {
	let arr = pathName.split('.');
	arr.pop();
	let name = arr[0];
	console.log('arr',arr);
	name = name.substring(1);
	name = name.charAt(0).toUpperCase() + name.substring(1);
	console.log('name', name);
	return name;
}


function createElementFile(bodyObj, response) {
	if (elementList.indexOf(bodyObj.elementName) > -1 ){
		console.log('that element already exists');
	} else {

		elementList.push(bodyObj.elementName);
		
		fs.readFile('./public/index.html', (err, data) => {

			let indexStream = fs.createWriteStream('./public/index.html');
			indexStream.write(updateIndexHTML());

			let postResponse = '{"success": true }'

			response.writeHead(200, {
				'Content-Type': 'application/json',
				'Content-Length': postResponse.length, 
				'Server': 'nginx/1.4.6 (Ubuntu)',
				'Connection': 'keep-alive'
			})

			response.write(postResponse);
			response.end();
		})
		
	}

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements - ${bodyObj.elementName}</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>${bodyObj.elementName}</h1>
  <h2>${bodyObj.elementSymbol}</h2>
  <h3>${bodyObj.elementAtomicNumber}</h3>
  <p>${bodyObj.elementDescription}</p>
  <p><a href="/">back</a></p>
</body>
</html>`
}

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
			let pathName = './public' + request.url;

			request.on('end',() => {
				const bodyObj = qs.parse(body);

				fs.writeFile(pathName, createElementFile(bodyObj,response));
			})
		})
		

	} else if (request.method === 'PUT') {
		//need some ways to figure out where in your files to add more information
		//use template literal = ${newFile}


	} else if (request.method === 'DELETE') {
		//delete whole files
		console.log('request url', request.url);
		let pathName = './public' + request.url;
		console.log('path', pathName);
		fs.unlink(pathName, (err) => {
			if (err) {
				let postResponse = '{"success" : false}';

				response.writeHead(500, {
					'Content-Type': 'application/json',
					'Content-Length': postResponse.length
				})
				response.write(postResponse);
				response.end();

			} else {
				//remove file from index.html


				elementList.splice(elementList.indexOf(justName(request.url)),1);

				fs.readFile('./public/index.html', (err, data) => {

					let indexStream = fs.createWriteStream('./public/index.html');
					indexStream.write(updateIndexHTML());

					let postResponse = '{"success": true }'

					response.writeHead(200, {
						'Content-Type': 'application/json',
						'Content-Length': postResponse.length, 
						'Server': 'nginx/1.4.6 (Ubuntu)',
						'Connection': 'keep-alive'
					})

					response.write(postResponse);
					response.end();
				});
			}
		});
		
	} else {

	}


});

server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened a server on ${address.port}`);
});