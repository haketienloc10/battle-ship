const http = require('http');
const app = require("./app");

const host = 'localhost';
const port = 5001;

app.set('port', 3000);
const server = http.createServer(app);
server.on('listening', () => {
    const serv = server.address();
    console.log(`Server is running on http://${serv.address}:${serv.port}`);
});
server.listen(port, host);