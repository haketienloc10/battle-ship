var GameManager = require("./battleship/gameManager");
var test = require("./test");

var sessions = new Map();

exports.getSession = (req, res, next) => {
    if (!sessions.get(req.headers['x-session-id']) && req.url != '/invite') {
        res.json({"success": false, "message": "session-id invalid"});
        console.log('End requests: session-id invalid');
        return;
    } else {
        req.gameManager = sessions.get(req.headers['x-session-id']);
        next();
    }
};

exports.invite = (req, res) => {
    let gameManager = new GameManager(req.headers, req.body);
    sessions.set(gameManager.sessionId, gameManager);
    res.json({"success": true});
}

exports.placeShips = (req, res) => {
    req.gameManager.board.placeShips();
    res.json({"ships": req.gameManager.board.ships});
}

exports.shoot = (req, res) => {
    let shoots = req.gameManager.shotFired.shoot(req.body);
    res.json({"coordinates": shoots});
}

exports.notify = (req, res) => {
    req.gameManager.shotFired.notify(req.body);
    res.json({"success": true});
}

exports.gameOver = (req, res) => {
    sessions.delete(req.headers['x-session-id']);
    res.json({ "success": true });
}

exports.view = (req, res) => {
    let gameManager = sessions.get(req.query.sessionId);
    if (gameManager == undefined) {
        res.send("Ố ồ Bị lỗi rồi!");
        return;
    }
    let rs = test.viewPlaceShip(gameManager);
    rs += "<br>";
    rs += test.viewShoot(gameManager);
    rs += test.viewHitMap(gameManager);
    res.send(rs);
}