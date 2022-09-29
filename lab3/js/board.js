const MoveType = {
    MOVEMENT: 'green',
    ATTACK: 'red'
}

const PieceType = {
    WHITE: {style: 'white-piece', side: 'white'},
    BLACK: {style: 'black-piece', side: 'black'},
    WHITE_LADY: {style: 'white-lady', side: 'white'},
    BLACK_LADY: {style: 'black-lady', side: 'black'},
}

const Direction = {
    UP_LEFT: {x: 1, y: -1},
    UP_RIGHT: {x: 1, y: 1},
    DOWN_LEFT: {x: -1, y: -1},
    DOWN_RIGHT: {x: -1, y: 1}
}

const boardLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

const defaultPiecesLocations = [
    { id: 'a1', type: PieceType.WHITE },
    { id: 'c1', type: PieceType.WHITE },
    { id: 'e1', type: PieceType.WHITE },
    { id: 'g1', type: PieceType.WHITE },
    { id: 'b2', type: PieceType.WHITE },
    { id: 'd2', type: PieceType.WHITE },
    { id: 'f2', type: PieceType.WHITE },
    { id: 'h2', type: PieceType.WHITE },
    { id: 'a3', type: PieceType.WHITE },
    { id: 'c3', type: PieceType.WHITE },
    { id: 'e3', type: PieceType.WHITE },
    { id: 'g3', type: PieceType.WHITE },
    { id: 'b8', type: PieceType.BLACK },
    { id: 'd8', type: PieceType.BLACK },
    { id: 'f8', type: PieceType.BLACK },
    { id: 'h8', type: PieceType.BLACK },
    { id: 'a7', type: PieceType.BLACK },
    { id: 'c7', type: PieceType.BLACK },
    { id: 'e7', type: PieceType.BLACK },
    { id: 'g7', type: PieceType.BLACK },
    { id: 'b6', type: PieceType.BLACK },
    { id: 'd6', type: PieceType.BLACK },
    { id: 'f6', type: PieceType.BLACK },
    { id: 'h6', type: PieceType.BLACK },
]

const example1PiecesLocations = [
    { id: 'f4', type: PieceType.WHITE },
    { id: 'h4', type: PieceType.WHITE },
    { id: 'c1', type: PieceType.BLACK_LADY },
    { id: 'b8', type: PieceType.BLACK },
    { id: 'c5', type: PieceType.BLACK },
    { id: 'c7', type: PieceType.BLACK },
    { id: 'e7', type: PieceType.BLACK },
    { id: 'h6', type: PieceType.BLACK },
]

const example2PiecesLocations = [
    { id: 'e3', type: PieceType.WHITE },
    { id: 'd4', type: PieceType.BLACK },
    { id: 'f4', type: PieceType.BLACK },
    { id: 'b2', type: PieceType.WHITE },
];

const cells = document.querySelectorAll("td");

function findElementById(id) {
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].id === id) {
            return cells[i];
        }
    }

    return null;
}

function getPieceByIdDefaultBoard(id) {
    for (let i = 0; i < defaultPiecesLocations.length; i++) {
        if (id === defaultPiecesLocations[i].id) {
            return defaultPiecesLocations[i].type;
        }
    }

    return null;
}

function getPieceByIdExample1Board(id) {
    for (let i = 0; i < example1PiecesLocations.length; i++) {
        if (id === example1PiecesLocations[i].id) {
            return example1PiecesLocations[i].type;
        }
    }

    return null;
}

function getPieceByIdExample2Board(id) {
    for (let i = 0; i < example2PiecesLocations.length; i++) {
        if (id === example2PiecesLocations[i].id) {
            return example2PiecesLocations[i].type;
        }
    }

    return null;
}

class Board {
    cells = new Array(8);
    activeCell = {
        id: String, 
        piece: PieceType | null,
        availableForMove: []
    } | null;

    constructor() {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i] = new Array(8);
            for (let j = 0; j < this.cells[i].length; j++) {
                let id = boardLetters[i] + (j + 1);

                let element = findElementById(id);
                element.addEventListener("click", () => this.handleBoardEvent(element));

                this.cells[i][j] = {
                    id: id,
                    piece: getPieceByIdDefaultBoard(id),
                    availableForMove: []
                }
            }
        }

        this.updateAvailableForMove();

        this.updateAllCellsView();
    }

    updateAvailableForMove() {
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                this.cells[i][j].availableForMove = this.getAvailableForMove(i, j, this.cells[i][j].piece);
            }
        }
    }

    getAvailableForMove(x, y, targetPiece) {
        let availableForMove = [];
        let directions = [];

        if (targetPiece == PieceType.WHITE) {
            directions.push(Direction.UP_LEFT, Direction.UP_RIGHT);
        } else if (targetPiece == PieceType.BLACK) {
            directions.push(Direction.DOWN_LEFT, Direction.DOWN_RIGHT);
        } else if (!this.isEmptyCell(x, y)){
            directions.push(Direction.UP_RIGHT, Direction.UP_LEFT, Direction.DOWN_LEFT, Direction.DOWN_RIGHT);
        }

        directions.forEach(direction => {
            if (this.isOpponentPiece(x, y, x + direction.x, y + direction.y) && this.inBoard(x + 2 * direction.x, y + 2 * direction.y)) {               
                availableForMove.push({
                    id: this.toBoardId(x + 2 * direction.x, y + 2 * direction.y),
                    type: MoveType.ATTACK
                });
            } else if(this.inBoard(x + direction.x, y + direction.y)) {
                availableForMove.push({
                    id: this.toBoardId(x + direction.x, y + direction.y),
                    type: MoveType.MOVEMENT
                })
            }
        });

        if (availableForMove.find(el => el.type == MoveType.ATTACK)) {
            return availableForMove.filter(el => el.type == MoveType.ATTACK);
        }

        return availableForMove;
    }

    toDefaultState() {
        this.toNormalMode();
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                let piece = getPieceByIdDefaultBoard(this.cells[i][j].id);

                this.cells[i][j] = {
                    id: this.cells[i][j].id,
                    piece: piece,
                    availableForMove: this.getAvailableForMove(i, j, piece)
                }
            }
        }

        this.updateAllCellsView();
    }

    toExample1State() {
        this.toNormalMode();
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                let piece = getPieceByIdExample1Board(this.cells[i][j].id);

                this.cells[i][j] = {
                    id: this.cells[i][j].id,
                    piece: piece,
                    availableForMove: this.getAvailableForMove(i, j, piece)
                }
            }
        }

        this.updateAllCellsView();
    }

    toExample2State() {
        this.toNormalMode();
        for (let i = 0; i < this.cells.length; i++) {
            for (let j = 0; j < this.cells[i].length; j++) {
                let piece = getPieceByIdExample2Board(this.cells[i][j].id);

                this.cells[i][j] = {
                    id: this.cells[i][j].id,
                    piece: piece,
                    availableForMove: this.getAvailableForMove(i, j, piece)
                }
            }
        }

        this.updateAllCellsView();
    }

    handleBoardEvent(selectedElement) {
        if (this.activeCell && selectedElement.id === this.activeCell.id) {
            this.toNormalMode();
        } else {
            if (this.activeCell) {
                endHighlight(this.activeCell.id);
                this.endHighlightAvailableCells();
            }

            selectedElement.style.backgroundColor = "yellow";
            this.activeCell = this.findById(selectedElement.id);

            if (this.activeCell.piece != null) {
                this.highlightAvailableCells(selectedElement.id);
            }
        }
    }

    highlightAvailableCells() {
        this.activeCell.availableForMove.forEach(el => highlightWithColor(el.id, el.type));
    }

    endHighlightAvailableCells() {
        this.activeCell.availableForMove.forEach(el => endHighlight(el.id));
    }

    toNormalMode() {
        if (this.activeCell) {
            endHighlight(this.activeCell.id);
            this.endHighlightAvailableCells();
            this.activeCell = null;
        }
    }

    findById(id) {
        let y = boardLetters.findIndex(el => el === id[0]);
        let x = id[1] - 1;

        return this.cells[y][x];
    }

    toBoardId(x, y) {
        return boardLetters[y] + (x + 1);
    }

    inBoard(x, y) {
        return x >= 0 && x < 8 && y >= 0 && y < 8;
    }

    isOpponentPiece(x, y, otherX, otherY) {
        return this.inBoard(otherX, otherY) && this.cells[y][x].piece?.side != this.cells[otherY][otherX].piece?.side
    }

    isEmptyCell(x, y) {
        return this.inBoard(x, y) && this.cells[y][x].piece == null;
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
    findElementById(cell.id).firstElementChild.className = cell.piece?.style;
}

function highlightWithColor(id, color) {
    findElementById(id).style.backgroundColor = color;
}

function endHighlight(id) {
    findElementById(id).style.removeProperty("background-color");
}

let board = new Board();