exports.viewPlaceShip = (gameManager) => {
    let rowdata = "";
    let board = gameManager.board;
    for (let i = -1; i < board.boardHeight; i++) {
        rowdata += "<tr>";
        for (let j = -1; j < board.boardWidth; j++) {
            if (i < 0 || j < 0) {
                rowdata += '<td style="width: 50px; height: 10px; text-align: center;">';
                if (i * j <= 0) {
                    rowdata += i < 0 ? j : i;
                }
                continue; 
            }
            let ship = board.placeShip.find(ship => ship.x == j && ship.y == i);
            let shipSelected = board.ships.findIndex(sShip => sShip.type == ship.type && sShip.coordinates.find(c => c[0] == j && c[1] == i));
            if (ship.isUsed) {
                let bgcolor = "red";
                switch (ship.type) {
                    case "DD":
                        bgcolor = "#6aa84f";
                        break;
                    case "CA":
                        bgcolor = "#c27ba0";
                        break;
                    case "OR":
                        bgcolor = "#e06666";
                        break;
                    case "BB":
                        bgcolor = "#6d9eeb";
                        break;
                    case "CV":
                        bgcolor = "#ff9900";
                        break;
                    default:
                        break;
                }
                rowdata += '<td bgcolor="'+bgcolor+'" style="width: 50px; height: 50px; text-align: center;">';
                rowdata += ship.type + shipSelected;

            } else {
                rowdata += '<td bgcolor="#cfe2f3" style="width: 50px; height: 50px; text-align: center;">';
                rowdata += '  ';
            }
            rowdata += "</td>"
        }
        rowdata += "</tr>";
    }
    return "<table>"+rowdata+"</table>";
}

exports.viewShoot = (gameManager) => {
    let rowdata = "";
    let board = gameManager.board;
    let shotFired = gameManager.shotFired;
    let rgb_constant = 0;
    let totalShip = board.ships.length;
    for (let i = -1; i < board.boardHeight; i++) {
        rowdata += "<tr>";
        for (let j = -1; j < board.boardWidth; j++) {
            if (i < 0 || j < 0) {
                rowdata += '<td style="width: 50px; height: 50px; text-align: center;">';
                if (i * j <= 0) {
                    rowdata += i < 0 ? j : i;
                }
                continue; 
            }
            let fired = shotFired.placeShoot.find(ship => ship.x == j && ship.y == i);
            if (fired.isShoot) {
                rowdata += '<td id="'+j+"_"+i+'" bgcolor="black" style="color: white; width: 50px; height: 50px; text-align: center;">';
            } else {
                if (fired.priority < 0) {
                    rgb_constant = 255;
                } else {
                    rgb_constant = 255-(fired.priority*3);
                }
                if (rgb_constant < 0) rgb_constant = 255;
                rgb = `rgb(${rgb_constant},${rgb_constant},${rgb_constant})`;
                rowdata += '<td id="'+j+"_"+i+'" style="width: 50px; height: 50px; text-align: center; background-color:'+rgb+'">';
            }
            rowdata += fired.priority;
            rowdata += "</td>"
        }
        rowdata += "</tr>";
    }
    return "<table>"+rowdata+"</table>";
}

exports.viewHitMap = (gameManager) => {
    let rowdata = "";
    let board = gameManager.board;
    let shoot = gameManager.shotFired;
    let hitsMap = shoot.hitsMap;
    let hits = shoot.hits;
    if (hitsMap.length == 0 && hits.length == 0) return "";
    for (let i = 0; i < board.boardHeight; i++) {
        rowdata += "<tr>";
        for (let j = -1; j < board.boardWidth; j++) {
            if (j < 0) {
                rowdata += '<td style="width: 50px; height: 50px; text-align: center;">';
                continue; 
            }
            let hit = hitsMap.find(h => h.x == j && h.y == i);
            if (hit) {
                if (hit.isShoot) {
                    rowdata += '<td bgcolor="red" style="width: 50px; height: 50px; text-align: center;">';
                } else {
                    rowdata += '<td bgcolor="#cfe2f3" style="width: 50px; height: 50px; text-align: center;">';
                }
                rowdata += hit.hitPriority + "|" + hit.priorityBonus + "|" + hit.priority;
            } else {
                rowdata += '<td style="width: 50px; height: 50px; text-align: center;">';
                rowdata += 0;
            }
            rowdata += "</td>"
        }
        rowdata += "</tr>";
    }
    return "<table>"+rowdata+"</table>";
}