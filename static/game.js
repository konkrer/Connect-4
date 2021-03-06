'use strict';

////////////////////////////////////////////////////////////
/*  A class to contain data, logic, and DOM manipulation  */
/*  methods for  playing a game of Connect Four.          */
class ConnectFour {
  constructor() {
    this.DOMBoard = document.querySelector('main');
    this.DOMColumns = null;
    this.aiTimeouts = [null, null];
    this.flipAllTimer = null;
    this.gameOverAnimations = [null, null];
    this.aiPlayersChangeTimer = null;
    this.board = null;
    this.openRowInCol = null;
    this.moves = null;
    this.player = 1;
    this.blockColClick = false;
    this._dropDelay = 430;
    this._rows = 6;
    this._cols = 7;
    this._aiPlayers = 1;
    this._currColumn = null;
    this.deltas = [
      [
        [-1, 1],
        [-2, 2],
        [-3, 3],
      ],
      [
        [0, 1],
        [0, 2],
        [0, 3],
      ],
      [
        [1, 1],
        [2, 2],
        [3, 3],
      ],
      [
        [1, 0],
        [2, 0],
        [3, 0],
      ],
    ];
    this.DOMBoardInit();
    this.initGame();
    this.setBoardEvtListener();
  }

  /////////////////////////////////////////////////////
  /*  Sett CSS variables based on current settings.  */
  /*  Clear board columns and add new ones.          */
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
    this.gameOverAnimations.forEach(id => clearTimeout(id));

    // Make board with a zero for each empty board spot. 2-D Array.
    this.board = new Array(this._rows)
      .fill(0)
      .map(el => new Array(this._cols).fill(0));
    this.openRowInCol = this.createOpenRowMap();
    this.moves = this._rows * this._cols;
    this.player = 1;

    this.resetBoard();
    if (this._aiPlayers < 2) {
      this.blockColClick = false;
      this.resetPlayRate();
    } else {
      this.aiVsAiFirstMove();
      this.blockColClick = true;
    }
  }

  ///////////////////////////////////////////////////////////////////////
  /*  Create map to hold row index of lowest open spot in each column. */
  createOpenRowMap() {
    const mapp = new Map();
    for (let i = 0; i < this._cols; i++) {
      mapp.set(i, this._rows - 1);
    }
    return mapp;
  }

  //////////////////////////////////////////////////////////////
  /*  Listen for click on game board to place piece on board. */
  setBoardEvtListener() {
    this.DOMBoard.addEventListener('click', this.setCurrCol.bind(this));
  }

  ////////////////////////////////////////////////////////////////////////////
  /*  Column click Logic.                                                   */
  /*  If click was on any board column (element with a data-col attribute), */
  /*  set _currColumn and place piece.                                      */
  setCurrCol(e) {
    if (this.blockColClick) return;

    const col = e.target.dataset['col'];
    if (col) {
      this._currColumn = +col;
      this.placePiece();
    }
  }

  ///////////////////////////////////////////////////////
  /*  Reset play rate to default when not AI vs. AI.  */
  resetPlayRate() {
    this._dropDelay = 430;
    document.querySelector('#drop-delay').value = 650;
    document.documentElement.style.setProperty(
      '--drop-delay',
      `${this._dropDelay}ms`
    );
  }

  //////////////////////////////////
  /*  Make AI vs. AI first move.  */
  aiVsAiFirstMove() {
    this._currColumn = MAXIMINION.getMove();
    // Delay start so individual flip piece timers clear on board
    // having been emptied - in individual animateFlipAllTops timeouts.
    this.aiTimeouts[this.player - 1] = setTimeout(
      () => this.placePiece(),
      1000
    );
  }

  /////////////////////////////////////////////////////////////////////
  /*  Alter board state if there is an empty spot in chosen column.  */
  /*  Animate board changes. Check for winner. Change active player. */
  placePiece() {
    // Places = how many places to drop piece.
    const places = this.alterBoard();
    if (places === -1) return;

    this.blockColClick = true;
    this.moves--;

    animateDrop(this._currColumn, places);
    this.flipAllTimer = animateFlipAllTops();

    const gameOver = this.checkForWin();
    this.switchPlayer();

    if (!gameOver) {
      // If AI is active and this player 2 or it's AI vs. AI and this player 1.
      if (
        (this._aiPlayers && this.player == 2) ||
        (this._aiPlayers === 2 && this.player === 1)
      )
        this.makeAIMove();
    }
  }

  ///////////////////////////////////////
  /*  Make AI move after piece drops.  */
  makeAIMove() {
    this.aiTimeouts[this.player - 1] = setTimeout(() => {
      this._currColumn = MAXIMINION.getMove();
      this.placePiece();
    }, 2 * this._dropDelay);
  }

  ////////////////////////////////////////////////////////////
  /*  Change board state if there's an open spot and       */
  /*  return row index of found open spot in given column. */
  alterBoard() {
    // The lowest row with empty spot in current column is it's
    // openRowInCol map value. If column is full value will be -1.
    const openRow = this.openRowInCol.get(this._currColumn);
    // If open spot in this column.
    if (openRow >= 0) {
      // Decrement value for this column.
      this.openRowInCol.set(this._currColumn, openRow - 1);
      // change state.
      this.board[openRow][this._currColumn] = this.player;
    }
    return openRow;
  }

  ////////////////////////////
  /*  Switch player state   */
  switchPlayer() {
    this.player = this.player === 1 ? 2 : 1;
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
        if (el === this.player) {
          // For each delta group --> up-right, right, down-right, down-
          for (let delta of this.deltas) {
            if (
              // If every piece is this player's they have won.
              delta.every(([dy, dx]) => {
                // If delta offset found valid row-
                if (this.board[i + dy]) {
                  // check if cell value matches current player.
                  return this.board[i + dy][j + dx] === el;
                }
                return false;
              }) // If win make array with indexes of winning pieces.
            )
              winner = [[i, j], ...delta.map(([dy, dx]) => [i + dy, j + dx])];
          }
        }
      });
    });
    // If winner or game board is full stop flip animation and end game.
    if (winner || this.moves == 0) {
      clearTimeout(this.flipAllTimer);
      this.endGame(winner);
      return true;
    }
  }

  ///////////////////////////////////////////////////
  /*  End of game animations and winner announced  */
  endGame(winner) {
    animateWinningPieces(winner);
    this.gameOverAnimations[0] = animateArrows();
    fillInWinnerDOM(winner);
    this.gameOverAnimations[1] = animateGameOver();
  }

  //////////////////////////////////////////////
  /*  Set CSS variables based on properties.  */
  setCSSVariables() {
    let root = document.documentElement;
    root.style.setProperty('--number-rows', this._rows + 1);
    root.style.setProperty('--number-cols', this._cols);
    root.style.setProperty('--drop-delay', `${this._dropDelay}ms`);
  }

  //////////////////////////////////////////////
  /*  Add current number of columns to board  */
  addDOMColumns() {
    // Clear all columns from board.
    this.DOMBoard.innerHTML = '';
    const colWrapper = document.createElement('div');
    colWrapper.classList.add('board');
    this.DOMBoard.append(colWrapper);
    // Add columns to board.
    for (let i = 0; i < this._cols; i++) {
      colWrapper.append(this.columnFactory(i));
    }
    this.DOMColumns = colWrapper.children;
    this.addGridBoard(colWrapper);
  }

  ////////////////////////////////////////////////////
  /*  Add grid board to DOM as main board display.  */
  addGridBoard(colWrapper) {
    const gridBoard = document.createElement('div');
    gridBoard.classList.add('grid-board');
    for (let row = 0; row < this._rows; row++) {
      gridBoard.append(this.createGridRow());
    }
    colWrapper.append(gridBoard);
  }

  ///////////////////////////////////////////////////
  /*  Create row of "cutout" cells for grid board. */
  createGridRow() {
    const row = document.createElement('div');
    row.classList.add('grid-row');
    for (let col = 0; col < this._cols; col++) {
      row.append(this.createCuttoutBlock());
    }
    return row;
  }

  ////////////////////////////////////////////////////////////////
  /*  Create block with black circle in center for grid board.  */
  /*  This is a inline-flex with black rounded div inside.      */
  createCuttoutBlock() {
    const cuttOutWrapper = document.createElement('div');
    cuttOutWrapper.classList.add('cuttout-wrapper');

    const cuttOUt = document.createElement('div');
    cuttOUt.classList.add('cuttout');

    cuttOutWrapper.append(cuttOUt);
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
        gameOverDiv.parentElement.classList.add('hidden');
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
    const cols = [...this.DOMBoard.firstElementChild.children].slice(
      0,
      this._cols
    );
    cols.forEach(col => (col.innerHTML = ''));
    // add pieces
    cols.forEach((col, i) => {
      col.innerHTML = this.pieceFactory(i);
      fadePieceIn(i);
    });
  }

  ////////////////////////////////////////////////////////////
  /*  Make board piece HTML. Make with player side showing  */

  pieceFactory(col) {
    const flipped = this.player === 2 ? 'flipped' : '';

    return `<div class="piece-viewport opaque" data-col="${col}">
                    <div class="piece-wrapper flx-std">
                        <div class="piece ${flipped}">
                            <div class="front backface-hidden" data-col="${col}"></div>
                            <div class="back backface-hidden" data-col="${col}"></div>
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

  /////////////////////////////////////////////////////
  /*  Set _rows to given value. Initalize new game.  */
  /**
   * @param {number} num
   */
  set rows(num) {
    this._rows = num;
    this.DOMBoardInit();
    this.initGame();
    this.resetAiDepth();
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
    this.resetAiDepth();
  }

  /////////////////////////////////////
  /*  Set _aiPlayers to given value. */
  /**
   * @param {number} num
   */
  set aiPlayers(num) {
    clearTimeout(this.aiPlayersChangeTimers);
    clearTimeout(this.aiTimeouts);
    this._aiPlayers = num;
    this.resetPlayRate();
    this.resetAiDepth();
    this.aiPlayersChangeTimers = setTimeout(() => {
      let temp = this.moves;
      // looking for game over. If col click is blocked and
      // no moves are being made the game is over init a new game.
      // if moves are being made return.
      if (this.blockColClick) {
        setTimeout(() => {
          if (temp === this.moves) {
            this.initGame();
          }
        }, 3.4 * this._dropDelay);
        return;
      }
      if (this._aiPlayers === 1 && this.player == 2) this.makeAIMove();
      if (this._aiPlayers === 2) {
        // quick flip from one to two ai's can keep
        // ai play active. If this.moves
        // is not chaging make ai move.
        setTimeout(() => {
          if (this.moves === temp) this.makeAIMove();
        }, 2 * this._dropDelay);
      }
    }, 6 * this._dropDelay);
  }

  //////////////////////////////////////
  /*  Set _dropDelay to given value.  */
  resetAiDepth() {
    MAXIMINION.resetDepths();
    document.querySelector('#depth').value = 5;
    document.querySelector('#depth2').value = 5;
  }

  //////////////////////////////////////
  /*  Set _dropDelay to given value.  */
  /**
   * @param {number} num
   */
  set dropDelay(num) {
    this._dropDelay = 1050 - num;
  }

  //////////////////////////////////////
  /*  Setup test board. Manual debug. */
  /**/
  async setBoard() {
    this.aiPlayers = 0;
    this.initGame();
    this._dropDelay = 50;
    const moveList = [
      3,
      6,
      3,
      6,
      3,
      6,
      2,
      4,
      4,
      4,
      2,
      4,
      2,
      4,
      4,
      0,
      0,
      2,
      0,
      0,
      0,
      3,
      2,
      3,
      3,
      2,
      6,
    ];
    for (let col of moveList) {
      this._currColumn = col;
      this.placePiece();
      await sleep(0.07);
    }
  }
}

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}
