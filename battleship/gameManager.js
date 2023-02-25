var _board = require("./board");
var _shoot = require("./shoot");

var sessionId = null;
var token = null;
var board = null;
var sessions = new Map();

exports.start = (key, data) => {
    this.sessionId = key['x-session-id'];
    this.token = key['x-token'];
    const newSession = {board:_board.init(data)}
    sessions.set(this.sessionId, newSession);
}

/**
 * matching board
 */
exports.prepare = (key) => {
    this.sessionId = key['x-session-id'];
    const session = sessions.get(this.sessionId)
    this.board = session.board;
    this.shotFired = _shoot.init(this.board);
}