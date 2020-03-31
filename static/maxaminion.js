'use strict'


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
    }

    /////////////////////////////////////////////////
    /*  Return the column move the AI makes. This  */
    /*  function is for game object to call.       */
    getMove(board, player) {
        let maxim = player===1 ? true : false;
        let depth = player===1 ? this._depth2 : this._depth;
        let algo = player===1 ? this._algo2.bind(this) : this._algo.bind(this);

        return this.minimax(board, maxim, depth, -Infinity, Infinity, algo)[1];
    }

    //////////////////////////////////////////////////
    /*  Minimax algorithm with alpha beta prunning  */
    /*  and recursion depth limit. Adapted from the */
    /*  codecademy ML minimax unit connect four.    */
    /*  Return array is [ evalValue, move, depth ]. */
    minimax(board, maximizing, depth, alpha, beta, algo) {
        // Check for game-over conditions.
        let winnerEval = this.checkForWinner(board);
        let openColumns = this.getOpenColumns(board);
        // If there was a winner or there are no open spaces on board return data.
        if (winnerEval || openColumns.length===0) {
            // If there was no winner winnerEval is False board was full.
            //  winnerEval is set to zero as it was a tie. 
            winnerEval = !winnerEval ? 0 : winnerEval;
            return [winnerEval, '', depth];
        }
        // If depth is zero evaluate board.
        if (depth===0) return [algo(board), '', depth];
        
        let bestDepth = -Infinity;
        openColumns = shuffle(openColumns);
        let bestMove = openColumns[0];

        if (maximizing) {
            let bestValue = -Infinity;
            for (let col of openColumns) {
                let idxRow;
                // Place piece in col note row piece placed into.
                [board, idxRow] = this.placePiece(board, col, 1);
                // Recursive call.
                const results = this.minimax(board, false, depth-1, alpha, beta, algo);
                // Backtracking board state.
                board[idxRow][col] = 0;
                const evalValue = results[0];
                //  maximizing player looks for the highes eval number.
                if (evalValue > bestValue) {
                    bestValue = evalValue;
                    bestMove = col;
                    bestDepth = results[2];
                // More depth allows for longer play / chance for human to err.
                }else if (evalValue===bestValue && results[2] > bestDepth) {
                    bestMove = col;
                    bestDepth = results[2];
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
            let idxRow;
            // Place piece in col note row piece placed into.
            [board, idxRow] = this.placePiece(board, col, 2);
            // Recursive call.
            const results = this.minimax(board, true, depth-1, alpha, beta, algo);
            // Backtracking board state.
            board[idxRow][col] = 0;
            const evalValue = results[0];
            //  minimizing player looks for the lowest eval number.
            if (evalValue < bestValue) {
                bestValue = evalValue;
                bestMove = col;
                bestDepth = results[2];
            // More depth allows for longer play / chance for human to err.
            }else if (evalValue===bestValue && results[2] > bestDepth) {
                bestMove = col;
                bestDepth = results[2];
            }
            // Prune.
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) break;
        }
        return [bestValue, bestMove, bestDepth];    
    }

    ///////////////////////////////////////////////
    /*  Check board for four pieces in a row.    */
    /*  Return evaluation value appropriate for  */
    /*  the winning player if a player has won.  */
    checkForWinner(board) {
        let winnerEval = false;
        // For each row-
        board.forEach((row, i) => {
            // Check each element.
            row.forEach((el, j) => {
                // If piece is here-
                if (el) 
                {
                    // For each delta group --> up-right, right, down-right, down-
                    for (let delta of GAME.deltas) {
                        if ( // If every piece is this player's they have won.
                            delta.every(([dy, dx]) => {
                                // If delta offset found valid row- 
                                if (board[i+dy]) {
                                    // check if cell value matches current element.
                                    return board[i+dy][j+dx] === el;
                                }
                                return false;                    
                            }) // If win set eval value for return.
                        ) winnerEval = el === 1 ? Infinity : - Infinity;
                    }              
                } 
            });
        }); 
        return winnerEval;
    }

    ///////////////////////////////////////////////////
    /*  Return list of game board columns with empty  /
    /*  spots for game pieces to be placed into.    */
    getOpenColumns(board) {
        return board[0].reduce((acc, el, i) => {
            if (el===0) acc.push(i);
            return acc;
        }, [])
    }

    /////////////////////////////////////////////////////
    /*  Place player 'piece' on board in given column. */
    /*  Find first empty spot then break.              */
    placePiece(board, col, player) {
        for (var i=board.length-1; i>=0; i--) {
            if (board[i][col]===0) {
                board[i][col] = player;
                break;
            }
        }
        return [board, i];
    }

    ////////////////////////////////////////////////////
    /*  Allow alternate AI algorithms to be selected. */
    /**
     * @param {number} choice
     */
    set switchEvalAlgo(choice) {
        switch(choice) {
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
        switch(choice) {
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
        const maybeNegative = Math.floor(Math.random() * 2)===0 ? -1 : 1;
        return Math.floor(Math.random() * 10) *  maybeNegative;
    }

    ////////////////////////////
    /*  Evaluation Algorithm. */
    aiLogic1(board) {
        let boardScore = 0 

        board.forEach((row, i) => {
            row.forEach((el, j) => {
                // Horizontal eval
                boardScore += this.horizCheck(board, el, i, j);
                // Vertical eval
                boardScore += this.vertiCheck(board, el, i, j);
                // Horizontal eval
                boardScore += this.upRightCheck(board, el, i, j);
                // Vertical eval
                boardScore += this.downRightCheck(board, el, i, j);
            });
        });
        return boardScore; 
    }

    //////////////////////////////////////////////////
    /*  Analyze value for four cell group.          */
    /*  Looking at element and three to the right.  */
    horizCheck(board, el, row, col) {
        let emptyStreak = el ? 0 : 1;
        let count = 0, endSpaceStreak = 0;
        if (col <= GAME._cols-4) {
            for (let i of [1, 2, 3]) {
                let curr = board[row][col+i];
                if (emptyStreak) {
                    if (!curr) {
                        emptyStreak += 1;
                        // if all spaces eval is zero
                        if (emptyStreak===3) return 0;
                    }else {
                        emptyStreak = - emptyStreak;
                        el = curr;
                    }
                }else {
                    if (curr===el) {
                        count++;
                        endSpaceStreak = 0;
                    }
                    else if (!curr) endSpaceStreak++;
                    else return 0;
                }
            }
            if (count) {
                count = el===2 ? -count : count;
                // if count is +/-2 double value this is three in a row.
                // if two pieces with two empties on each side douvle val.
                if (abs(count)===2 || (emptyStreak===-1 && end_space_streak===1)) {
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
    vertiCheck(board, el, row, col) {
        let emptyStreak = el ? 0 : 1;
        let count = 0;
        if (row <= GAME._rows - 4) {
            for (let i of [1, 2, 3]) {
                let curr = board[row+i][col];
                if (emptyStreak) {
                    if (!curr) {
                        emptyStreak += 1;
                        // if all spaces eval is zero
                        if (emptyStreak===3) return 0;
                    }else {
                        emptyStreak = - emptyStreak;
                        el = curr;
                    }
                }else {
                    if (curr===el) {
                        count++;
                    }
                    return 0;
                }
            }
            if (count) {
                count = el===2 ? -count : count;
                // if count is +/-2 double value this is three in a row.
                // if two pieces with two empties on each side douvle val.
                if (abs(count)===2) {
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
    upRightCheck(board, el, row, col) {
        let emptyStreak = el ? 0 : 1;
        let count = 0, endSpaceStreak = 0;
        if (row > 2 && col <= GAME._cols-4) {
            for (let i of [1, 2, 3]) {
                let curr = board[row-i][col+i];
                if (emptyStreak) {
                    if (!curr) {
                        emptyStreak += 1;
                        // if all spaces eval is zero
                        if (emptyStreak===3) return 0;
                    }else {
                        emptyStreak = - emptyStreak;
                        el = curr;
                    }
                }else {
                    if (curr===el) {
                        count++;
                        endSpaceStreak = 0;
                    }
                    else if (!curr) endSpaceStreak++;
                    else return 0;
                }
            }
            if (count) {
                count = el===2 ? -count : count;
                // if count is +/-2 double value this is three in a row.
                // if two pieces with two empties on each side douvle val.
                if (abs(count)===2) {
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
    downRightCheck(board, el, row, col) {
        let emptyStreak = el ? 0 : 1;
        let count = 0, endSpaceStreak = 0;
        if (row <= GAME._rows-4 && col <= GAME._cols-4) {
            for (let i of [1, 2, 3]) {
                let curr = board[row+i][col+i];
                if (emptyStreak) {
                    if (!curr) {
                        emptyStreak += 1;
                        // if all spaces eval is zero
                        if (emptyStreak===3) return 0;
                    }else {
                        emptyStreak = - emptyStreak;
                        el = curr;
                    }
                }else {
                    if (curr===el) {
                        count++;
                        endSpaceStreak = 0;
                    }
                    else if (!curr) endSpaceStreak++;
                    else return 0;
                }
            }
            if (count) {
                count = el===2 ? -count : count;
                // if count is +/-2 double value this is three in a row.
                // if two pieces with two empties on each side douvle val.
                if (abs(count)===2) {
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