var _board = require("./board");
var _shoot = require("./shoot");

var sessionId = null;
var token = null;
var board = null;

exports.start = (key, data) => {
    this.sessionId = key['x-session-id'];
    this.token = key['x-token'];
    this.board = _board.init(data);
    this.shotFired = _shoot.init(this.board);
}

