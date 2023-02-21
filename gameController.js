var gameManager = require("./battleship/gameManager");
var test = require("./test");

exports.invite = (req, res) => {
    gameManager.start(req.headers, req.body)
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
    res.send("NOT IMPLEMENT");
}

exports.gameOver = (req, res) => {
    res.json({ "success": true });
}

exports.view = (req, res) => {
    let rs = test.viewPlaceShip(gameManager);
    rs += "<br>";
    rs += test.viewShoot(gameManager);
    res.send(rs);
}