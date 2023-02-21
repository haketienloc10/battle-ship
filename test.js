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
            let fired = shotFired.placeShip.find(ship => ship.x == j && ship.y == i);
            if (fired == null) {
                rowdata += '<td bgcolor="red" style="width: 50px; height: 50px; text-align: center;">';
                rowdata += 'X';
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