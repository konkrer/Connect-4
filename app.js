'use strict'


// Conncet four object and variables.
let GAME = new ConnectFour();

// AI player object.
let MAXIMINION = new Maxaminion();


////////////////////////////
/*  Restart Button Logic  */
/*                        */
// Listen to start buttons to restart game.
const startBtns = document.getElementsByClassName('start-btn');
[...startBtns].forEach(btn => {
    btn.addEventListener('click', restartGame);
});

// Restart game by initalizing game and listening for column clicks.
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

// Listen for changes on settings panel and start new game with new settings.
document.querySelector('.settings-panel').addEventListener('change', settingsChange);

// Set variable and start new game.
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
            GAME.aiPlayers = +targ.value;
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
        default:
            console.error('bad flag settings change');
    }


}