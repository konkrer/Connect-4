'use strict'


// Animate board piece dropping and spinning on its way down. 
function animateDrop(col, places) {
    const topPieceViewport = GAME.DOMColumns[col].lastElementChild;

    const height = topPieceViewport.clientHeight;
    // animate this??

    topPieceViewport.style.transition = 'all 1s';
    setTimeout(() => {
        topPieceViewport.style.transform = `translateY(calc(var(--piece-size) * ${places + 1}))`;
        topPieceViewport.firstElementChild.classList.add('fall-flip');
    }, 50);
  
    const newPiece = GAME.pieceFactory(col)

    //  After top piece has dropped add newPiece and fade it in.
    setTimeout(() => {
        topPieceViewport.style.transition = '';
        topPieceViewport.firstElementChild.classList.remove('fall-flip');  // unnecessary???
        topPieceViewport.parentElement.innerHTML += newPiece;    
        if (places > 0) fadePieceIn(col);
    }, 1100);
}

// Fade into view the top piece in a given column.
function fadePieceIn(col) {
    setTimeout(() => {
        GAME.DOMColumns[col].lastElementChild.style.opacity = '1';
    }, 50);
}

// Flip all pieces at top of board for ripple color change.
function animateFlipAllTops() {
    let colList = [...GAME.DOMColumns];
    // Reverse array so ripple originates from board right for player 2.
    if (GAME.player===2) colList = colList.reverse();

    // Wait for piece to drop then begin ripple.
    return setTimeout(() => {

        colList.forEach((col, i) => {
            // Delay each piece flipping for ripple effect. Use index as multiple to delay.
            setTimeout(() => {
                // change transition time for quick 0.5sec flip of piece.
                col.lastElementChild.firstElementChild.firstElementChild.style.transition = 'all 0.5s';
                col.lastElementChild.firstElementChild.firstElementChild.classList.toggle('flipped');
                // 
                setTimeout(() => {
                    // Remove inline transition style to return to default from CSS file.
                    col.lastElementChild.firstElementChild.firstElementChild.style.transition = '';
                    // turn board event listener back on on after last flip in last column.
                    if (i===GAME.cols-1) GAME.setBoardEvtListener();
                }, 500);

            }, 30 * i);  
        });
    }, 1400);
}

// Animate winning pieces to spin then pulse by adding winner class.
// Delay for piece to complete drop in board.
function animateWinningPieces(winner) {
    // winner will be false with tie.
    if (!winner) return;
    setTimeout(() => {
        // for each matrix address (x, y) of winning piece find wrapper in the DOM and add winner class.
        winner.forEach(([row, col]) => {
            const pieceWrapper = GAME.DOMColumns[col].children[(GAME.rows-1)-row].firstElementChild;
            pieceWrapper.classList.add('winner');
        });
    }, 1200);    
}

// Animate "arrows" that shoot in both directions across x-axis in the middle of the game board zone.
// Delayed to wait for winning pieces animation to complete.
function animateArrows() {   
    document.querySelector('.arrow-left').classList.add('shoot-arrow-left');
    document.querySelector('.arrow-left').classList.remove('display-none');           // workaround devtools bug see * below
    document.querySelector('.arrow-right').classList.add('shoot-arrow-right');
    setTimeout(() => {
        document.querySelector('.arrow-left').classList.remove('shoot-arrow-left');
        document.querySelector('.arrow-left').classList.add('display-none');          // workaround devtools bug see * below
        document.querySelector('.arrow-right').classList.remove('shoot-arrow-right');
    }, 6000);
}

// Animate game over placard spinning into view.
// Delayed to allow arrows to cross in center of screen.
function animateGameOver() {
    setTimeout(() => {
        const gameOverDiv = document.querySelector('.game-over');
        gameOverDiv.classList.remove('hidden');
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


//  * devtools shows animation arrow that is off the right side of screen (@ left: 100vw) sometimes. 
//    when checking different devices / screen sizes it appears and breaks the testing view.
//    It's off screen and overflow is set to hidden on body element but still is giving me problems.
//    Setting it to display: none; seemed to do the trick. May not be neccesarry beyond dev-tools bug.
//    I would like to know more about the proper way to have things off screen like I am attempting.