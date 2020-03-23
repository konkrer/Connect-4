'use strict'



//////////////////////////////////////////////////////////////
/*  A class to contain methods and data for playing a game. */
/*  of Connect Four.                                        */
class ConnectFour {
    constructor(rows, cols) {      
        this.DOMBoard = document.querySelector('.board');
        this.rows = rows;
        this.cols = cols;
        this.moves = 0;
        this.player = 1;
        this._currColumn = null;
        this.deltas = [
            [[-1,1], [-2,2], [-3,3]],
            [[0,1], [0,2], [0,3]],
            [[1,1], [2,2], [3,3]],
            [[1,0], [2,0], [3,0]],
        ];
        this.initGame();
    }

    ///////////////////////////
    /*  Initalize new game.  */
    initGame() {
        // Make board with a zero for each empty board spot. 2-D Array.
        this.board = new Array(this.rows).fill(0).map(el => new Array(this.cols).fill(0));
        this.moves = this.rows * this.cols
        this.player = 1;
        this.resetBoard();
    }
    
    ////////////////////////////////////////////////////////////////
    /*  Set _currColumn to column that was clicked on and passed  */
    /*  in by game board event listener. Place piece.             */
    /**
     * @param {number} col
     */
    set currCol(col) {
        this._currColumn = col;
        this.placePiece();
    }


    /////////////////////////////////////////////////////////////////////
    /*  Alter board state if there is an empty spot in chosen column.  */
    /*  Animate board changes. Check for winner. Change active player. */
    placePiece() {
            
            // Places = how many places to drop piece.
            const places = this.alterBoard();
            if (places===-1) return;

            this.moves--;
            animateDrop(this._currColumn, places);
            const flipAllTimer = animateFlipAllTops();
            this.checkForWin(flipAllTimer); 
            this.switchPlayer();    
    }

    ////////////////////////////////////////////////////////////
    /*  Change board state if there's an open spot and       */
    /*  return row index of found open spot in given column. */
    alterBoard() {

        // Find the lowest row with empty spot in column.
        // If column is full return -1.
        const openRow = this.board.reduce((acc, row, i) => {
            // If spot is empty accumulator is set to row index.
            if (!row[this._currColumn]) acc = i;
            return acc
        }, -1);

        // change state for spot if there is a spot
        if (openRow>-1) this.board[openRow][this._currColumn] = this.player;
        return openRow;
    }

    ////////////////////////////
    /*  Switch player state   */
    switchPlayer() {
        this.player = this.player===1 ? 2 : 1;
    }

    ////////////////////////////////////////////
    /*  Chech board for four pieces in a row. */
    checkForWin(flipAllTimer) {
        let winner = false;

        this.board.forEach((row, i) => {
            row.forEach((el, j) => {
                if (el===this.player) {
                    for (let delta of this.deltas) {
                        if (
                            delta.every(([dx, dy]) => {
                                try {return this.board[i+dx][j+dy] === this.player;}
                                catch(e) {return false}                       
                            })
                        ) winner = true;                     
                    }
                }
            });
        });
        if (winner || this.moves==0) {
            clearTimeout(flipAllTimer);
            this.endGame(winner);
        }
    }

    endGame(winner) {
        this.DOMBoard.removeEventListener('click', setCurrCol);
        
    }

    ///////////////////////////////////////////////////////////
    /*  Clear board then add pieces for top spots, fade in.  */
    resetBoard() {
        const cols = [...this.DOMBoard.children];
        cols.forEach(col => col.innerHTML = '');
        cols.forEach((col, i) => {
            col.innerHTML = this.pieceFactory(i);
            fadePieceIn(i)
        });
        
    }

    ////////////////////////////////////////////////////////////
    /*  Make board piece HTML. Make with player side showing  */ 
    pieceFactory(col) {
        let flipped = '';
        if (this.player===2) flipped = 'flipped';
    
        return `<div class="piece-wrapper flx-std opaque" data-col="${col}">
                    <div class="piece ${flipped}">
                        <div class="front bg-red" data-col="${col}"></div>
                        <div class="back bg-blue" data-col="${col}"></div>
                    </div>           
                </div>`;
    }
    
}