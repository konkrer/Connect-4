'use strict'



//////////////////////////////////////////////////////////////
/*  A class to contain methods and data for playing a game. */
/*  of Connect Four.                                        */
class ConnectFour {
    constructor(rows, cols) {      
        this.DOMBoard = document.querySelector('.board');
        this.DOMColumns = null;
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
        this.setCSSVariables();
        this.addDOMColumns();
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
        this.setBoardEvtListener();
    }
    
    //////////////////////////////////////////////////////////////
    /*  Listen for click on game board to place piece on board. */
    setBoardEvtListener() {
        this.DOMBoard.addEventListener('click', setCurrCol);
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

            this.DOMBoard.removeEventListener('click', setCurrCol);

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
                        ) winner = [ [i,j], ...delta.map(([dx, dy]) => [i+dx, j+dy]) ];                     
                    }
                }
            });
        });
        if (winner || this.moves==0) {
            clearTimeout(flipAllTimer);
            this.endGame(winner);
        }
    }

    ///////////////////////////////////////////////////
    /*  End of game animations and winner announced  */
    endGame(winner) {
        animateWinningPieces(winner);
        animateArrows();
        fillInWinnerDOM(winner);
        animateGameOver();  
    }

    //////////////////////////////////////////////
    /*  Add corrent number of columns to board  */
    setCSSVariables() {
        let root = document.documentElement;
        root.style.setProperty('--number-rows', this.rows + 1);
        root.style.setProperty('--number-cols', this.cols);
    }
    
    //////////////////////////////////////////////
    /*  Add corrent number of columns to board  */
    addDOMColumns() {
        this.DOMBoard.innerHTML = '';
        for (let i=0; i<this.cols; i++) {
            this.DOMBoard.append(this.columnFactory(i));
        }
        this.DOMColumns = this.DOMBoard.children;  
    }
    
    ///////////////////////////////////////////////////////////
    /*  Clear board then add pieces for top spots, fade in.  */
    resetBoard() {
        const gameOverDiv = document.querySelector('.game-over');
        // pause game over animation here??
        gameOverDiv.classList.add('animate-clear-g-over');
        setTimeout(() => {
            gameOverDiv.classList.add('hidden')
            setTimeout(() => {
                gameOverDiv.classList.remove('animate-g-over');
                gameOverDiv.classList.remove('animate-clear-g-over');
            }, 2000);
        }, 1010);


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
    
        return `<div class="piece-viewport opaque" data-col="${col}">
                    <div class="piece-wrapper flx-std">
                    <div class="piece ${flipped}">
                        <div class="front bg-red bdr-gold" data-col="${col}"></div>
                        <div class="back bg-blue bdr-gold" data-col="${col}"></div>
                    </div>
                    </div>        
                </div>`;
    }
    
    //////////////////////////////////
    /*  Make columns of game board  */ 
    columnFactory(i) {
        const column = document.createElement('div');
        column.className = 'column';
        column.setAttribute('data-col', i);
        return column;
    }
}