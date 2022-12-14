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
    hintMode;
    whiteMustAttack;
    blackMustAttack;

    cells = new Array(BOARD_SIZE);
    activeCell = Cell | null;

    constructor() {
        this.hintMode = false;
        this.whiteMustAttack = false;
        this.blackMustAttack = false;
        
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
        this.whiteMustAttack = false;
        this.blackMustAttack = false;

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                let cell = this.cells[i][j];

                if (cell.piece) {
                    this.setAvailableForAttack(cell);
                    
                    if (this.isWhitePiece(cell) && cell.availableForMove.length > 0) {
                        this.whiteMustAttack = true;
                    }

                    if (this.isBlackPiece(cell) && cell.availableForMove.length > 0) {
                        this.blackMustAttack = true;
                    }
                }
            }
        }

        for (let i = 0; i< BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                let cell = this.cells[i][j];

                if ((this.isWhitePiece(cell) && !this.whiteMustAttack) || (this.isBlackPiece(cell) && !this.blackMustAttack)) {
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

    handleBoardEvent(selectedElement) {
        let selectedCell = this.findById(selectedElement.id);

        if (this.activeCell && pointsEqual(selectedCell.location, this.activeCell.location)) {
            this.hintMode = false;
            this.resetActiveCell();
        }else if (this.hintMode && selectedCell.piece && selectedCell.availableForMove.length > 0) {
            this.setAvailableForAttack(selectedCell);

            this.endHighlightAvailableCells();
            this.activeCell = selectedCell;
            this.highlightAvailableCells();

            this.updateAllCellsView();
        } else if (selectedCell.piece && selectedCell.availableForMove.length > 0) {
            this.toHintMode(selectedElement);
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

    toHintMode(selectedElement) {
        if (this.activeCell) {
            this.endHighlightAvailableCells();
        }

        this.hintMode = true;

        this.activeCell = this.findById(selectedElement.id);
        this.highlightAvailableCells();
    }

    inBoard(x, y) {
        return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
    }

    isEmpty(x, y) {
        return this.inBoard(x, y) && this.cells[y][x].piece == null;
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
        this.hintMode = false;
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointDefaultBoard(this.cells[i][j].location);
                this.cells[i][j].availableForMove = [];
            }
        }

        this.updateAvailable();
        this.updateAllCellsView();
    }

    toFirstExampleState() {
        this.hintMode = false;
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointFirstExampleBoard(this.cells[i][j].location);
                this.cells[i][j].availableForMove = [];
            }
        }

        this.updateAvailable();
        this.updateAllCellsView();
    }

    toSecondExampleState() {
        this.hintMode = false;
        this.resetActiveCell();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointSecondExampleBoard(this.cells[i][j].location);
                this.cells[i][j].availableForMove = [];
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

let board = new Board();