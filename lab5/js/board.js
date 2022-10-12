const BOARD_SIZE = 8;

const Point = {
    x: Number,
    y: Number
}

const MoveType = {
    MOVEMENT: 'green',
    ATTACK: 'red'
}

const PieceType = {
    WHITE: {style: 'white-piece', side: 'white'},
    BLACK: {style: 'black-piece', side: 'black'},
    WHITE_LADY: {style: 'white-lady', side: 'white'},
    BLACK_LADY: {style: 'black-lady', side: 'black'}
}

const Direction = {
    UP_LEFT: {x: -1, y: 1},
    UP_RIGHT: {x: 1, y: 1},
    DOWN_LEFT: {x: -1, y: -1},
    DOWN_RIGHT: {x: 1, y: -1}
}

const Cell = {
    location: Point,
    piece: PieceType | null,
    availableForMove: []
}

const boardLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const defaultPiecesLocations = [
    { location: {x: 0, y: 0}, type: PieceType.WHITE },
    { location: {x: 2, y: 0}, type: PieceType.WHITE },
    { location: {x: 4, y: 0}, type: PieceType.WHITE },
    { location: {x: 6, y: 0}, type: PieceType.WHITE },
    { location: {x: 1, y: 1}, type: PieceType.WHITE },
    { location: {x: 3, y: 1}, type: PieceType.WHITE },
    { location: {x: 5, y: 1}, type: PieceType.WHITE },
    { location: {x: 7, y: 1}, type: PieceType.WHITE },
    { location: {x: 0, y: 2}, type: PieceType.WHITE },
    { location: {x: 2, y: 2}, type: PieceType.WHITE },
    { location: {x: 4, y: 2}, type: PieceType.WHITE },
    { location: {x: 6, y: 2}, type: PieceType.WHITE },
    { location: {x: 1, y: 7}, type: PieceType.BLACK },
    { location: {x: 3, y: 7}, type: PieceType.BLACK },
    { location: {x: 5, y: 7}, type: PieceType.BLACK },
    { location: {x: 7, y: 7}, type: PieceType.BLACK },
    { location: {x: 0, y: 6}, type: PieceType.BLACK },
    { location: {x: 2, y: 6}, type: PieceType.BLACK },
    { location: {x: 4, y: 6}, type: PieceType.BLACK },
    { location: {x: 6, y: 6}, type: PieceType.BLACK },
    { location: {x: 1, y: 5}, type: PieceType.BLACK },
    { location: {x: 3, y: 5}, type: PieceType.BLACK },
    { location: {x: 5, y: 5}, type: PieceType.BLACK },
    { location: {x: 7, y: 5}, type: PieceType.BLACK },
]

const firstExamplePiecesLocations = [
    { location: {x: 5, y: 3}, type: PieceType.WHITE },
    { location: {x: 7, y: 3}, type: PieceType.WHITE },
    { location: {x: 2, y: 0}, type: PieceType.BLACK_LADY },
    { location: {x: 1, y: 7}, type: PieceType.BLACK },
    { location: {x: 2, y: 4}, type: PieceType.BLACK },
    { location: {x: 2, y: 6}, type: PieceType.BLACK },
    { location: {x: 4, y: 6}, type: PieceType.BLACK },
    { location: {x: 7, y: 5}, type: PieceType.BLACK },
]

const secondExamplePiecesLocations = [
    { location: {x: 4, y: 2}, type: PieceType.WHITE },
    { location: {x: 3, y: 3}, type: PieceType.BLACK },
    { location: {x: 3, y: 5}, type: PieceType.BLACK },
    { location: {x: 1, y: 1}, type: PieceType.WHITE },
];

const cells = document.querySelectorAll("td");

const gameRecordElement = document.getElementById("game-record");
const errorTextElement = document.getElementById("record-error");

function pointToId(point) {
    return point.x.toString() + point.y.toString();
}

function idToPoint(id) {
    return {
        x: Number(id[0]),
        y: Number(id[1]),
    };
}

function pointsEqual(a, b) {
    return a.x === b.x && a.y === b.y;
}

function findElementByPoint(point) {
    let id = pointToId(point);

    for (cell of cells) {
        if (cell.id === id) {
            return cell;
        }
    }

    return null;
}

function getPieceByPointDefaultBoard(point) {
    return defaultPiecesLocations.find(dpl => pointsEqual(dpl.location, point))?.type ?? null;
}

function getPieceByPointFirstExampleBoard(point) {
    return firstExamplePiecesLocations.find(dpl => pointsEqual(dpl.location, point))?.type ?? null;
}

function getPieceByPointSecondExampleBoard(point) {
    return secondExamplePiecesLocations.find(dpl => pointsEqual(dpl.location, point))?.type ?? null;
}

class Board {
    turnMode;
    isWhiteTurn;
    turnCompleted;
    mustAttack;
    turnCount;

    cells = new Array(BOARD_SIZE);
    gameRecording = [];
    activeCell = Cell | null;
    currentTurn = {
        start: Point | null,
        visited: [],
        pieceType: PieceType
    };

    constructor() {
        this.turnMode = false;
        this.isWhiteTurn = true;
        this.turnCompleted = false;
        this.turnCount = 0;
        
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i] = new Array(BOARD_SIZE);
            for (let j = 0; j < this.cells[i].length; j++) {
                let location = {
                    x: j,
                    y: i
                }

                let element = findElementByPoint(location);
                element.addEventListener("click", () => this.handleBoardEvent(element));
                
                this.cells[i][j] = {
                    location: location,
                    piece: getPieceByPointDefaultBoard(location),
                    availableForMove: []
                }
            }
        }

        this.updateAvailable();
        this.updateAllCellsView();
        updateTurnInfo(this.isWhiteTurn);

        clearGameRecord();
    }

    movePiece(emptyCell) {
        this.endHighlightAvailableCells();

        emptyCell.piece = this.activeCell.piece;
        this.activeCell.piece = null;

        this.activeCell = emptyCell;

        if (this.activeCell.piece === PieceType.WHITE && this.activeCell.location.y === 7) {
            this.activeCell.piece = PieceType.WHITE_LADY;
        } else if (this.activeCell.piece === PieceType.BLACK && this.activeCell.location.y === 0) {
            this.activeCell.piece = PieceType.BLACK_LADY;
        }
    }

    isWhitePiece(cell) {
        return cell.piece?.side === PieceType.WHITE.side;
    }

    isBlackPiece(cell) {
        return cell.piece?.side === PieceType.BLACK.side;
    }

    isLadyPiece(cell) {
        return cell.piece === PieceType.WHITE_LADY || cell.piece === PieceType.BLACK_LADY;
    }

    updateAvailable() {
        this.mustAttack = false;

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                let cell = this.cells[i][j];
                cell.availableForMove = [];

                if (this.isWhiteTurn && this.isWhitePiece(cell) || !this.isWhiteTurn && this.isBlackPiece(cell)) {
                    this.setAvailableForAttack(cell);

                    if (cell.availableForMove.length > 0) {
                        this.mustAttack = true;
                    }
                }
            }
        }

        for (let i = 0; i< BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                let cell = this.cells[i][j];

                if (!this.mustAttack &&
                     (this.isWhiteTurn && this.isWhitePiece(cell) || 
                     !this.isWhiteTurn && this.isBlackPiece(cell))) {
                    this.setAvailableForMovement(cell);
                }
            }
        }
    }

    setAvailableForAttack(cell) {
        const directions = [Direction.UP_LEFT, Direction.UP_RIGHT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT];

        let location = cell.location;

        if (this.isLadyPiece(cell)) {
            directions.forEach(direction => {
                let offset = {
                    x: direction.x,
                    y: direction.y
                };

                while (this.inBoard(cell.location.x + offset.x, cell.location.y + offset.y) && !this.isOpponent(cell, offset)) {
                    offset.x += direction.x;
                    offset.y += direction.y;
                }

                if (this.isOpponent(cell, offset) &&
                     this.isEmpty(cell.location.x + offset.x + direction.x, cell.location.y + offset.y + direction.y)) {
                    cell.availableForMove.push({
                        location: {
                            x: cell.location.x + offset.x + direction.x,
                            y: cell.location.y + offset.y + direction.y
                        },
                        type: MoveType.ATTACK
                    });
                }
            });
        } else {
            directions.forEach(direction => {
                if (this.isOpponent(cell, direction) && this.isEmpty(location.x + 2 * direction.x, location.y + 2 * direction.y)) {
                    cell.availableForMove.push({
                        location: {
                            x: location.x + 2 * direction.x, 
                            y: location.y + 2 * direction.y
                        },
                        type: MoveType.ATTACK
                    });
                }
            });
        }
    }

    setAvailableForMovement(cell) {
        let directions = [];

        if (cell.piece === PieceType.WHITE) {
            directions.push(Direction.UP_LEFT, Direction.UP_RIGHT);
        } else if (cell.piece === PieceType.BLACK) {
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT);
        } else if (this.isLadyPiece(cell)) { 
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT, Direction.UP_LEFT, Direction.UP_RIGHT);
        }

        if (this.isLadyPiece(cell)) {
            directions.forEach(direction => {
                let offset = {
                    x: direction.x,
                    y: direction.y
                };

                while (this.isEmpty(cell.location.x + offset.x, cell.location.y + offset.y)) {
                    cell.availableForMove.push({
                        location: {
                            x: cell.location.x + offset.x,
                            y: cell.location.y + offset.y
                        },
                        type: MoveType.MOVEMENT
                    });
                    offset.x += direction.x;
                    offset.y += direction.y;
                }
            });
        } else {
            directions.forEach(direction => {
                let point = {
                    x: cell.location.x + direction.x,
                    y: cell.location.y + direction.y
                };

                if (this.isEmpty(point.x, point.y)) {
                    cell.availableForMove.push({
                        location: point,
                        type: MoveType.MOVEMENT
                    })
                }
            });
        }
    }

    selectedOwnTeamPiece(cell) {
        return cell.piece && (this.isWhiteTurn && cell.piece.side === PieceType.WHITE.side ||
         !this.isWhiteTurn && cell.piece.side === PieceType.BLACK.side);
    }

    handleBoardEvent(selectedElement) {
        let selectedCell = this.findById(selectedElement.id);

        if (this.turnMode && this.activeCell?.availableForMove.find(el => pointsEqual(el.location, selectedCell.location))) {
            this.doTurn(selectedCell);

            if (this.currentTurn.visited.find(visitedCell => visitedCell.takenEnemy)) {
                this.setAvailableForAttack(selectedCell);
            }

            this.turnCompleted = selectedCell.availableForMove.length > 0 ? false : true;

            if (!this.turnCompleted) {
                this.highlightAvailableCells();
            }

            this.updateAllCellsView();
        } else if (this.selectedOwnTeamPiece(selectedCell) && selectedCell.availableForMove.length > 0) {
            this.toTurnMode(selectedElement);
        }
    }

    doTurn(selectedCell) {
        if (!this.currentTurn.start) {
            this.currentTurn.start = this.activeCell.location;
            this.currentTurn.visited = [];
        }
        this.currentTurn.pieceType = this.activeCell.piece;

        let visitedCell = {
            location: selectedCell.location,
            takenEnemy: null
        };

        let turnType = this.activeCell.availableForMove.find(el => pointsEqual(el.location, selectedCell.location)).type;

        if (turnType === MoveType.ATTACK) {
            let enemyDirection = this.getDirection(selectedCell);

            let enemyLocation = {
                x: selectedCell.location.x - enemyDirection.x,
                y: selectedCell.location.y - enemyDirection.y
            };

            visitedCell.takenEnemy = {
                location: enemyLocation,
                piece: this.cells[enemyLocation.y][enemyLocation.x].piece
            };

            this.cells[enemyLocation.y][enemyLocation.x].piece = null;
        }

        this.currentTurn.visited.push(visitedCell);

        this.movePiece(selectedCell);

        selectedCell.availableForMove = [];
    }

    getDirection(selectedCell) {
        let x = selectedCell.location.x > this.activeCell.location.x ? 1 : -1;
        let y = selectedCell.location.y > this.activeCell.location.y ? 1 : -1;

        return {
            x: x,
            y: y
        };
    }

    cancelTurn() {
        if (this.turnCompleted) {
            this.turnCompleted = false;

            let lastVisitedLocation = this.currentTurn.visited[this.currentTurn.visited.length - 1].location;

            let startCell = this.findByLocation(this.currentTurn.start);
            let finishCell = this.findByLocation(lastVisitedLocation);

            if (this.activeCell) {
                this.endHighlightAvailableCells();
            }

            this.activeCell = finishCell;

            this.movePiece(startCell);

            this.currentTurn.visited.forEach(visitedCell => {
                if (visitedCell.takenEnemy) {
                    this.findByLocation(visitedCell.takenEnemy.location).piece = visitedCell.takenEnemy.piece
                }
            });

            this.activeCell = startCell;
            this.turnMode = true;

            this.updateAvailable();

            this.updateAllCellsView();
            this.highlightAvailableCells();

            this.currentTurn = {
                start: null,
                visited: [],
                pieceType: null
            };
        }
    }

    findById(id) {
        let location = idToPoint(id);

        return this.findByLocation(location); 
    }

    findByLocation(location) {
        return this.inBoard(location.x, location.y) ? this.cells[location.y][location.x] : null;
    }

    highlightAvailableCells() {
        highlightWithColor(this.activeCell.location, "yellow");
        this.activeCell.availableForMove.forEach(el => highlightWithColor(el.location, el.type));
    }

    endHighlightAvailableCells() {
        endHighlight(this.activeCell.location);
        this.activeCell.availableForMove.forEach(el => endHighlight(el.location));
    }

    toNormalMode(selectedElement) {
        selectedElement.style.removeProperty("background-color");

        this.turnMode = false;

        this.resetActiveCell();
    }

    toTurnMode(selectedElement) {
        if (this.activeCell) {
            this.endHighlightAvailableCells();
        }
        selectedElement.style.backgroundColor = "yellow";

        this.turnMode = true;

        this.activeCell = this.findById(selectedElement.id);
        this.highlightAvailableCells();
    }

    inBoard(x, y) {
        return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
    }

    isEmpty(x, y) {
        return this.inBoard(x, y) && this.cells[y][x].piece == null;
    }

    changeTurn() {
        this.isWhiteTurn = !this.isWhiteTurn;
    }

    isOpponent(refCell, targetDirection) {
        let location = {
            x: refCell.location.x + targetDirection.x,
            y: refCell.location.y + targetDirection.y
        }

        let targetCell = this.findByLocation(location);

        return this.inBoard(location.x, location.y) && (targetCell.piece && refCell.piece.side !== targetCell.piece.side);
    }

    toDefaultState() {
        this.resetActiveCell();
        this.isWhiteTurn = true;
        this.turnCompleted = false;
        this.turnCount = 0;

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointDefaultBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailable();
        this.updateAllCellsView();
    }

    toFirstExampleState() {
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointFirstExampleBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailable();
        this.updateAllCellsView();
    }

    toSecondExampleState() {
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointSecondExampleBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailable();
        this.updateAllCellsView();
    }

    updateAllCellsView() {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                updateView(this.cells[i][j]);
            }
        }
    }

    resetActiveCell() {
        if (this.activeCell) {
            this.endHighlightAvailableCells();
            this.activeCell = null;
        }
    }
}

function updateView(cell) {
    findElementByPoint(cell.location).firstElementChild.className = cell.piece?.style;
}

function highlightWithColor(location, color) {
    findElementByPoint(location).style.backgroundColor = color;
}

function endHighlight(location) {
    findElementByPoint(location).style.removeProperty("background-color");
}

function updateTurnInfo(isWhiteTurn) {
    let turnInfo = isWhiteTurn ? "Ход белых" : "Ход чёрных";
    document.getElementById("turn-info").innerText = turnInfo;
}

let board = new Board();

function toBoardId(point) {
    return boardLetters[point.x] + (point.y + 1);
}

function endTurn() {
    if (board.turnMode && board.turnCompleted) {
        board.turnCompleted = false;

        let delimiter = board.currentTurn.visited.find(visitedCell => visitedCell.takenEnemy) ? ":" : "-";

        let record = toBoardId(board.currentTurn.start);

        board.currentTurn.visited.forEach(
            visitedCell => record += (delimiter + toBoardId(visitedCell.location))
        );

        board.gameRecording.push(record); 

        let element = findElementByPoint(board.activeCell.location);

        board.toNormalMode(element);
        board.changeTurn();
        board.turnCount++;
        board.updateAvailable();
        board.updateAllCellsView();

        board.currentTurn = {
            start: null,
            visited: [],
            pieceType: null
        }; 

        updateTurnInfo(board.isWhiteTurn);

        let text = board.gameRecording[board.gameRecording.length - 1] + " ";
        document.getElementById("game-record").value += text;

        if (board.turnCount % 2 === 0) {
            document.getElementById("game-record").value += "\n";
            board.gameRecording = [];
        }
    }
}

function clearGameRecord() {
    document.getElementById("game-record").value = "";
}

function showPiecesPlacement() {
    let recordText = "";
    recordText = gameRecordElement.value;

    let records = [];
    let matches = recordText.replace(/[\s\n:-]/g, "").match(/[^a-h1-8]/g);
    if (matches) {
        errorTextElement.innerHTML = "Неверный формат записи";
        for (match of matches) {
            showErrorLocation(match);
        }
    } else {
        records = recordText.split(/[\s\n:-]/g);
    }

    board.toDefaultState();
    
    for (record of records) {
        let id = boardLetters.indexOf(record[0]) + (Number(record[1]) - 1).toString();
        let selectedCell = board.findById(id);

        if (!record.match(/[a-h]\?[1-8]\?/g)) {
            errorTextElement.innerHTML = "Неверный формат записи координаты";
            board.toDefaultState();
            showErrorLocation(record);
            break;
        }

        if (!board.activeCell && !selectedCell.piece) {
            errorTextElement.innerHTML = "На данной клетке нет шашки";
            board.toDefaultState();
            showErrorLocation(record);
            break;
        }

        if (board.isWhiteTurn && board.isBlackPiece(selectedCell) || !board.isWhiteTurn && board.isWhitePiece(selectedCell)) {
            errorTextElement.innerHTML = "Данной шашке можно походить только после хода соперника";
            board.toDefaultState();
            showErrorLocation(record);
            break;
        }

        if (board.activeCell && !board.activeCell.availableForMove.find(el => pointsEqual(el.location, selectedCell.location))) {
            errorTextElement.innerHTML = "Шашка не может походить сюда";
            board.toDefaultState();
            showErrorLocation(record);
            break;
        }
        
        board.handleBoardEvent(document.getElementById(id));

        if (board.turnCompleted) {
            endTurn();
        }
    }
}

function showErrorLocation(textWithError) {
    gameRecordElement.selectionStart = gameRecordElement.value.indexOf(textWithError);
    gameRecordElement.selectionEnd = gameRecordElement.value.indexOf(textWithError) + textWithError.length;
    gameRecordElement.focus();
}