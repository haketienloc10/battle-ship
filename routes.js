const express = require("express");
const router = express.Router();

// Require controller
const gameController = require("./gameController");

router.post("/*", gameController.getSession);
router.post("/invite", gameController.invite);
router.post("/place-ships", gameController.placeShips);
router.post("/shoot", gameController.shoot);
router.post("/notify", gameController.notify);
router.post("/game-over", gameController.gameOver);
// Test
router.get("/hihihaha", gameController.hihihaha);
router.get("/*", gameController.view);

module.exports = router;