'use strict'





// a class to contain methods and data for playing a game
// of Connect Four
class ConnectFour {
    constructor(rows, cols) {      
        this.DOMBoard = document.querySelector('.board');
        this.rows = rows;
        this.cols = cols;
        this.player = 1;
        this.currColumn = 9;
        // this.initGame();

    }

    initGame() {
        // make board with boolean value for each board spot possibilty 
        this.board = new Array(this.rows).fill(0);
        this.board = this.board.map(el => new Array(this.cols).fill(0));
    }

    placePiece() {
            console.log(this.currColumn, 'in place piec')
            const places = this.alterBoard(this.currColumn);
            if (places===-1) return;
            console.log(places)
            console.log(this.board)
            animateDrop(this.currColumn, places);
            // // this.checkForWin();
            // this.switchPlayer();
            animateFlipAllTops();
    }


    alterBoard(col) {
        const openRow = this.board.reduce((acc, row, i) => {
            if (!row[col]) acc = i;
            return acc
        }, -1);
        if (openRow>-1) this.board[openRow][col] = this.player;
        return openRow;
    }

    switchPlayer() {
        this.player = this.player===1 ? 2 : 1;
    }
    
}



const game = new ConnectFour(6, 7);

game.DOMBoard.addEventListener('click', function(e) {
    const col = e.target.dataset['col'];
        if (col) {
            game.currColumn = +col;
            game.placePiece();
        } 
});

game.initGame();