const http = require('http');
const fs = require('fs');


const http.Server = http.createServer((request) => {



});

http.Server.listen({port: 8080}, () => {
	const address = server.address();
	console.log(`Opened a server on ${address.port}`);
});