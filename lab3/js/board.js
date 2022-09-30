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

    for (const cell of cells) {
        if (cell.id === id) {
            return cell
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

    cells = new Array(BOARD_SIZE);
    activeCell = {
        location: Point,
        piece: PieceType | null,
        availableForMove: []
    } | null;

    constructor() {
        this.hintMode = false;

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
    }

    updateAvailableForMove() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].availableForMove = this.getAvailableForMove(this.cells[i][j]);
            }
        }
    }

    getAvailableForMove(cell) {
        let availableForMove = [];
        let directions = [];

        if (cell.piece === PieceType.WHITE) {
            directions.push(Direction.UP_LEFT, Direction.UP_RIGHT);
        } else if (cell.piece === PieceType.BLACK) {
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT);
        } else if (cell.piece != null) {
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT, Direction.UP_LEFT, Direction.UP_RIGHT);
        }

        let location = cell.location;

        directions.forEach(direction => {
            if (this.isOpponent(cell, direction) && this.isEmpty(location.x + 2 * direction.x, location.y + 2 * direction.y)) {
                availableForMove.push({
                    location: {
                        x: location.x + 2 * direction.x, 
                        y: location.y + 2 * direction.y
                    },
                    type: MoveType.ATTACK
                });
            } else if (this.isEmpty(location.x + direction.x, location.y + direction.y)) {
                availableForMove.push({
                    location: {
                        x: location.x + direction.x,
                        y: location.y + direction.y
                    },
                    type: MoveType.MOVEMENT
                });
            }
        });

        if (availableForMove.find(el => el.type === MoveType.ATTACK)) {
            return availableForMove.filter(el => el.type === MoveType.ATTACK);
        }

        return availableForMove;
    }

    handleBoardEvent(selectedElement) {
        if (this.activeCell && pointsEqual(idToPoint(selectedElement.id), this.activeCell.location)) {
            this.toNormalMode();
        } else if (!this.activeCell){
            if (this.activeCell) {
                endHighlight(this.activeCell.location);
                this.endHighlightAvailableCells();
            }

            selectedElement.style.backgroundColor = "yellow";
            this.activeCell = this.findById(selectedElement.id);

            if (this.activeCell.piece != null) {
                this.highlightAvailableCells();
            }
        }
    }

    findById(id) {
        let location = idToPoint(id);

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (pointsEqual(this.cells[i][j].location, location)) {
                    return this.cells[i][j];
                }
            }
        }

        return null;
    }

    findByLocation(location) {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (pointsEqual(this.cells[i][j].location, location)) {
                    return this.cells[i][j];
                }
            }
        }

        return null;
    }

    highlightAvailableCells() {
        this.activeCell.availableForMove.forEach(el => highlightWithColor(el.location, el.type));
    }

    endHighlightAvailableCells() {
        this.activeCell.availableForMove.forEach(el => endHighlight(el.location));
    }

    toNormalMode() {
        this.hintMode = false;

        if (this.activeCell) {
            endHighlight(this.activeCell.location);
            this.endHighlightAvailableCells();
            this.activeCell = null;
        }
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
        this.toNormalMode();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointDefaultBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailableForMove();
        this.updateAllCellsView();
    }

    toFirstExampleState() {
        this.toNormalMode();

        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i][j].piece = getPieceByPointFirstExampleBoard(this.cells[i][j].location);
            }
        }

        this.updateAvailableForMove();
        this.updateAllCellsView();
    }

    toSecondExampleState() {
        this.toNormalMode();

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