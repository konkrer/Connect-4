'use strict'



// Animate board piece dropping and spinning on its way down. 
function animateDrop(col, places) {
    const topPieceViewport = GAME.DOMColumns[col].lastElementChild;

    const height = topPieceViewport.clientHeight;
    // animate this??
    topPieceViewport.style.transform = `translateY(${(places + 1) * (height + 1)}px)`;

    topPieceViewport.firstElementChild.classList.add('fall-flip');
    
    const newPiece = GAME.pieceFactory(col)

    //  After top piece has dropped add newPiece and fade it in.
    setTimeout(() => {
        topPieceViewport.firstElementChild.classList.remove('fall-flip');  // unnecessary???
        topPieceViewport.parentElement.innerHTML += newPiece;    
        if (places > 0) fadePieceIn(col);
    }, 1100);
}

// Fade into view top piece in given column.
function fadePieceIn(col) {
    setTimeout(() => {
        GAME.DOMColumns[col].lastElementChild.style.opacity = '1';
    }, 50);
}


function animateFlipAllTops() {
    let colList = [...GAME.DOMColumns];
    if (GAME.player===2) colList = colList.reverse();

    return setTimeout(() => {

        colList.forEach((col, i) => {

            setTimeout(() => {
                col.lastElementChild.firstElementChild.firstElementChild.style.transition = 'all .5s';
                col.lastElementChild.firstElementChild.firstElementChild.classList.toggle('flipped');

                setTimeout(() => {
                    col.lastElementChild.firstElementChild.firstElementChild.style.transition = '';
                    // turn board event listener back on on after last flip in last column.
                    if (i===GAME.cols-1) GAME.setBoardEvtListener();
                }, 550);

            }, 50 * i);  
        });
    }, 1400);
}


function animateWinningPieces(winner) {
    if (!winner) return;
    setTimeout(() => {
        winner.forEach(([row, col]) => {
            const pieceWrapper = GAME.DOMColumns[col].children[(GAME.rows-1)-row].firstElementChild;
            pieceWrapper.classList.add('winner');
        });
    }, 1200);    
}

function animateArrows() {   
    document.querySelector('.arrow-left').classList.add('shoot-arrow-left');
    document.querySelector('.arrow-right').classList.add('shoot-arrow-right');
    setTimeout(() => {
        document.querySelector('.arrow-left').classList.remove('shoot-arrow-left');
        document.querySelector('.arrow-right').classList.remove('shoot-arrow-right');
    }, 6000);
}

function animateGameOver() {
    setTimeout(() => {
        const gameOverDiv = document.querySelector('.game-over');
        gameOverDiv.classList.remove('hidden');
        gameOverDiv.classList.add('animate-g-over');
    }, 4700);
}

function fillInWinnerDOM(winBool) {
    const winnerSpan = document.getElementById('winner');
    let html = '', colorClass;
    if (winBool) {
        let player = GAME.player===1 ? 'RED' : 'BLUE';
        colorClass = GAME.player===1 ? 'red': 'blue'
        // text = `${player} PLAYER WINS!!!`;
        html = `<div>${player} PLAYER</div><div>WINS!!!</div>`;
    }else {
        html = "IT'S A TIE!";
        colorClass = 'green';
    }
    winnerSpan.innerHTML = html;
    winnerSpan.className = colorClass;
}