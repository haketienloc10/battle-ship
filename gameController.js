var GameManager = require("./battleship/gameManager");
var test = require("./test");

var sessions = new Map();
var gameManager;

var PLAYER_ID = "Tau_Chim";

exports.getSession = (req, res, next) => {
    if (req.body.playerId && PLAYER_ID != req.body.playerId) {
        res.end();
        return;
    }
    console.log(req.url + ": " + JSON.stringify(req.body));
    gameManager = sessions.get(req.headers['x-session-id']);
    if (!gameManager && req.url != '/invite') {
        res.json({"success": false, "message": "session-id invalid"});
        console.log('End requests: session-id invalid');
        return;
    } else {
        next();
    }
    gameManager && sessions.set(gameManager.sessionId, gameManager);
};

exports.invite = (req, res) => {
    console.log(`http://localhost:5001/view?sessionId=${req.headers['x-session-id']}`);
    gameManager = new GameManager(req.headers, req.body);
    res.json({"success": true});
}

exports.placeShips = (req, res) => {
    gameManager.board.placeShips();
    res.json({"ships": gameManager.board.ships});
}

exports.shoot = (req, res) => {
    let shoots = gameManager.shotFired.shoot(req.body);
    res.json({"coordinates": shoots});
}

exports.notify = (req, res) => {
    gameManager.shotFired.notify(req.body);
    res.json({"success": true});
}

exports.gameOver = (req, res) => {
    sessions.delete(gameManager.sessionId);
    gameManager = null;
    res.json({ "success": true });
}

exports.view = (req, res) => {
    if (req.query && req.query.sessionId) {
        gameManager = sessions.get(req.query.sessionId);
    }
    let rs = test.viewPlaceShip(gameManager);
    rs += "<br>";
    rs += test.viewShoot(gameManager);
    rs += test.viewHitMap(gameManager);
    res.send(rs);
}