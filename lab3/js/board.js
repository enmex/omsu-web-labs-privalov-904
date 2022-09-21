const Team = {
    WHITE: 'white',
    BLACK: 'black',
};

const Cell = {
    id: String,
    team: Team | null,
};

const WhitePieces = document.querySelectorAll('.white-pieces');
const BlackPieces = document.querySelectorAll('.black-pieces');
const f = document.querySelector()

const boardLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

class Board {
    cells;

    whitePoints = WhitePieces.length;
    blackPoints = BlackPieces.length;

    constructor() {
        cells = new Array(8);
        for (let i = 0; i < cells.length; i++) {
            cells[i] = new Array(8);
            for (let j = 0; j < cells[i].length; j++) {
                let id = boardLetters[i] + j;

                let team = document.getElementById(id).firstElementChild.className;

                if (document.getElementById(id).firstElementChild.className.equals('.white-pieces')) {
                     
                }

                cells[i][j] = {
                    id: boardLetters[i] + j,
                    team: 
                }
            }
        }
    }

    toDefault() {
        this = new Board();
    }
}