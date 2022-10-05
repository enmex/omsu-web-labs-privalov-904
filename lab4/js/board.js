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
    { location: {x: 5, y: 3}, type: PieceType.BLACK },
    { location: {x: 1, y: 1}, type: PieceType.WHITE },
];

const cells = document.querySelectorAll("td");

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

    cells = new Array(BOARD_SIZE);
    gameRecording = [];
    activeCell = Cell | null;
    currentTurn = {
        start: Point | null,
        deletedPieces: [],
        pieceType: PieceType
    };

    constructor() {
        this.turnMode = false;
        this.isWhiteTurn = true;
        this.turnCompleted = false;
        
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

        this.updateAvailableForMove();
        this.updateAllCellsView();
        updateTurnInfo(this.isWhiteTurn);
    }

    movePiece(emptyCell) {
        endHighlight(this.activeCell.location);
        this.endHighlightAvailableCells();

        emptyCell.piece = this.activeCell.piece;
        this.activeCell.piece = null;

        this.activeCell = emptyCell;

        if (this.activeCell.piece === PieceType.WHITE && this.activeCell.location.y === 7) {
            this.activeCell.piece = PieceType.WHITE_LADY;
        } else if (this.activeCell.piece === PieceType.BLACK && this.activeCell.location.y === 0) {
            this.activeCell.piece = PieceType.BLACK_LADY;
        }

        this.highlightAvailableCells();
    }

    updateAvailableForMove() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.setAvailableForMove(this.cells[i][j]);
            }
        }
    }

    setAvailableForMove(cell) {
        cell.availableForMove = [];
        let directions = [];

        if (cell.piece === PieceType.WHITE && this.isWhiteTurn) {
            directions.push(Direction.UP_LEFT, Direction.UP_RIGHT);
        } else if (cell.piece === PieceType.BLACK && !this.isWhiteTurn) {
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT);
        } else if (cell.piece === PieceType.WHITE_LADY && this.isWhiteTurn ||
                   cell.piece === PieceType.BLACK_LADY && !this.isWhiteTurn) { 
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT, Direction.UP_LEFT, Direction.UP_RIGHT);
        }

        let location = cell.location;

        directions.forEach(direction => {
            if (this.isOpponent(cell, direction) && this.isEmpty(location.x + 2 * direction.x, location.y + 2 * direction.y)) {
                cell.availableForMove.push({
                    location: {
                        x: location.x + 2 * direction.x, 
                        y: location.y + 2 * direction.y
                    },
                    type: MoveType.ATTACK
                });
            } else if (this.isEmpty(location.x + direction.x, location.y + direction.y)) {
                cell.availableForMove.push({
                    location: {
                        x: location.x + direction.x,
                        y: location.y + direction.y
                    },
                    type: MoveType.MOVEMENT
                });
            }
        });

        if (cell.availableForMove.find(el => el.type === MoveType.ATTACK)){
            cell.availableForMove = cell.availableForMove.filter(el => el.type === MoveType.ATTACK)
        }
    }

    handleBoardEvent(selectedElement) {
        if (this.turnMode) {
            let selectedCell = this.findById(selectedElement.id);

            if (pointsEqual(selectedCell.location, this.activeCell.location)) {
                this.toNormalMode(selectedElement);
            } else if (this.activeCell.availableForMove.find(el => pointsEqual(el.location, selectedCell.location))) {
                this.doTurn(selectedCell);
            }
        } else {
            this.toTurnMode(selectedElement);
        }
    }

    doTurn(selectedCell) {
        this.currentTurn.start = this.activeCell.location;
        this.currentTurn.pieceType = this.activeCell.piece;

        let turnType = this.activeCell.availableForMove.find(el => pointsEqual(el.location, selectedCell.location)).type;

        if (turnType === MoveType.ATTACK) {
            let enemyLocation = {
                x: (this.activeCell.location.x + selectedCell.location.x) / 2,
                y: (this.activeCell.location.y + selectedCell.location.y) / 2
            };

            this.currentTurn.deletedPieces.push({
                location: enemyLocation,
                type: this.cells[enemyLocation.y][enemyLocation.x].piece
            });

            this.cells[enemyLocation.y][enemyLocation.x].piece = null;
        }

        this.movePiece(selectedCell);

        this.turnCompleted = true;

        this.updateAvailableForMove();
        this.updateAllCellsView();
    }

    cancelTurn() {
        if (this.activeCell.piece && this.turnCompleted) {
            this.turnCompleted = false;

            this.endHighlightAvailableCells();
            this.movePiece(this.findByLocation(this.currentTurn.start));

            this.currentTurn.deletedPieces.forEach(piece => this.findByLocation(piece.location).piece = piece.type);

            this.activeCell = this.findByLocation(this.currentTurn.start);

            this.activeCell.piece = this.currentTurn.pieceType;

            this.updateAvailableForMove();

            this.updateAllCellsView();
            this.highlightAvailableCells();
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

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointDefaultBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailableForMove();
        this.updateAllCellsView();
    }

    toFirstExampleState() {
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointFirstExampleBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailableForMove();
        this.updateAllCellsView();
    }

    toSecondExampleState() {
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointSecondExampleBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailableForMove();
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
    return boardLetters[point.x] + point.y;
}

function endTurn() {
    if (board.turnMode && board.turnCompleted) {
        let element = findElementByPoint(board.activeCell.location);

        board.toNormalMode(element);
        board.changeTurn();
        board.updateAvailableForMove();

        let record = toBoardId(board.currentTurn.start)
             + (board.currentTurn.deletedPieces.length > 0 ? ":" : "-")
             + toBoardId(board.activeCell.location);
        
        board.gameRecording.push(record); 

        board.currentTurn = {
            start: null,
            deletedPieces: []
        };
        
        board.gameRecording.push({

        }); 

        console.log(board.gameRecording);

        updateTurnInfo(board.isWhiteTurn);
    }
}