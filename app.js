'use strict'


// Conncet four object and variables.
let GAME = new ConnectFour();

// AI player object.
let MAXIMINION = new Maxaminion();


////////////////////////////
/*  Restart Button Logic  */
/*                        */
// Listen to restart buttons to restart game.
const startBtns = document.getElementsByClassName('start-btn');
[...startBtns].forEach(btn => {
    btn.addEventListener('click', restartGame);
});

// Restart game by initalizing game.
function restartGame(e) {
    GAME.initGame()
}


//////////////////////////
/*  Column click Logic  */
/*                      */
// If click was on any board column (element with a data-col attribute),
// pass column number to GAME object by setting property.
function setCurrCol(e) {
    const col = e.target.dataset['col'];
    if (col) {
        GAME.currCol = +col;
    } 
}


///////////////////////////
/*  Settings menu Logic  */
/*                       */
// Allow clicking gear to open settings and close.
const settings = document.querySelector('.settings-zone img');
settings.addEventListener('click', toggleSettingsPanel);

// Allow mouseover to keep settings panel open.
const settingsPanel = document.querySelector('.settings-panel');
settingsPanel.addEventListener('mouseover', clearSettingPanelTimeout);
settingsPanel.addEventListener('mouseout', refreshSettingPanelTimeout);

// timer id for settings panel timeout.
let settingsPanelTimer;

// Show or hide settings panel.
function toggleSettingsPanel(e) {
    if (settingsPanel.classList.contains('hidden')) {
        settingsPanel.classList.remove('hidden');
        settingsPanel.classList.remove('opaque');
        refreshSettingPanelTimeout()      
    }else {
        clearTimeout(settingsPanelTimer);
        settingsPanel.classList.add('opaque');
        setTimeout(() => {
            settingsPanel.classList.add('hidden');
        }, 550);
    }  
}

// Refresh timer that hides setting panel.
function refreshSettingPanelTimeout() {
    clearTimeout(settingsPanelTimer);
    settingsPanelTimer = setTimeout(() => {
        toggleSettingsPanel();
    }, 2000);
}

// Clear timer that hides setting panel.
function clearSettingPanelTimeout() {
    clearTimeout(settingsPanelTimer);
}

// Listen for changes on settings panel and set game object variables.
document.querySelector('.settings-panel').addEventListener('change', settingsChange);

// Set variables.
function settingsChange(e) {
    const targ = e.target;
    switch(targ.name) {
        case 'cols': {
            GAME.cols = +targ.value;
            break;
        }
        case 'rows': {
            GAME.rows = +targ.value;
            break;
        }
        case 'ai-players': {
            // value is number of ai players picked set property on game object.
            const aiPlayers = +targ.value;
            GAME.aiPlayers = aiPlayers;
            // additional settings zones that we hide or show.
            const aiOneZone = document.getElementById('ai-1-zone');
            const aiTwoZone = document.getElementById('ai-2-zone');
            // decide what settings zones to show.
            // first zone shows if one or two ai's picked.
            if (aiPlayers===1 || aiPlayers===2) aiOneZone.classList.remove('display-none');
            else aiOneZone.classList.add('display-none');
            // second zone shows if there are 2 ai's playing.
            if (aiPlayers===2) aiTwoZone.classList.remove('display-none');
            else aiTwoZone.classList.add('display-none');
            break;
        }
        case 'ai-algo': {
            MAXIMINION.switchEvalAlgo = +targ.value;
            break;
        }
        case 'depth': {
            MAXIMINION.depth = +targ.value;
            break;
        }
        case 'ai-algo-2': {
            MAXIMINION.switchEvalAlgo2 = +targ.value;
            break;
        }
        case 'depth2': {
            MAXIMINION.depth2 = +targ.value;
            break;
        }
        default:
            console.error('bad flag settings change');
    }
}

// Listen for clicks on color swatches.
document.querySelector('.swatch-zone').addEventListener('click', changeBG);

// Function to allow clicking color swatches to change board colors.
function changeBG(e) {
    const root = document.documentElement;
    switch(e.target.id) {
        case 'swatch1': {
            root.style.setProperty('--column-bg', 'linear-gradient(#11a60d, rgba(13, 160, 165, 0.05))');
            break;
        }
        case 'swatch2': {
            root.style.setProperty('--column-bg', 'linear-gradient(#a6520d, rgba(166, 82, 13, 0.05))');
            break;
        }
        case 'swatch3': {
            root.style.setProperty('--column-bg', 'linear-gradient(#3b0da6, rgba(59, 13, 166, 0.05))');
            break;
        }
        case 'swatch4': {
            root.style.setProperty('--column-bg', 'linear-gradient(#a60d8e, rgba(166, 13, 143, 0.05))');
            break;
        }
        case 'swatch5': {
            root.style.setProperty('--column-bg', 'linear-gradient(#0da2a6, rgba(13, 160, 165, 0.05))');
            break;
        }
        default:
            root.style.setProperty('--column-bg', 'linear-gradient(#0da2a6, rgba(0,0,0,.6))');
    }
}

// Listen for clicks to change game board display.
document.querySelector('.board-type-zone').addEventListener('click', changeBoardType);

// Show or hide appropriate game board.
function changeBoardType(e) {

    if (e.target.id=="board-overlay-icon") {
        [...GAME.DOMColumns].forEach(col => col.classList.remove('column-visible'));
        document.querySelector('.overlay-grid').classList.remove('hidden');
    }else if (e.target.id=="board-columns-icon") {
        [...GAME.DOMColumns].forEach(col => col.classList.add('column-visible'));
        document.querySelector('.overlay-grid').classList.add('hidden');
    }
}