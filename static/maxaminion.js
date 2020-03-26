'use strict'

//////////////////////////////////////////////////
/*  A class to hold methods and settings for a  */
/*  minimax AI second player.                   */
class Maxaminion {
    constructor() {
        this._depth = 5;
        this._evalFunction = this.randomEval;
    }

    /////////////////////////////////////////////
    /*  Return a randow value from -10 to 10.  */
    randomEval() {
        const maybeNegative = Math.floor(Math.random() * 2)===0 ? -1 : 1;
        return Math.floor(Math.random() * 10) *  maybeNegative;
    }

    /////////////////////////////////////////////////
    /*  Return the column move the AI makes. This  */
    /*  function is for game object to call.       */
    getMove(board) {
        return this.minimax(board, false, this._depth, -Infinity, Infinity)[1];
    }

    /////////////////////////////////////////////////
    /*  Minimax algorithm with alpha beta prunning  */
    /*  and recursion depth limit.                  */
    /*  Return array is [ evalValue, move, depth ]. */
    minimax(board, maximizing, depth, alpha, beta) {
        // Check for game-over conditions
        let winnerEval = this.checkForWinner(board);
        let openColumns = this.getOpenColumns(board);
        // If there was a winner or there are no open spaces on board-
        if (winnerEval || openColumns.length===0) {
            // If there was no winner winnerEval is False board was full.
            //  winnerEval is set to zero as it was a tie. 
            winnerEval = !winnerEval ? 0 : winnerEval;
            return [winnerEval, '', depth];
        }
        // If depth is zero evaluate board.
        if (depth===0) return [this._evalFunction(board), '', depth];
        
        let bestDepth = -Infinity;
        openColumns = shuffle(openColumns);
        let bestMove = openColumns[0];

        if (maximizing) {
            let bestValue = -Infinity;
            for (let col of openColumns) {
                let idxRow;
                [board, idxRow] = this.placePiece(board, col, 1);
                // Recursive call.
                const results = this.minimax(board, false, depth-1, alpha, beta);
                // Backtracking board state.
                board[idxRow][col] = 0;
                const evalValue = results[0];
                //  maximizing player looks for the highes eval number.
                if (evalValue > bestValue) {
                    bestValue = evalValue;
                    bestMove = col;
                    bestDepth = results[2];
                // More depth allows for longer play / chance for human err.
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
            [board, idxRow] = this.placePiece(board, col, 2);
            // Recursive call.
            const results = this.minimax(board, true, depth-1, alpha, beta);
            // Backtracking board state.
            board[idxRow][col] = 0;
            const evalValue = results[0];
            //  minimizing player looks for the lowest eval number.
            if (evalValue < bestValue) {
                bestValue = evalValue;
                bestMove = col;
                bestDepth = results[2];
            // More depth allows for longer play / chance for human err.
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

    ///////////////////////////////////////////////////
    /*  Check board for four pieces in a row.        */
    /*  Return evaluation value appropriate for the  */
    /*  winning player.                              */
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
                            delta.every(([dx, dy]) => {
                                // If delta offset found valid row- 
                                if (board[i+dx]) {
                                    // check if cell value matches current element.
                                    return board[i+dx][j+dy] === el;
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
                this._evalFunction = this.randomEval;
                break;
            }
            case 2: {
                this._evalFunction = this.aiLogic1;
                break;
            }
            default: {
                console.error('bad switchEvalAlgo flag');
            }
        }
    }

    aiLogic1() {

    }

 }



function shuffle(arr) {
    for (let i in arr) {
        const rando = Math.floor(Math.random() * arr.length);
        [arr[rando], arr[i]] = [arr[i], arr[rando]];
    }
    return arr;
}