const shipPatterns = require('../resource/shipPatterns');
const { generate } = require('./board');

exports.init = (board) => {
    this.height = board.boardHeight;
    this.width = board.boardWidth;
    this.shipsRequest = getShipsRequest(board.shipsRequest);
    this.placeShoot = this.getPlaceShoot();
    this.shoots = null;
    this.hits = [];
    this.hitsMap = [];
    return this;
}

function getShipsRequest(ships) {
    let result = {};
    for (let i = 0; i < ships.length; i++) {
        if (ships[i].quantity > 0) {
            let ship = shipPatterns.find(s => s.type == ships[i].type);
            result[ship.type] = {"cell": ship.directions[0].x.length, "quantity": ships[i].quantity};
        }
    }
    return result;
}

exports.shoot = (data) => {
    if (this.hits.length == 0) {
        this.placeShoot.sort(priority);
        let priorityList = this.placeShoot.filter(i => i.priority == this.placeShoot[0].priority);
        let idx = Math.floor(Math.random() * priorityList.length);
        let shoot = this.placeShoot[idx];
        this.shoots = shoot;
        return [shoot.x, shoot.y];
    }
    this.hitsMap.sort(priority);
    let priorityList = this.hitsMap.filter(i => i.priority == this.hitsMap[0].priority && i.isShoot==false);
    let idx = Math.floor(Math.random() * priorityList.length);
    let shoot = this.hitsMap[idx];
    shoot.isShoot = true;
    this.shoots = shoot;
    return [shoot.x, shoot.y];
}

exports.notify = (data) => {
    let shots = data.shots[0];
    let coordinate = shots.coordinate;
    if (shots.status == "MISS") {
        this.updatePriority(coordinate[0], coordinate[1]);
        this.placeShoot.find(p => p.x == coordinate[0] && p.y == coordinate[1]).isShoot = true;
        if (this.hits.length > 0) {
            this.hitsMap = [];
            this.generateHitsMap();
        }
    } 
    if (shots.status == "HIT") {
        this.hits.push({x: coordinate[0], y: coordinate[1]});
        let sunkShips = data.sunkShips;
        if (sunkShips != null && sunkShips.length > 0) {
            let coordinates = sunkShips[0].coordinates;
            for (let i = 0; i < coordinates.length; i++) {
                let hit = this.hits.findIndex(h => h.x == coordinates[i][0] && h.y == coordinates[i][1]);
                let place = this.placeShoot.find(p => p.x == this.hits[hit].x && p.y == this.hits[hit].y);
                place.isShoot = true;
                hit >= 0 && this.hits.splice(hit,1);
            }
            let ships = this.shipsRequest[sunkShips[0].type]
            ships.quantity = ships.quantity - 1;
            this.placeShoot = this.getPlaceShoot(isUpdate=true);
            this.hitsMap = [];
            if (this.hits.length > 0) {
                this.generateHitsMap();
            }
        } else {
            if (this.hitsMap.length == 0) {
                this.generateHitsMap();
            } else {
                let lastHit = this.hits[this.hits.length-1];
                let obj = this.getPriority(lastHit.x, lastHit.y).arr;
                this.updateHitsMap(obj);
            }
        }
    }
}

exports.getPlaceShoot = (isUpdate=false) => {
    let placeShoot = [];
    for (let i = 0; i < this.height; i++) {
        for (let j = 0; j < this.width; j++) {
            obj = this.getPriority(j, i);
            let isShoot = isUpdate ? this.placeShoot.find(item => item.x == j && item.y == i).isShoot : false
            placeShoot.push({x: j, y: i, priority: obj.priority, isShoot: isShoot});
        }
    }
    return placeShoot;
}

function priority(a, b) {
    if (a.isShoot && a.isShoot)
        return 0;
    if (a.isShoot)
        return 1;   
    if (b.isShoot)
        return -1;  
    if (a.priority < b.priority)
        return 1;
    if (a.priority > b.priority)
        return -1;
    return 0;
}

exports.getPriority = (x, y) => {
    let arr = [];
    let priority = 0;
    let quantity = 0;
    let pattern = {};
    let px, py = 0;
    let n = 1;
    let idx = 0;
    for (let i = 0; i < n; i++) {
        if (this.shipsRequest["DD"] && i < this.shipsRequest["DD"].cell) {
            idx = this.shipsRequest["DD"].cell;
            quantity = this.shipsRequest["DD"].quantity;
            pattern = {x: [0,1], y: [0,0]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px+1];
            arrY = [py,py];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);

            pattern = {x: [0,0], y: [0,1]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px];
            arrY = [py,py+1];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);
        }
        if (this.shipsRequest["CA"] && i < this.shipsRequest["CA"].cell) {
            idx = this.shipsRequest["CA"].cell;
            quantity = this.shipsRequest["CA"].quantity;
            pattern = {x: [0,1,2], y: [0,0,0]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px+1,px+2];
            arrY = [py,py,py];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);

            pattern = {x: [0,0,0], y: [0,1,2]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px,px];
            arrY = [py,py+1,py+2];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);
        }
        if (this.shipsRequest["BB"] && i < this.shipsRequest["BB"].cell) {
            idx = this.shipsRequest["BB"].cell;
            quantity = this.shipsRequest["BB"].quantity;
            pattern = {x: [0,1,2,3], y: [0,0,0,0]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px+1,px+2,px+3];
            arrY = [py,py,py,py];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);

            pattern = {x: [0,0,0,0], y: [0,1,2,3]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px,px,px];
            arrY = [py,py+1,py+2,py+3];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);
        }
        if (this.shipsRequest["OR"] && i < this.shipsRequest["OR"].cell) {
            idx = this.shipsRequest["OR"].cell;
            quantity = this.shipsRequest["OR"].quantity;
            pattern = {x: [0,1,0,1], y: [0,0,1,1]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px+1,px,px+1];
            arrY = [py,py,py+1,py+1];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);
        }
        if (this.shipsRequest["CV"] && i < this.shipsRequest["CV"].cell) {
            idx = this.shipsRequest["CV"].cell;
            quantity = this.shipsRequest["CV"].quantity;
            // pattern_1
            pattern = {x: [0,1,1,2,3], y: [0,0,-1,0,0]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px+1,px+1,px+2,px+3];
            arrY = [py,py,py-1,py,py];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);
            // pattern_2
            pattern = {x: [0,0,-1,0,0], y: [0,1,1,2,3]};
            px = x-pattern.x[i];
            py = y-pattern.y[i];
            arrX = [px,px,px-1,px,px];
            arrY = [py,py+1,py+1,py+2,py+3];
            this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=quantity);
        }
        if (n < idx) n = idx;
    }
    return {"arr": arr, "priority": priority};
}

exports.isTake = (arrX, arrY) => {
    if (this.placeShoot && this.placeShoot.length > 0) {
        for (let i = 0; i < arrX.length; i++) {
            let place = this.placeShoot.findIndex(p => p.x == arrX[i] && p.y == arrY[i] && p.isShoot);
            if (place >= 0) return false;
        }
    }
    let isTakeX = arrX.findIndex(index => index < 0 || index >= this.width) < 0;
    let isTakeY = arrY.findIndex(index => index < 0 || index >= this.height) < 0;
    return isTakeX && isTakeY;
}

exports.updatePriority = (x,y) => {
    let obj = this.getPriority(x, y).arr;
    for (let i = 0; i < obj.length; i++) {
        let arr = obj[i];
        for (let j = 0; j < arr.x.length; j++) {
            let place = this.placeShoot.find(item => item.x == arr.x[j] && item.y == arr.y[j]);
            place.priority -= arr.quantity;
        }
    }
}

exports.generateHitsMap = () => {
    for (let i = 0; i < this.hits.length; i++) {
        let hit = this.hits[i];
        let obj = this.getPriority(hit.x, hit.y).arr;
        this.updateHitsMap(obj);
    }
}

exports.updateHitsMap = (obj) => {
    let priorityBonus = [];
    for (let i = 0; i < obj.length; i++) {
        let arr = obj[i];
        let place;
        let tmpBonus = [];
        let countBonus = 0;
        for (let j = 0; j < arr.x.length; j++) {
            place = this.hitsMap.find(item => item.x == arr.x[j] && item.y == arr.y[j]);
            if (place == undefined || !place) {
                place = {x: arr.x[j], y: arr.y[j], priority:0, hitPriority:0, priorityBonus:0};
                this.hitsMap.push(place);
            }
            tmpBonus.push({...place});
            let isBonus = this.hits.findIndex(hit => hit.x == arr.x[j] && hit.y == arr.y[j]);
            isBonus >= 0 && countBonus++;
            place.hitPriority += arr.quantity;
            place.isShoot = this.hits.findIndex(h => h.x == place.x && h.y == place.y) >= 0 
                            || this.placeShoot.findIndex(h => h.x == place.x && h.y == place.y && h.isShoot) >= 0;
        }
        tmpBonus.map(p => p.priorityBonus = countBonus == this.hits.length ? tmpBonus.length + countBonus : 0);
        priorityBonus = priorityBonus.concat(tmpBonus);
    }
    for (let i=0; i < this.hitsMap.length; i++) {
        let hit = this.hitsMap[i];
        let place = this.placeShoot.find(h => h.x == hit.x && h.y == hit.y);
        let bonus = priorityBonus.filter(h => h.x == hit.x && h.y == hit.y);
        hit.priorityBonus = bonus ? bonus.reduce((x,y)=>x+y.priorityBonus,0) : 0;
        hit.priority = hit.hitPriority + hit.priorityBonus + place.priority;
    }
}