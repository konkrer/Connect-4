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
            const aiPlayers = +targ.value;
            GAME.aiPlayers = aiPlayers;
            const aiOneZone = document.getElementById('ai-1-zone');
            const aiTwoZone = document.getElementById('ai-2-zone');
            if (aiPlayers===1 || aiPlayers===2) aiOneZone.classList.remove('display-none');
            else aiOneZone.classList.add('display-none');
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

document.querySelector('.swatch-zone').addEventListener('click', changeBG);

function changeBG(e) {
    const root = document.documentElement;
    switch(e.target.id) {
        case 'swatch1': {
            root.style.setProperty('--column-bg', 'linear-gradient(#11a60d, rgba(0,0,0,.6))');
            break;
        }
        case 'swatch2': {
            root.style.setProperty('--column-bg', 'linear-gradient(#a6600d, rgba(0,0,0,.6))');
            break;
        }
        case 'swatch3': {
            root.style.setProperty('--column-bg', 'linear-gradient(#230da6, rgba(0,0,0,.6))');
            break;
        }
        case 'swatch4': {
            root.style.setProperty('--column-bg', 'linear-gradient(#a60d8e, rgba(0,0,0,.6))');
            break;
        }
        case 'swatch5': {
            root.style.setProperty('--column-bg', 'linear-gradient(#0da2a6, rgba(0,0,0,.6))');
            break;
        }
        default:
            root.style.setProperty('--column-bg', 'linear-gradient(#0da2a6, rgba(0,0,0,.6))');
    }
}