'use strict'


let GAME = new ConnectFour(6, 1);


/*  If click was on any element with a data-col attribute,  */
/*  set currColumn on GAME object.                          */
function setCurrCol(e) {
    const col = e.target.dataset['col'];
    if (col) {
        GAME.currCol = +col;
    } 
}


const startBtns = document.getElementsByClassName('start-btn');
[...startBtns].forEach(btn => {
    btn.addEventListener('click', restartGame);
});

function restartGame(e) {
    GAME.initGame()
    GAME.DOMBoard.addEventListener('click', setCurrCol);
}