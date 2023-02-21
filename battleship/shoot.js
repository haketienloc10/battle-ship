
exports.init = (board) => {
    this.boardMap = [...board.boardMap];
    this.placeShip = [...board.placeShip];
    this.height = this.boardMap.length;
    this.width = this.boardMap[0].length;
    this.shoots = [];
    this.hits = [];
    return this;
}

exports.shoot = (data) => {
    if (data.turn <= 5 && this.hits.length <= 0) {
        let idx = Math.abs(Math.floor(Math.random() * (this.placeShip.length / Math.floor(Math.sqrt(this.width)))) + this.width * Math.floor(Math.sqrt(this.width)));
        let shoot = this.placeShip[idx];
        this.placeShip.splice(idx, 1);
        return [shoot.x, shoot.y];
    }
}