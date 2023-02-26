const Board = require("./board");
const Shoot = require("./shoot");

class GameManager {
    constructor(key, data) {
        this.sessionId = key['x-session-id'];
        this.token = key['x-token'];
        this.board = new Board(data);
        this.shotFired = new Shoot(this.board);
    }
}

module.exports = GameManager