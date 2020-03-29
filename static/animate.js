'use strict'


// Animate board piece dropping and spinning on its way down. 
function animateDrop(col, places) {
    const topPieceViewport = GAME.DOMColumns[col].lastElementChild;

    // Set CSS variable so animation drops piece the correct distance.
    document.documentElement.style.setProperty('--drop-places-count', places+1);
    // Drop piece and spin it on the way down.
    topPieceViewport.classList.add('drop-piece');
    topPieceViewport.firstElementChild.classList.add('fall-flip');
    
    const newPiece = GAME.pieceFactory(col)

    //  After top piece has dropped add newPiece and fade it in.
    setTimeout(() => {
        // If board was cleared during delay exit.
        if (!topPieceViewport.parentElement) return;
        // Set dropped piece to have new top offset.
        topPieceViewport.style.top = `calc(${places+1} * var(--piece-size))`;
        // Remove animation classes from dropped piece.
        topPieceViewport.classList.remove('drop-piece');
        topPieceViewport.firstElementChild.classList.remove('fall-flip');
        // Add new piece to column.
        topPieceViewport.parentElement.innerHTML += newPiece;
        // While column is not yet full of pieces fade new piece in.   
        if (places > 0) fadePieceIn(col);
    }, 1100);
}

// Fade into view the top piece in a given column.
function fadePieceIn(col) {
    // Delayed so GAME object is returned first
    // as this function is called in init method on GAME object.
    // Also delayed for fade in on new pieces to work properly.
    setTimeout(() => {
        GAME.DOMColumns[col].lastElementChild.style.opacity = '1';
    }, 50);
}

// Flip all pieces at top of board for ripple color change.
function animateFlipAllTops() {
    let colList = [...GAME.DOMColumns];
    // Reverse array so ripple originates from board right for player 2.
    const player = GAME.player;
    if (player===2) colList = colList.reverse();

    // Wait for piece to drop then begin ripple.
    return setTimeout(() => {

        colList.forEach((col, i) => {
            // Delay each piece flipping for ripple effect. Use index as multiple to delay.
            setTimeout(() => {
                if (boardIsEmpty()) return;
                col.lastElementChild.firstElementChild.firstElementChild.classList.toggle('flipped');

                // Turn board event listener back on on after last flip in last column.
                // Do after each player in two player game. 
                // Do only after AI's turn in one player game.
                if (
                    i===GAME._cols - 1 
                        && 
                    ( GAME._aiPlayers==0 || (GAME._aiPlayers==1 && player===2) )
                    ) {
                        setTimeout(() => {             
                            GAME.setBoardEvtListener();
                        }, 500);
                    }           

            }, 30 * i);  
        });
    }, 1400);
}

// Animate winning pieces to spin then pulse by adding winner class.
// Delayed to wait for piece to complete drop in board.
function animateWinningPieces(winner) {
    // winner will be false with tie.
    if (!winner) return;
    setTimeout(() => {
        // for each matrix address (y, x) of winning piece find wrapper in the DOM and add winner class.
        winner.forEach(([row, col]) => {
            // Find piece wrapper to animate.
            // Note: In DOMcolumn row order is reversed compared to board matrix.
            const pieceWrapper = GAME.DOMColumns[col].children[(GAME._rows-1)-row].firstElementChild;
            pieceWrapper.classList.add('winner');
        });
    }, 1200);    
}

// Animate "arrows" that shoot in both directions across x-axis in the middle of the game board zone.
// Delayed to wait for winning pieces animation to complete.
function animateArrows() {   
    document.querySelector('.arrow-left').classList.add('shoot-arrow-left');
    // document.querySelector('.arrow-left').classList.remove('display-none');           // workaround devtools bug see * below
    document.querySelector('.arrow-right').classList.add('shoot-arrow-right');
    setTimeout(() => {
        document.querySelector('.arrow-left').classList.remove('shoot-arrow-left');
        // document.querySelector('.arrow-left').classList.add('display-none');          // workaround devtools bug see * below
        document.querySelector('.arrow-right').classList.remove('shoot-arrow-right');
    }, 6000);
}

// Animate game over placard spinning into view.
// Delayed to allow arrows to cross in center of screen.
function animateGameOver() {
    setTimeout(() => {
        const gameOverDiv = document.querySelector('.game-over');
        gameOverDiv.parentElement.classList.remove('hidden');
        gameOverDiv.classList.add('animate-g-over');
    }, 4700);
}

// Add the appropriate text to game-over placard.
function fillInWinnerDOM(winBool) {
    const winnerDiv = document.getElementById('winner');
    let html = '', colorClass;
    // If there was a winner make text announcing winner.
    if (winBool) {
        colorClass = GAME.player===1 ? 'red': 'blue'
        html = `<div>${colorClass.toUpperCase()} PLAYER</div> <div>WINS!!!</div>`;
    }else {
        html = "IT'S A TIE!";
        colorClass = 'green';
    }
    winnerDiv.innerHTML = html;
    winnerDiv.className = colorClass;
}

// Fuction to tell if board is acutally been cleared
// and pieces no longer need to be flipped
function boardIsEmpty() {
    return GAME.board[GAME._rows-1].every(el => !el);
}


//  * devtools shows animation arrow that is off the right side of screen (@ left: 100vw) sometimes. 
//    when checking different devices / screen sizes it appears and breaks the testing view.
//    It's off screen and overflow is set to hidden on body element but still is giving me problems.
//    Setting it to display: none; seemed to do the trick. May not be neccesarry beyond dev-tools bug.
//    I would like to know more about the proper way to have things off screen like I am attempting.