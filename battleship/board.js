const shipPatterns = require('../resource/shipPatterns');

exports.init = (data) => {
    this.boardWidth = data.boardWidth;
    this.boardHeight = data.boardHeight;
    this.shipsRequest = data.ships;

    // init game board
    this.boardMap = [];
    this.placeShip = [];
    this.ships = [];
    this.createBoard();
    return this;
}

exports.createBoard = () => {
    for (let i = 0; i < this.boardHeight; i++) {
        this.boardMap.push(Array(this.boardWidth).fill(0));
        for (let j = 0; j < this.boardWidth; j++) {
            this.placeShip.push({x: j, y: i, isUsed: false});
        }
    }
}

exports.placeShips = () => {
    for (let i = 0; i < this.shipsRequest.length; i++) {
        let ship = shipPatterns.find(ship => ship.type === this.shipsRequest[i].type);
        if (ship && this.shipsRequest[i].quantity >= 1) {
            for (let j = 0; j < this.shipsRequest[i].quantity; j++) {
                this.ships.push(this.generate(ship, [...this.placeShip.filter(place => !place.isUsed)]));
            }
        }
    }
}

exports.generate = (ship, placeShip, directionIndex=null, startIndex=null, depth=1) => {
    if (placeShip.length <= 0) {
        return [];
    }
    if (directionIndex == null) {
        directionIndex = Math.floor(Math.random() * ship.directions.length);
    }
    if (startIndex == null) {
        startIndex = Math.abs(Math.floor(Math.random() * placeShip.length));
    }
    let currentDirection = ship.directions[directionIndex];
    let currentStart = placeShip[startIndex]
    let coordinates = [];
    let tmpPlaceShip = [...placeShip];
    for (let i = 0; i < currentDirection.x.length; i++) {
        let x = currentStart.x + currentDirection.x[i];
        let y = currentStart.y + currentDirection.y[i];
        let placeIndex = tmpPlaceShip.findIndex(ship => ship.x == x && ship.y == y && !ship.isUsed);
        if (placeIndex < 0) {
            if (depth >= ship.directions.length) {
                placeShip.splice(startIndex, 1);
                directionIndex = null;
                startIndex = null;
                depth = 0;
            } else {
                directionIndex = directionIndex + 1 >= ship.directions.length ? 0 : directionIndex + 1;
                depth = depth + 1;
            }
            return this.generate(ship, placeShip, directionIndex, startIndex, depth);
        }
        coordinates.push([x, y]);
        tmpPlaceShip.splice(placeIndex, 1);
    }
    coordinates.forEach(el => {
        let _ship = this.placeShip.find(ship => ship.x == el[0] && ship.y == el[1]);
        _ship.type =  ship.type;
        _ship.isUsed = true;
    });
    return {"coordinates": coordinates, "type": ship.type};
}
