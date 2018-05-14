/*
 * init.js
 *
 * global variables
 * javascript entrypoint
 * basic functions required during initialization
 * 
 * There are two types of classes in the game:
 * 1) 'Layers' - these are the major UI components of the game
 *     a) Mallet  - The mallet has focus during gameplay and receives all input events
 *     b) Game    - The playing field and blood effects
 *     c) Menu    - a menu of choices - game start, settings, view scores, exit, etc
 *     d) Hud     - on-screen statistics during gameplay
 *     e) EndGame - after a game ends - with chance to restart and put your name for highscore list
 *     f) Title   - beginning animation
 *     g) Help    - a slideshow giving instructions
 *
 * 2) model classes - things that don't have a direct on-screen presence
 *     a) Actor - one specific character
 *     b) Cast  - the ensemble of all Actors
 *     c) Hole  - this manages how a character pops up and down
 *     d) Sound - an audio or set of audio corresponding to one game 'sound effect'
 *     e) Score - keeps statistics and deals with persistence
 *     f) Util  - a bunch of various utility functions
 */

"use strict";

const States = Object.freeze({"LOADING":0, "TITLE":1, "MENU":2, "PLAYING":3, 
                            "GAMEOVER":4, "WINNER":5, "HELP":6, "QUIT":7, "PAUSED":8});

const TransitionDelay = 250;
const WatchInterval   = 30;
/*time to be at 60seconds
const time = 60
*/
// S will contains the game score 
var S = null;

// as we transition through game states, change this variable
var currentState = States.LOADING;

// L contains the full-screen layers
var L = {
    trueSize:0,
    overallScale:0,
    mallet:null,
    title:null,
    menu:null,
    hud:null,
    won:null,
    lost:null,
    blood:null,
    gameover:null,
    background:null,
    help:null,
    highscore:null
};


/*
 * Transition functions control the CSS visibility of iframes, 
 * and then optionally runs a callback after the fade is complete.
 *
 * this works using the rules in main.css:
 * an element having fading="fade-out" will have its opacity reduced to 0%
 * an element having fading="fade-in" will have its opacity increased to 100%
 * an element having class="hidden" will not be displayed.
 */
const fadeFrom = (id) => {
    console.log(`fadeFrom(${id})`);
    return new Promise((resolve, reject) => {
        let element = document.getElementById(id);
        element.setAttribute('fading', 'fade-out');
        setTimeout(() => {
            element.classList.add('hidden');
            element.removeAttribute('fading');
            resolve();
        }, TransitionDelay);
    });
}

const fadeTo = (id) => {
    console.log(`fadeTo(${id})`);
    return new Promise((resolve, reject) => {
        let element = document.getElementById(id);
        element.setAttribute('fading', 'fade-in');
        element.classList.remove('hidden');
        setTimeout(() => {
            element.removeAttribute('fading');
            resolve();
        }, TransitionDelay);
    });
}

const doError = (message) => {
    console.log(`doError(${message})`);
    let eframe = document.getElementById("error");
    let err = document.createElement('p');
    err.innerHTML = message;
    document.getElementById('error_cause').appendChild(err);
    eframe.classList.remove('hidden');
    throw "Fatal, cannot continue.";
}

/*
 * This is the javascript entrypoint from index.html body.onload()
 * 
 * Use old school function() notation so IE doesn't shit too early
 */
var init = function() {
    console.log("init()");
    
    // fixes for IOS, Retina Mac, and Samsung phone devices
    //document.body.style.fontSize = (document.body.offsetWidth * .282) + '%'; 
    document.ontouchmove = (e) => { e.preventDefault(); }
    console.log(`pixelRatio: ${window.devicePixelRatio} Width: ${document.body.clientWidth} Height: ${document.body.clientHeight}`);
    L.trueSize = Math.min(document.body.clientWidth, document.body.clientHeight);
    L.offset = new Coord(Math.max(0, Math.floor((document.body.clientWidth - L.trueSize)/2)),
                         Math.max(0, Math.floor((document.body.clientHeight - L.trueSize)/2)));
    L.trueSize = window.devicePixelRatio * L.trueSize;
    L.overallScale = L.trueSize / 960;
    console.log(`trueSize: ${L.trueSize} overallScale: ${L.overallScale}`);
    S = new Score();
    L.title = new Title();
    L.help = new Help();
    L.mallet = new Mallet(); 
    L.game = new Game();
    L.menu = new Menu();
    L.hud  = new Hud();
    L.blood = new Blood();
    L.gameover = new Gameover();
    L.background = new Background();
    L.highscore  = new Highscore();
    // use Promise.all() to run in parallel - all() expects an array of promises (returned from functions)
    Promise.all([
//            L.title.init(),
            S.init(),
            L.help.init(),
            L.menu.init(),
            L.hud.init(),
//            L.won.init(),
//            L.lost.init(),
            L.game.init(),
            L.mallet.init(),
            L.blood.init(),
            L.gameover.init(),
            L.background.init(),
            L.highscore.init()
    ]) // chained events run serially - then() expects a function, not a promise (so wrap function invocations)
    .catch(reason => doError(reason))
    .then(() => fadeFrom('loading'))
    .then(() => L.background.start())
    .then(() => L.menu.start())
    .catch(reason => doError(reason)); 
}
