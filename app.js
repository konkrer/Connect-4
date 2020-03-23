'use strict'


const game = new ConnectFour(6, 7);


/*  Listen for click on game board to place piece on board. */
game.DOMBoard.addEventListener('click', setCurrCol);

/*  If click was on any element with a data-col attribute,  */
/*  set currColumn on game object.                          */
function setCurrCol(e) {
    const col = e.target.dataset['col'];
    if (col) {
        game.currCol = +col;
    } 
}


const startBtns = document.getElementsByClassName('start-btn');
[...startBtns].forEach(btn => {
    btn.addEventListener('click', restartGame);
});

function restartGame(e) {
    game.initGame()
    game.DOMBoard.addEventListener('click', setCurrCol);
}