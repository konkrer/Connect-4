'use strict';

//////////////////////////////////////////////////
/*  A class to hold methods and settings for a  */
/*  minimax AI second player.                   */
class Maxaminion {
  constructor() {
    // These settings are for player 2 the default blue AI player.
    this._depth = 5;
    this._algo = this.aiLogic1;
    // These settings are for player 1 the red AI player (AI vs. AI).
    this._depth2 = 5;
    this._algo2 = this.aiLogic1;
    // These are delta offsets from current position to allow corresponding GAME.deltas
    // to check all relevant groups looking for win or block.
    this.startDeltas = [
      [
        [3, -3],
        [2, -2],
        [1, -1],
        [0, 0],
      ],
      [
        [0, -3],
        [0, -2],
        [0, -1],
        [0, 0],
      ],
      [
        [-3, -3],
        [-2, -2],
        [-1, -1],
        [0, 0],
      ],
      [
        [-3, 0],
        [-2, 0],
        [-1, 0],
        [0, 0],
      ],
    ];
  }

  /////////////////////////////////////////////////
  /*  Return the column move the AI makes. This  */
  /*  function is for game object to call.       */
  /*  Player one is the maximizing player.       */
  getMove() {
    const maximizing = GAME.player === 1 ? true : false;
    const depth = GAME.player === 1 ? this._depth2 : this._depth;
    const algo =
      GAME.player === 1 ? this._algo2.bind(this) : this._algo.bind(this);

    return this.minimax(maximizing, depth, -Infinity, Infinity, algo)[1];
  }

  //////////////////////////////////////////////////
  /*  Minimax algorithm with alpha beta prunning  */
  /*  and recursion depth limit. Adapted from the */
  /*  codecademy ML minimax unit connect four.    */
  /*  Return array is [ evalValue, move, depth ]. */
  minimax(maximizing, depth, alpha, beta, algo, y = null, x = null) {
    // Check for game-over conditions. See if the last player won
    // or board is full.
    let winnerEval = this.checkForWinner(!maximizing, y, x);
    let openColumns = this.getOpenColumns();
    // If there was a winner or there are no open spaces on board return data.
    if (winnerEval || openColumns.length === 0) {
      // If there was no winner winnerEval is False board was full.
      //  winnerEval is set to zero as it was a tie.
      winnerEval = !winnerEval ? 0 : winnerEval;
      return [winnerEval, '', depth];
    }
    // If depth is zero evaluate board.
    if (depth === 0) return [algo(), '', depth];

    let bestDepth = depth;
    openColumns = shuffle(openColumns);
    let [bestMove, best] = this.getBestMove(openColumns, depth, maximizing);

    if (maximizing) {
      let bestValue = -Infinity;
      for (let col of openColumns) {
        // Place piece in col note the row piece was placed into.
        const idxRow = this.placePieceInBoard(col, 1);
        // Recursive call.
        const [evalValue, , newDepth] = this.minimax(
          // input values
          false,
          depth - 1,
          alpha,
          beta,
          algo,
          idxRow,
          col
        );
        // Backtrack board and openRowinCol state.
        GAME.board[idxRow][col] = 0;
        GAME.openRowInCol.set(col, GAME.openRowInCol.get(col) + 1);
        //  maximizing player looks for the highes eval number.
        if (evalValue > bestValue) {
          bestValue = evalValue;
          bestMove = col;
          bestDepth = newDepth;
        } else if (
          // More depth allows for longer play / chance for human to err.
          // Select for greater depth if eval scores are equal.
          // But, if eval shows other player wins and there is a best
          // move, don't set anything here. This is so if all column moves
          // lead to the other player winning a blocking move or
          //  non-pedestal move will be used.
          (evalValue !== -Infinity || (evalValue === -Infinity && !best)) &&
          evalValue === bestValue &&
          newDepth < bestDepth
        ) {
          bestMove = col;
          bestDepth = newDepth;
        }
        // Prune.
        alpha = Math.max(alpha, bestValue);
        if (alpha >= beta) break;
      }
      return [bestValue, bestMove, bestDepth];
    }
    // minimizing
    let bestValue = Infinity;
    for (let col of openColumns) {
      // Place piece in col note row piece placed into.
      const idxRow = this.placePieceInBoard(col, 2);
      // Recursive call.
      const [evalValue, , newDepth] = this.minimax(
        // input values
        true,
        depth - 1,
        alpha,
        beta,
        algo,
        idxRow,
        col
      );
      // Backtrack board and openRowinCol state.
      GAME.board[idxRow][col] = 0;
      GAME.openRowInCol.set(col, GAME.openRowInCol.get(col) + 1);
      //  minimizing player looks for the lowest eval number.
      if (evalValue < bestValue) {
        bestValue = evalValue;
        bestMove = col;
        bestDepth = newDepth;
      } else if (
        // More depth allows for longer play / chance for human to err.
        // Select for greater depth if eval scores are equal.
        // But, if eval shows other player wins and there is a best
        // move, don't set anything here. This is so if all column moves
        // lead to the other player winning a blocking move or
        //  non-pedestal move will be used.
        (evalValue !== Infinity || (evalValue === Infinity && !best)) &&
        evalValue === bestValue &&
        newDepth < bestDepth
      ) {
        bestMove = col;
        bestDepth = newDepth;
      }
      // Prune.
      beta = Math.min(beta, bestValue);
      if (beta <= alpha) break;
    }
    return [bestValue, bestMove, bestDepth];
  }

  /////////////////////////////////////////////
  /*  Check board for four pieces in a row.    */
  /*  Return evaluation value appropriate for  */
  /*  the winning player if a player has won.  */
  checkForWinner(maximizing, y, x) {
    if (x === null || y === null) return false;
    const player = maximizing ? 1 : 2;
    let winnerEval = false;

    // for each deltas group in start position deltas
    this.startDeltas.forEach((group, i) => {
      // for each delta offset to the current position
      group.forEach(([dy, dx]) => {
        let a = y + dy,
          b = x + dx;
        // if piece in board at current start position is player's
        if (GAME.board[a] && GAME.board[a][b] === player) {
          // win if each of the offsets to the current position is players piece
          if (
            GAME.deltas[i].every(([dy1, dx1]) => {
              if (
                GAME.board[a + dy1] &&
                GAME.board[a + dy1][b + dx1] === player
              ) {
                return true;
              } else return false;
            })
          )
            winnerEval = player === 1 ? Infinity : -Infinity;
        }
      });
    });
    return winnerEval;
  }

  ///////////////////////////////////////////////////
  /*  Return list of game board columns with empty */
  /*  spots for game pieces to be placed into.     */
  getOpenColumns() {
    return GAME.board[0].reduce((acc, el, i) => {
      if (el === 0) acc.push(i);
      return acc;
    }, []);
  }

  //////////////////////////////////////////////////////////
  /*  Set player number in board in open spot in column.  */
  /*  Decrement openRow value in openRowInCol Map.        */
  /*  Return row index where player piece is now.         */
  placePieceInBoard(col, player) {
    const openRow = GAME.openRowInCol.get(col);
    // Decrement value for this column.
    GAME.openRowInCol.set(col, openRow - 1);
    GAME.board[openRow][col] = player;
    return openRow;
  }

  //////////////////////////////////////////////////////////////////
  /*  Get Best Move function.                                     */
  /*  If called at top level of minimax recursion then:           */
  /*  If any move blocks a winning play pick it as the best move. */
  /*  If there is not a blocking move pick a non-pedestal move.   */
  /*  (A "pedestal move" being a move that creates a              */
  /*  winning opportunity for opponent)                           */
  /*  If no block or non-pedestal moves pick first element.       */
  getBestMove(openCols, depth, maximizing) {
    // if no blocking moves prefer non-pedestal moves
    const notpedestal = [];
    if (
      // only check at top level of recursion
      (maximizing && depth === this._depth2) ||
      (!maximizing && depth === this._depth)
    ) {
      for (let col of openCols) {
        const openRow = GAME.openRowInCol.get(col);
        if (this.checkForBlock(openRow, col)) {
          return [col, true];
        }
        if (!this.checkForpedestal(openRow - 1, col, maximizing)) {
          notpedestal.push(col);
        }
      }
    }
    if (notpedestal.length > 0) return [notpedestal[0], true];
    return [openCols[0], false];
  }

  //////////////////////////////////////////////////
  /*  Check if placing opponents piece above      */
  /*  just placed piece creates win for opponent. */
  checkForpedestal(openRow, col, maximizing) {
    // if no spot above return
    if (openRow < 0) return false;
    // place opponents piece, check for win, backtrack
    GAME.board[openRow][col] = maximizing ? 2 : 1;
    const winner = this.checkForWinner(!maximizing, openRow, col);
    GAME.board[openRow][col] = 0;
    return winner ? true : false;
  }

  //////////////////////////////////////////////////////////
  /*  Check if putting a piece at y, x in board will      */
  /*  block a winning play. If three of opponents pieces  */
  /*  and one of players in a relevant delta group a      */
  /*  block happened. Return true or false.               */
  checkForBlock(y, x) {
    // set player in board temporarily.
    GAME.board[y][x] = GAME.player;
    let block = false;

    // for each deltas group in start position deltas
    this.startDeltas.forEach((group, i) => {
      // for each delta offset to the current position
      group.forEach(([dy, dx]) => {
        let a = y + dy,
          b = x + dx;
        // if piece in board at current start position
        if (GAME.board[a] && GAME.board[a][b]) {
          let selfCount = 0;
          let fail = false;
          if (GAME.board[a][b] === GAME.player) selfCount++;
          // for each of the offsets to the current start position
          GAME.deltas[i].forEach(([dy1, dx1]) => {
            let m = a + dy1,
              n = b + dx1;
            // if not valid spot or no piece there fail
            if (!GAME.board[m] || !GAME.board[m][n]) fail = true;
            else if (GAME.board[m][n] === GAME.player) selfCount++;
          });
          // if not fail and selfCount is one a block happened
          if (!fail && selfCount === 1) {
            // backtrack
            block = true;
          }
        }
      });
    });
    // backtrack
    GAME.board[y][x] = 0;
    return block;

    // // for each deltas group in start position deltas
    // for (let i = 0; i < this.startDeltas.length; i++) {
    //   // for each delta offset to the current position
    //   for (let [dy, dx] of this.startDeltas[i]) {
    //     let a = y + dy,
    //       b = x + dx;
    //     // if piece in board at current start position
    //     if (GAME.board[a] && GAME.board[a][b]) {
    //       // keep count of current players piece count
    //       let selfCount = 0;
    //       let fail = false;
    //       if (GAME.board[a][b] === GAME.player) selfCount++;
    //       // for each of the offsets to the current start position
    //       for (let [dy1, dx1] of GAME.deltas[i]) {
    //         let m = a + dy1,
    //           n = b + dx1;
    //         // if not valid spot of no piece there fail
    //         if (!GAME.board[m] || !GAME.board[m][n]) {
    //           fail = true;
    //           break;
    //         } else if (GAME.board[m][n] === GAME.player) selfCount++;
    //       }
    //       // if not fail and selfCount is one a block happened
    //       if (!fail && selfCount === 1) {
    //         // backtrack
    //         GAME.board[y][x] = 0;
    //         return true;
    //       }
    //     }
    //   }
    // }
    // // backtrack
    // GAME.board[y][x] = 0;
    // return false;
  }

  ////////////////////////////////////////////////////
  /*  Allow alternate AI algorithms to be selected. */
  /**
   * @param {number} choice
   */
  set switchEvalAlgo(choice) {
    switch (choice) {
      case 1: {
        this._algo = this.randomEval;
        break;
      }
      case 2: {
        this._algo = this.aiLogic1;
        break;
      }
      default: {
        console.error('bad switchEvalAlgo flag');
      }
    }
  }

  /////////////////////////////////
  /*  Reset both AI depths to 5. */
  resetDepths() {
    this._depth = 5;
    this._depth2 = 5;
  }

  ///////////////////////////////////////////////
  /*  Allow AI recursion depth to be selected. */
  /**
   * @param {number} choice
   */
  set depth(choice) {
    this._depth = choice;
  }

  ////////////////////////////////////////////////////
  /*  Allow alternate AI algorithms to be selected. */
  /**
   * @param {number} choice
   */
  set switchEvalAlgo2(choice) {
    switch (choice) {
      case 1: {
        this._algo2 = this.randomEval;
        break;
      }
      case 2: {
        this._algo2 = this.aiLogic1;
        break;
      }
      default: {
        console.error('bad switchEvalAlgo flag');
      }
    }
  }

  ///////////////////////////////////////////////
  /*  Allow AI recursion depth to be selected. */
  /**
   * @param {number} choice
   */
  set depth2(choice) {
    this._depth2 = choice;
  }

  /////////////////////////////////////////////
  /*  Return a randow value from -10 to 10.  */
  randomEval() {
    const maybeNegative = Math.floor(Math.random() * 2) === 0 ? -1 : 1;
    return Math.floor(Math.random() * 10) * maybeNegative;
  }

  ////////////////////////////
  /*  Evaluation Algorithm. */
  aiLogic1() {
    let boardScore = 0;

    GAME.board.forEach((row, i) => {
      row.forEach((el, j) => {
        // Horizontal eval
        boardScore += this.horizCheck(el, i, j);
        // Vertical eval
        boardScore += this.vertiCheck(el, i, j);
        // Horizontal eval
        boardScore += this.upRightCheck(el, i, j);
        // Vertical eval
        boardScore += this.downRightCheck(el, i, j);
      });
    });
    return boardScore;
  }

  //////////////////////////////////////////////////
  /*  Analyze value for four cell group.          */
  /*  Looking at element and three to the right.  */
  horizCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0,
      endSpaceStreak = 0;
    if (col <= GAME._cols - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row][col + i];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            // if all spaces eval is zero
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
            endSpaceStreak = 0;
          } else if (!curr) endSpaceStreak++;
          else return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        // if count is +/-2 double value this is three in a row.
        // if two pieces with two empties on each side douvle val.
        if (
          abs(count) === 2 ||
          (emptyStreak === -1 && end_space_streak === 1)
        ) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }

  //////////////////////////////////////////////
  /*  Analyze value for four cell group.      */
  /*  Looking at element and the three below. */
  vertiCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0;
    if (row <= GAME._rows - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row + i][col];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            // if all spaces eval is zero
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
          }
          return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        // if count is +/-2 double value this is three in a row.
        // if two pieces with two empties on each side douvle val.
        if (abs(count) === 2) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }

  ////////////////////////////////////////////////////////
  /*  Analyze value for four cell group.                */
  /*  Looking at element and three up and to the right. */
  upRightCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0,
      endSpaceStreak = 0;
    if (row > 2 && col <= GAME._cols - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row - i][col + i];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            // if all spaces eval is zero
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
            endSpaceStreak = 0;
          } else if (!curr) endSpaceStreak++;
          else return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        // if count is +/-2 double value this is three in a row.
        // if two pieces with two empties on each side douvle val.
        if (abs(count) === 2) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }

  //////////////////////////////////////////////////////////
  /*  Analyze value for four cell group.                  */
  /*  Looking at element and three down and to the right. */
  downRightCheck(el, row, col) {
    let emptyStreak = el ? 0 : 1;
    let count = 0,
      endSpaceStreak = 0;
    if (row <= GAME._rows - 4 && col <= GAME._cols - 4) {
      for (let i of [1, 2, 3]) {
        const curr = GAME.board[row + i][col + i];
        if (emptyStreak) {
          if (!curr) {
            emptyStreak += 1;
            // if all spaces eval is zero
            if (emptyStreak === 3) return 0;
          } else {
            emptyStreak = -emptyStreak;
            el = curr;
          }
        } else {
          if (curr === el) {
            count++;
            endSpaceStreak = 0;
          } else if (!curr) endSpaceStreak++;
          else return 0;
        }
      }
      if (count) {
        count = el === 2 ? -count : count;
        // if count is +/-2 double value this is three in a row.
        // if two pieces with two empties on each side douvle val.
        if (abs(count) === 2) {
          return count * 2;
        }
        return count;
      }
    }
    return 0;
  }
}

// shuffle array.
function shuffle(arr) {
  for (let i in arr) {
    const rando = Math.floor(Math.random() * arr.length);
    [arr[rando], arr[i]] = [arr[i], arr[rando]];
  }
  return arr;
}
// return absolute value of number.
function abs(val) {
  return val > 0 ? val : val * -1;
}
