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
        this.onePlayerGame = true;
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
            if (this.onePlayerGame && this.player==2) this.makeAIMove(); 
    }
    
    makeAIMove() {
        this._currColumn = MAXIMINION.getMove(this.board);
        setTimeout(() => {
            this.placePiece();
        }, 2000)    
    }


    ////////////////////////////////////////////////////////////
    /*  Change board state if there's an open spot and       */
    /*  return row index of found open spot in given column. */
    alterBoard() {
        // Eh... I might have ham-fisted a reduce here. Obj/Map better.
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
        // For each row-
        this.board.forEach((row, i) => {
            // Check each element.
            row.forEach((el, j) => {
                // If piece is current player's.
                if (el===this.player) {
                    // For each delta group --> up-right, right, down-right, down-
                    for (let delta of this.deltas) {
                        if ( // If every piece is this player's they have won.
                            delta.every(([dx, dy]) => {
                                // If delta offset found valid row- 
                                if (this.board[i+dx]) {
                                    // check if cell value matches current player.
                                    return this.board[i+dx][j+dy] === this.player;
                                }
                                return false;                    
                            }) // If win make array with indexes of winning pieces.
                        ) winner = [ [i,j], ...delta.map(([dx, dy]) => [i+dx, j+dy]) ];                     
                    }
                }
            });
        });
        // If winner or game board is full stop flip animation and end game.
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
    /*  Add current number of columns to board  */
    addDOMColumns() {
        // Clear all columns from board.
        this.DOMBoard.innerHTML = '';
        // Add columns to board.
        for (let i=0; i<this.cols; i++) {
            this.DOMBoard.append(this.columnFactory(i));
        }
        this.DOMColumns = this.DOMBoard.children;  
    }
    
    ///////////////////////////////////////////////////////////
    /*  If game over animation is on screen clear, then clear */
    /*  board, add pieces at top of board and fade pieces in. */
    resetBoard() {
        this.clearGameOverPlacard();  
        this.emptyBoardAddPieces();   
    }

    //////////////////////////////////////////////////
    /*  Clear game-over placard if it is on screen  */
    clearGameOverPlacard() {
        const gameOverDiv = document.querySelector('.game-over');
        // pause game over animation here??
        // if game over placard is on screen clear it.
        if (gameOverDiv.classList.contains('animate-g-over')) {
            gameOverDiv.parentElement.classList.add('animate-clear-g-over');
            // hide placard - visibility: hidden
            setTimeout(() => {
                gameOverDiv.parentElement.classList.add('hidden')
                // remove animation classes from game-over div
                setTimeout(() => {
                    gameOverDiv.classList.remove('animate-g-over');
                    gameOverDiv.parentElement.classList.remove('animate-clear-g-over');
                }, 2000);
            }, 1010);
        }
    }

    ///////////////////////////////////////
    /*  Empty board and add game pieces  */ 
    emptyBoardAddPieces() {     
        // empty board i.e. clear columns
        const cols = [...this.DOMBoard.children];
        cols.forEach(col => col.innerHTML = '');
        // add pieces
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