const shipPatterns = require('../resource/shipPatterns');
const templateShoot = require('../resource/templateShoot');

class Shoot {
    constructor (board) {
        this.height = board.boardHeight;
        this.width = board.boardWidth;
        this.shipsRequest = this.getShipsRequest(board.shipsRequest);
        this.placeShoot = this.getPlaceShoot();
        this.shoots = null;
        this.hits = [];
        this.hitsMap = [];
        this.templateShoot = new Set();
    }

    getShipsRequest(ships) {
        let result = {};
        for (let i = 0; i < ships.length; i++) {
            if (ships[i].quantity > 0) {
                let ship = shipPatterns.find(s => s.type == ships[i].type);
                result[ship.type] = {"cell": ship.directions[0].x.length, "quantity": ships[i].quantity};
            }
        }
        return result;
    }

    shoot(data) {
        if (this.hits.length == 0 && this.templateShoot.size > 0) {
            const setIter = this.templateShoot.entries();
            let getOne = setIter.next().value[0];
            let parse = getOne.split("_");
            this.templateShoot.delete(getOne);
            let x = +parse[0];
            let y = +parse[1];
            if (this.placeShoot.findIndex(i=>i.x==x&&i.y==y&&!i.isShoot) >= 0) return [[x, y]];
            return this.shoot(data);
        }
        let maxShots = this.hits.length == 0 ? data.maxShots : 1;
        let arrShoot = []
        for (let n = 0; n < maxShots; n++) {
            if (this.hits.length == 0) {
                this.placeShoot.sort(this.priority);
                let priorityList = this.placeShoot.filter(i => i.isShoot == false);
                if (arrShoot.length > 0) {
                    let obj = this.getPriority(arrShoot[n-1][0], arrShoot[n-1][1]).arr;
                    for (let i = 0; i < obj.length; i++) {
                        let arr = obj[i];
                        for (let j = 0; j < arr.x.length; j++) {
                            let place = priorityList.find(item => item.x == arr.x[j] && item.y == arr.y[j]);
                            place.priority -= 1;
                        }
                    }
                    priorityList.sort(this.priority);
                    priorityList = priorityList.filter(i => arrShoot.findIndex(a=>a[0]==i.x&&a[1]==i.y)<0);
                }
                priorityList = priorityList.filter(i => i.priority == priorityList[0].priority);
                let shoot = priorityList[0];
                if (priorityList.length > 1) {
                    let sumPriority = this.sumPriority(shoot);
                    for (let i = 1; i < priorityList.length; i++) {
                        let tmpSum = this.sumPriority(priorityList[i]);
                        if (tmpSum > sumPriority) {
                            shoot = priorityList[i];
                            sumPriority = tmpSum;
                        }
                    }
                    console.log("select: " + JSON.stringify(shoot) + " in " + priorityList.length + " item");
                }
                // let idx = Math.floor(Math.random() * priorityList.length);
                // let shoot = priorityList[idx];
                console.log("MISS: shoots_tmp: " + JSON.stringify(this.shoots));
                console.log("shoots_fire: " + JSON.stringify(shoot));
                this.shoots = shoot;
                if (shoot == undefined || (arrShoot.length > 0 && arrShoot.findIndex(a => a[0]==shoot.x && a[1]==shoot.y) >= 0)) {
                    console.log("hits: " + JSON.stringify(this.hits));
                    console.log("hitsMap: " + JSON.stringify(this.hitsMap));
                    console.log("priorityList: " + JSON.stringify(priorityList));
                }
                arrShoot.push([shoot.x, shoot.y]);
            } else {
                this.hitsMap.sort(this.priority);
                let priorityList = this.hitsMap.filter(i => 
                        i.priorityBonus + i.hitPriority >= this.hitsMap[maxShots-1].priorityBonus + this.hitsMap[maxShots-1].hitPriority 
                        && i.isShoot==false);
                let idx = Math.floor(Math.random() * priorityList.length);
                let shoot = priorityList[idx];
                console.log("HIT: shoots_tmp: " + JSON.stringify(this.shoots));
                console.log("shoots_fire: " + JSON.stringify(shoot));
                this.shoots = shoot;
                if (shoot == undefined) {
                    console.log("hits: " + JSON.stringify(this.hits));
                    console.log("hitsMap: " + JSON.stringify(this.hitsMap));
                    console.log("priorityList: " + JSON.stringify(priorityList));
                }
                shoot.isShoot = true;
                arrShoot.push([shoot.x, shoot.y]);
            }
        }
        if (maxShots > 1) {
            this.placeShoot = this.getPlaceShoot(true);
        }
        console.log("arrShoot:" + JSON.stringify(arrShoot));
        return arrShoot;
    }

    sumPriority(shoot) {
        let sumPriority = 0;
        let obj = this.getPriority(shoot.x, shoot.y).arr;
        for (let i = 0; i < obj.length; i++) {
            let arr = obj[i];
            for (let j = 0; j < arr.x.length; j++) {
                sumPriority += 1;
            }
        }
        return sumPriority;
    }

    notify(data) {
        let arrSunkShips = [];
        for (let n = 0; n < data.shots.length; n++) {
            let shots = data.shots[n];
            let coordinate = shots.coordinate;
            if (shots.status == "MISS") {
                this.updatePriority(coordinate[0], coordinate[1]);
                this.placeShoot.find(p => p.x == coordinate[0] && p.y == coordinate[1]).isShoot = true;
                if (this.hits.length > 0) {
                    let lastHit = this.hits[0];
                    this.hitsMap = [];
                    this.generateHitsMap([lastHit]);
                }
            }
            if (shots.status == "HIT") {
                this.hits.push({x: coordinate[0], y: coordinate[1]});
                let sunkShips = data.sunkShips;
                if (sunkShips != null && sunkShips.length > 0 && sunkShips[n]) {
                    arrSunkShips.push(sunkShips[n]);
                } else {
                    if (this.hitsMap.length == 0) {
                        this.generateHitsMap(this.hits);
                    } else {
                        let lastHit = this.hits[0];
                        let obj = this.getPriority(lastHit.x, lastHit.y).arr;
                        this.updateHitsMap(obj);
                    }
                }
            }
        }
        for (let j = 0; j < arrSunkShips.length; j++) {
            let coordinates = arrSunkShips[j].coordinates;
            for (let i = 0; i < coordinates.length; i++) {
                let hit = this.hits.findIndex(h => h.x == coordinates[i][0] && h.y == coordinates[i][1]);
                let place = this.placeShoot.find(p => p.x == this.hits[hit].x && p.y == this.hits[hit].y);
                place.isShoot = true;
                place.isHit = true;
                hit >= 0 && this.hits.splice(hit,1);
            }
            let ships = this.shipsRequest[arrSunkShips[j].type]
            ships.quantity = ships.quantity - 1;
            this.placeShoot = this.getPlaceShoot(true);
            this.hitsMap = [];
            if (this.hits.length > 0) {
                this.generateHitsMap(this.hits);
            }
        }
    }

    getPlaceShoot(isUpdate=false) {
        let placeShoot = [];
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let obj = this.getPriority(j, i);
                let isShoot = isUpdate ? this.placeShoot.find(item => item.x == j && item.y == i).isShoot : false;
                let isHit = isUpdate ? this.placeShoot.find(item => item.x == j && item.y == i).isHit : false;
                let priority = obj.priority;
                placeShoot.push({x: j, y: i, priority: priority, isShoot: isShoot, isHit: isHit});
            }
        }
        return placeShoot;
        // return this.updatePlaceWithHit(placeShoot);
    }

    updatePlaceWithHit(placeShoot) {
        for (let i = 0; i < placeShoot.length; i++) {
            let place = placeShoot[i];
            if (this.checkPriotyAble(placeShoot, place) < 8) place.priority = 0;
        }
        return placeShoot;
    }

    checkPriotyAble(placeShoot, shoot) {
        if (shoot.isShoot) return 0;
        let x = shoot.x;
        let y = shoot.y;
        return this.checkStraightLine(placeShoot,x,y) + this.checkDiagonalLine(placeShoot,x,y);
    }

    checkStraightLine(placeShoot, x, y) {
        let rank = 4;
        let place = placeShoot.find(item => item.x == x-1 && item.y == y && item.isHit == true);
        if (place) rank--;
        place = placeShoot.find(item => item.x == x+1 && item.y == y && item.isHit == true);
        if (place) rank--;
        place = placeShoot.find(item => item.x == x && item.y == y-1 && item.isHit == true);
        if (place) rank--;
        place = placeShoot.find(item => item.x == x && item.y == y+1 && item.isHit == true);
        if (place) rank--;
        return rank;
    }

    checkDiagonalLine(placeShoot, x, y) {
        let rank = 4;
        let place = placeShoot.find(item => item.x == x-1 && item.y == y-1 && item.isHit == true);
        if (place) rank--;
        place = placeShoot.find(item => item.x == x-1 && item.y == y+1 && item.isHit == true);
        if (place) rank--;
        place = placeShoot.find(item => item.x == x+1 && item.y == y-1 && item.isHit == true);
        if (place) rank--;
        place = placeShoot.find(item => item.x == x+1 && item.y == y+1 && item.isHit == true);
        if (place) rank--;
        return rank;
    }

    priority(a, b) {
        if (a.isShoot && b.isShoot)
            return 0;
        if (a.isShoot)
            return 1;   
        if (b.isShoot)
            return -1;

        let priority = 0;
        if (a.priority < b.priority)
            priority = 1;
        else if (a.priority > b.priority)
            priority = -1;
        
        let priority_1 = (a.hitPriority || 0) + (a.priorityBonus || 0);
        let priority_2 = (b.hitPriority || 0) + (b.priorityBonus || 0);

        if (priority_1 < priority_2)
            priority = 1;
        else if (priority_1 > priority_2)
            priority = -1;
        return priority;
    }

    getPriority(x, y) {
        let arr = [];
        let priority = 0;
        let quantity = 0;
        let pattern = {};
        let px, py = 0;
        let arrX, arrY = []
        let n = 1;
        let idx = 0;
        for (let i = 0; i < n; i++) {
            if (this.shipsRequest["DD"] && i < this.shipsRequest["DD"].cell && this.shipsRequest["DD"].quantity > 0) {
                idx = this.shipsRequest["DD"].cell;
                quantity = this.shipsRequest["DD"].quantity;
                pattern = {x: [0,1], y: [0,0]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px+1];
                arrY = [py,py];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
    
                pattern = {x: [0,0], y: [0,1]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px];
                arrY = [py,py+1];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
            }
            if (this.shipsRequest["CA"] && i < this.shipsRequest["CA"].cell && this.shipsRequest["CA"].quantity > 0) {
                idx = this.shipsRequest["CA"].cell;
                quantity = this.shipsRequest["CA"].quantity;
                pattern = {x: [0,1,2], y: [0,0,0]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px+1,px+2];
                arrY = [py,py,py];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
    
                pattern = {x: [0,0,0], y: [0,1,2]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px,px];
                arrY = [py,py+1,py+2];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
            }
            if (this.shipsRequest["BB"] && i < this.shipsRequest["BB"].cell && this.shipsRequest["BB"].quantity > 0) {
                idx = this.shipsRequest["BB"].cell;
                quantity = this.shipsRequest["BB"].quantity;
                pattern = {x: [0,1,2,3], y: [0,0,0,0]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px+1,px+2,px+3];
                arrY = [py,py,py,py];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
    
                pattern = {x: [0,0,0,0], y: [0,1,2,3]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px,px,px];
                arrY = [py,py+1,py+2,py+3];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
            }
            if (this.shipsRequest["OR"] && i < this.shipsRequest["OR"].cell && this.shipsRequest["OR"].quantity > 0) {
                idx = this.shipsRequest["OR"].cell;
                quantity = this.shipsRequest["OR"].quantity;
                pattern = {x: [0,1,0,1], y: [0,0,1,1]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px+1,px,px+1];
                arrY = [py,py,py+1,py+1];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
            }
            if (this.shipsRequest["CV"] && i < this.shipsRequest["CV"].cell && this.shipsRequest["CV"].quantity > 0) {
                idx = this.shipsRequest["CV"].cell;
                quantity = this.shipsRequest["CV"].quantity;
                // pattern_1
                pattern = {x: [0,1,1,2,3], y: [0,0,-1,0,0]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px+1,px+1,px+2,px+3];
                arrY = [py,py,py-1,py,py];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
                // pattern_2
                pattern = {x: [0,0,-1,0,0], y: [0,1,1,2,3]};
                px = x-pattern.x[i];
                py = y-pattern.y[i];
                arrX = [px,px,px-1,px,px];
                arrY = [py,py+1,py+1,py+2,py+3];
                this.isTake(arrX,arrY) && arr.push({x: arrX, y: arrY, quantity: quantity}) && (priority+=1);
            }
            if (n < idx) n = idx;
        }
        return {"arr": arr, "priority": priority};
    }

    isTake(arrX, arrY) {
        if (this.placeShoot && this.placeShoot.length > 0) {
            for (let i = 0; i < arrX.length; i++) {
                let place = this.placeShoot.findIndex(p => p.x == arrX[i] && p.y == arrY[i] && p.isShoot);
                if (place >= 0) return false;
                if (this.checkStraightLine(this.placeShoot, arrX[i], arrY[i]) < 4) return false;
                if (this.checkDiagonalLine(this.placeShoot, arrX[i], arrY[i]) < 4) return false;
            }
        }
        let isTakeX = arrX.findIndex(index => index < 0 || index >= this.width) < 0;
        let isTakeY = arrY.findIndex(index => index < 0 || index >= this.height) < 0;
        return isTakeX && isTakeY;
    }

    updatePriority(x,y) {
        let obj = this.getPriority(x, y).arr;
        for (let i = 0; i < obj.length; i++) {
            let arr = obj[i];
            for (let j = 0; j < arr.x.length; j++) {
                let place = this.placeShoot.find(item => item.x == arr.x[j] && item.y == arr.y[j]);
                place.priority -= 1;
            }
        }
    }

    generateHitsMap(hits) {
        for (let i = 0; i < hits.length; i++) {
            let hit = hits[i];
            let obj = this.getPriority(hit.x, hit.y).arr;
            this.updateHitsMap(obj);
        }
    }

    updateHitsMap(obj) {
        let priorityBonus = [];
        for (let i = 0; i < obj.length; i++) {
            let arr = obj[i];
            let place;
            let tmpBonus = [];
            let countBonus = 0;
            for (let j = 0; j < arr.x.length; j++) {
                place = this.hitsMap.find(item => item.x == arr.x[j] && item.y == arr.y[j]);
                if (place == undefined) {
                    place = {x: arr.x[j], y: arr.y[j], priority:0, hitPriority:0, priorityBonus:0, isShoot:false};
                    this.hitsMap.push(place);
                }
                let isBonus = this.hits.findIndex(hit => hit.x == arr.x[j] && hit.y == arr.y[j]);
                isBonus >= 0 && countBonus++;
                // TODO
                // place.hitPriority += this.checkPriotyAble(place) >= 8 ? 1 : 0;
                place.hitPriority += 1;
                place.isShoot = this.hits.findIndex(h => h.x == place.x && h.y == place.y) >= 0 
                                || this.placeShoot.findIndex(h => h.x == place.x && h.y == place.y && h.isShoot) >= 0;
                tmpBonus.push({...place});
            }
            let point = 0;
            if (countBonus == this.hits.length) {
                if (countBonus == arr.x.length) {
                    point = 0;
                } else if (countBonus == arr.x.length - 1) {
                    point = countBonus * 10 * arr.x.length;
                } else {
                    point = countBonus*arr.x.length;
                }
            } else {
                point = countBonus;
            }
            tmpBonus.map(p => p.priorityBonus = point);
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
}

module.exports = Shoot;