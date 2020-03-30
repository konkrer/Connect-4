'use strict'



//////////////////////////////////////////////////////////////
/*  A class to contain methods and data for playing a game. */
/*  of Connect Four.                                        */
class ConnectFour {
    constructor() {      
        this.DOMBoard = document.querySelector('.board');
        this.DOMColumns = null;
        this._rows = 6;
        this._cols = 7;
        this.moves = 0;
        this.player = 1;
        this._currColumn = null;
        this.deltas = [
            [[-1,1], [-2,2], [-3,3]],
            [[0,1], [0,2], [0,3]],
            [[1,1], [2,2], [3,3]],
            [[1,0], [2,0], [3,0]],
        ];
        this._aiPlayers = 1;
        this.flipAllTimer = null;
        this.aiTimeouts = [null, null];
        this.DOMBoardInit();
        this.initGame();
    }

    //////////////////////////////////////////////////////
    /*  Sett CSS variables based on number of rows and  */
    /*  columns. Clear board columns and add new ones.  */
    DOMBoardInit() {
        this.setCSSVariables();
        this.addDOMColumns();
    } 

    ///////////////////////////
    /*  Initalize new game.  */
    initGame() {
        // Clear all timeouts.
        clearTimeout(this.flipAllTimer);
        this.aiTimeouts.forEach(id => clearTimeout(id));

        // Make board with a zero for each empty board spot. 2-D Array.
        this.board = new Array(this._rows).fill(0).map(el => new Array(this._cols).fill(0));

        this.moves = this._rows * this._cols
        this.player = 1;
        
        this.resetBoard();
        if (this._aiPlayers < 2) this.setBoardEvtListener();
        else this.aiVsAiFirstMove();
    }
    
    //////////////////////////////////////////////////////////////
    /*  Listen for click on game board to place piece on board. */
    setBoardEvtListener() {
        this.DOMBoard.addEventListener('click', this.setCurrCol);
    }

    /////////////////////////////////////////
    /*  Remove board click event listener. */
    removeBoardEvtListener() {
        this.DOMBoard.removeEventListener('click', this.setCurrCol);
    }

    ////////////////////////////////////////////////////////////////////////////
    /*  Column click Logic.                                                   */
    /*  Having "this" issues so setup is as it is, funky but it works for now.*/
    /*  If click was on any board column (element with a data-col attribute), */
    /*  pass the column number to GAME object by setting property.            */
    setCurrCol(e) {
        const col = e.target.dataset['col'];
        if (col) {
            GAME.currCol = +col;
        } 
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

    /////////////////////////////////////////////////////
    /*  Set _rows to given value. Initalize new game.  */
    /**
     * @param {number} num
     */
    set rows(num) { 
        this._rows = num;
        this.DOMBoardInit();
        this.initGame(); 
    }

    /////////////////////////////////////////////////////
    /*  Set _cols to given value. Initalize new game.  */
    /**
     * @param {number} num
     */
    set cols(num) { 
        this._cols = num;
        this.DOMBoardInit();
        this.initGame(); 
    }

    //////////////////////////////////////////////////////////
    /*  Set _aiPlayers to given value. Initalize new game.  */
    /**
     * @param {number} num
     */
    set aiPlayers(num) { 
        this._aiPlayers = num;
        this.initGame(); 
    }

    ///////////////////////////////////////////////////////
    /*  Use random choice to make AI vs. AI first move.  */
    aiVsAiFirstMove() {
        this._currColumn = MAXIMINION.getMove(this.board, this.player);
        // Delay start so individual flip piece timers clear on 
        // board being empty when checked.
        setTimeout(() => this.placePiece(), 330);  
    }


    /////////////////////////////////////////////////////////////////////
    /*  Alter board state if there is an empty spot in chosen column.  */
    /*  Animate board changes. Check for winner. Change active player. */
    placePiece() {
            
            // Places = how many places to drop piece.
            const places = this.alterBoard();
            if (places===-1) return;

            this.removeBoardEvtListener();

            this.moves--;
            animateDrop(this._currColumn, places);
            this.flipAllTimer = animateFlipAllTops();
            const gameOver = this.checkForWin(); 
            this.switchPlayer();
            if (!gameOver) {
                // If AI is active second player is AI - make AI move.
                if (this._aiPlayers && this.player==2) this.makeAIMove();
                // If it's AI vs. AI is player 1 is AI - make AI move.
                else if (this._aiPlayers===2 && this.player===1) this.makeAIMove();
            }      
    }
    
    ///////////////////////////////////////
    /*  Make AI move after piece drops.  */
    makeAIMove() {
        this.aiTimeouts[this.player-1] = setTimeout(() => {
            this._currColumn = MAXIMINION.getMove(this.board, this.player);
            this.placePiece()
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
    checkForWin() {
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
                            delta.every(([dy, dx]) => {
                                // If delta offset found valid row- 
                                if (this.board[i+dy]) {
                                    // check if cell value matches current player.
                                    return this.board[i+dy][j+dx] === this.player;
                                }
                                return false;                    
                            }) // If win make array with indexes of winning pieces.
                        ) winner = [ [i,j], ...delta.map(([dy, dx]) => [i+dy, j+dx]) ];                     
                    }
                }
            });
        });
        // If winner or game board is full stop flip animation and end game.
        if (winner || this.moves==0) {
            clearTimeout(this.flipAllTimer);
            this.endGame(winner);
            return true;
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
        root.style.setProperty('--number-rows', this._rows + 1);
        root.style.setProperty('--number-cols', this._cols);
    }
    
    //////////////////////////////////////////////
    /*  Add current number of columns to board  */
    addDOMColumns() {
        // Clear all columns from board.
        this.DOMBoard.innerHTML = '';
        const exDiv = document.createElement('div');
        exDiv.id = 'ex-Div';
        exDiv.style.position = 'relative';
        this.DOMBoard.append(exDiv);
        // Add columns to board.
        for (let i=0; i<this._cols; i++) {
            exDiv.append(this.columnFactory(i));
        }
        this.DOMColumns = exDiv.children;
        this.addOverlayGrid(exDiv); 
    }
    
    addOverlayGrid(exdiv) {
        const overlay = document.createElement('div');
        overlay.classList.add('overlay-grid');
        for (let row=0; row<this._rows; row++) {
            overlay.append(this.createGridRow())
        }
        exdiv.append(overlay);
    }

    createGridRow() {
        const row = document.createElement('div');
        row.classList.add('overlay-row');
        for (let col=0; col<this._cols; col++) {
            row.append(this.createCuttoutBlock());
        }
        return row;
    }

    createCuttoutBlock() {
        const cuttOutWrapper = document.createElement('div');
        cuttOutWrapper.classList.add('cuttout-wrapper');

        const cuttOutWrapperFlx = document.createElement('div');
        cuttOutWrapperFlx.classList.add('flx-std');
        cuttOutWrapperFlx.classList.add('cuttout-wrapper-flex');

        const cuttOUt = document.createElement('div');
        cuttOUt.classList.add('cuttout');

        cuttOutWrapperFlx.append(cuttOUt);
        cuttOutWrapper.append(cuttOutWrapperFlx);
        return cuttOutWrapper;
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
        const cols = [...this.DOMBoard.firstElementChild.children].slice(0, this._cols);
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