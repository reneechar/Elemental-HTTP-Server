const http = require('http');
const fs = require('fs');


const server = http.createServer((request) => {

	request.on('data', (data) => {
		console.log('data',data.toString());
	})


});

server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened a server on ${address.port}`);
});