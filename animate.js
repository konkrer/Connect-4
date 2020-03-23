'use strict'


const COLUMNS = document.querySelectorAll('.column');


function animateDrop(col, places) {
    const topPieceWrapper = COLUMNS[col].lastElementChild;

    const height = topPieceWrapper.clientHeight;
    topPieceWrapper.style.transform = `translateY(${(places + 1) * (height + 1)}px)`;

    if (game.player===1) topPieceWrapper.firstElementChild.style.transform = 'rotateY(3turn)';
    else topPieceWrapper.firstElementChild.style.transform = 'rotateY(-2.5turn)'                  // why doesn't this turn the oppistie way?
    
    const newPiece = game.pieceFactory(col)

    //  After top piece has dropped add newPiece and fade it in.
    if (places > 0) setTimeout(() => {
        topPieceWrapper.parentElement.innerHTML += newPiece;    
        fadePieceIn(col);   
    }, 1500);
}

// Fade into view top piece in given column.
function fadePieceIn(col) {
    setTimeout(() => {
        COLUMNS[col].lastElementChild.style.opacity = '1';
    }, 50);
}


function animateFlipAllTops() {
    let colList = [...COLUMNS];
    if (game.player===2) colList = colList.reverse();

    return setTimeout(() => {
        colList.forEach((col, i) => {
            setTimeout(() => {
                col.lastElementChild.firstElementChild.style.transition = 'all .5s';
                col.lastElementChild.firstElementChild.classList.toggle('flipped');
                setTimeout(() => {
                    col.lastElementChild.firstElementChild.style.transition = '';
                }, 550);
            }, 70 * i);       
        });
    }, 2000);
}


