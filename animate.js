'use strict'


const COLUMNS = document.querySelectorAll('.column');


function animateDrop(col, places) {
    const topPieceWrapper = COLUMNS[col].lastElementChild;

    const height = topPieceWrapper.clientHeight;
    topPieceWrapper.style.transform = `translateY(${(places + 1) * height}px)`;
    topPieceWrapper.firstElementChild.classList.add('flip-fall');
    // 
    setTimeout(() => {
        const newPiece = pieceFactory(col);
        topPieceWrapper.parentElement.innerHTML += newPiece;
        if (places > 0) fadePieceIn(col);   
    }, 1500);
}


function fadePieceIn(col) {
    setTimeout(() => {
        COLUMNS[col].lastElementChild.style.opacity = '1';
    }, 50);
}


function animateFlipAllTops() {
    setTimeout(() => {
        COLUMNS.forEach(col => {
            col.lastElementChild.firstElementChild.classList.toggle('flipped');
        });
    }, 1900);
}


function pieceFactory(col) {
    let flipped = '';
    if (game.player===2) fipped = 'flipped';

    return `<div class="piece-wrapper flx-std opaque" data-col="${col}">
                <div class="piece ${flipped}">
                    <div class="front bg-red" data-col="${col}"></div>
                    <div class="back bg-blue" data-col="${col}"></div>
                </div>           
            </div>`
}