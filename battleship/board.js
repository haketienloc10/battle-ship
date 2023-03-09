const shipPatterns = require('../resource/shipPatterns');

class Board {
    constructor(data) {
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

    createBoard() {
        for (let i = 0; i < this.boardHeight; i++) {
            this.boardMap.push(Array(this.boardWidth).fill(0));
            for (let j = 0; j < this.boardWidth; j++) {
                let priorityPlace = this.priorityPlace(j, i);
                this.placeShip.push({x: j, y: i, priorityPlace: priorityPlace, isUsed: false});
            }
        }
    }

    priorityPlace(x, y) {
        if (x == 0 || x == this.boardWidth - 1 || y == 0 || y == this.boardHeight - 1) return '0';
        if (x == 1 || x == this.boardWidth - 2 || y == 1 || y == this.boardHeight - 2) return '1';
        if (x == 2 || x == this.boardWidth - 3 || y == 2 || y == this.boardHeight - 3) return '2';
        if (x == 3 || x == this.boardWidth - 4 || y == 3 || y == this.boardHeight - 4) return '3';
        return '';
    }

    placeShips(randomMod=false, count=0) {
        for (let i = 0; i < this.shipsRequest.length; i++) {
            let ship = shipPatterns.find(ship => ship.type === this.shipsRequest[i].type);
            if (ship && this.shipsRequest[i].quantity >= 1) {
                for (let j = 0; j < this.shipsRequest[i].quantity; j++) {
                    let arrTmp = [...this.placeShip.filter(place => !place.isUsed)];
                    if (!randomMod) {
                        switch (ship.type) {
                            case 'DD':
                                arrTmp = arrTmp.filter(i => i.priorityPlace <= '1');
                                break;
                            case 'OR':
                                arrTmp = arrTmp.filter(i => i.priorityPlace == '1' || i.priorityPlace == '2');
                                break;
                            case 'CA':
                                arrTmp = arrTmp.filter(i => i.priorityPlace <= '2');
                                break;
                            case 'BB':
                            case 'CV':
                                arrTmp = arrTmp.filter(i => i.priorityPlace > '0');
                                break;
                            default:
                                break;
                        }
                    }
                    let shipList = this.generate(ship, arrTmp);
                    if (shipList.length == 0) {
                        this.boardMap = [];
                        this.placeShip = [];
                        this.ships = [];
                        this.createBoard();
                        this.placeShips(count>=5, ++count);
                        return;
                    } else {
                        this.ships.push(shipList);
                    }
                }
            }
        }
    }

    generate(ship, placeShip, directionIndex=null, startIndex=null, depth=1) {
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
            this.updatePlaceNeighbor(el[0], el[1]);

        });
        return {"coordinates": coordinates, "type": ship.type};
    }

    updatePlaceNeighbor(x, y) {
        let neighbor = this.placeShip.find(ship => ship.x == x - 1 && ship.y == y);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x + 1 && ship.y == y);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x && ship.y == y - 1);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x && ship.y == y + 1);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x - 1 && ship.y == y - 1);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x - 1 && ship.y == y + 1);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x + 1 && ship.y == y - 1);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
        neighbor = this.placeShip.find(ship => ship.x == x + 1 && ship.y == y + 1);
        if (neighbor && neighbor.isUsed == false) {
            neighbor.type =  '_';
            neighbor.isUsed = true;
        }
    }
}

module.exports = Board