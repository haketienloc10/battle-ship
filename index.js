const http = require('http');
const app = require("./app");
var config = require("./resource/config.json")

const host = config.host;
const port = config.port;

app.set('port', port);
const server = http.createServer(app);
server.on('listening', () => {
    const serv = server.address();
    console.log(`Server is running on http://${serv.address}:${serv.port}`);
});
server.listen(port, host);