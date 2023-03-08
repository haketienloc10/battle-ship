var GameManager = require("./battleship/gameManager");
var test = require("./test");

var sessions = new Map();

var PLAYER_ID = "Tau_Chim";

exports.getSession = (req, res, next) => {
    if (req.body.playerId && PLAYER_ID != req.body.playerId) {
        res.end();
        return;
    }
    console.log(req.url + ": " + JSON.stringify(req.body));
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
    console.log(`http://localhost:5001/view?sessionId=${req.headers['x-session-id']}`);
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

exports.hihihaha = (req, res) => {
    // let gameManager = sessions.get(req.query.sessionId);
    // if (gameManager) {
    //     gameManager.shotFired.hihihaha.add(req.query.data);
    // }
    res.json({ "success": true });
}

exports.view = (req, res) => {
    let gameManager = sessions.get(req.query.sessionId);
    if (gameManager == undefined) {
        gameManager = sessions.values().next().value;
    }
    let rs = '<meta http-equiv="refresh" content="300">'
    rs += '<script>function hihihaha(data){ const xhttp = new XMLHttpRequest(); xhttp.open("GET", "http://localhost:5001/hihihaha?sessionId=999999-4e90-409e-a644-d3b610099f79&data="+data.id); xhttp.send(); }</script>'
    rs += test.viewPlaceShip(gameManager);
    rs += "<br>";
    rs += test.viewShoot(gameManager);
    rs += test.viewHitMap(gameManager);
    res.send(rs);
}