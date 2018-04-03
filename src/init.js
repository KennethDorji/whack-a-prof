/*
 * init.js
 *
 * global variables
 * javascript entrypoint
 * basic functions required during initialization
 *
 */

"use strict";

const States = Object.freeze({"LOADING":0, "TITLE":1, "MENU":2, "PLAYING":3, 
                            "GAMEOVER":4, "WINNER":5, "HELP":6, "QUIT":7});

const TransitionDelay = 250;
const WatchInterval   = 30;

// S contains the game meta state
var S = {
    resourcesTotal:0,
    resourcesLoaded:0,
    currentState:States.LOADING,
    highScore:0,
    currentScore:0
};

// L contains the full-screen layers
var L = {
    trueSize:0,
    overallScale:0,
    mallet:null,
    title:null,
    menu:null,
    hud:null,
    won:null,
    lost:null
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
var fadeFrom = (id) => {
    console.log(`fadeFrom(${id})`);
    return new Promise((resolve, reject) => {
        var element = document.getElementById(id);
        element.setAttribute('fading', 'fade-out');
        setTimeout(() => {
            element.classList.add('hidden');
            element.removeAttribute('fading');
            resolve();
        }, TransitionDelay);
    });
}

var fadeTo = (id) => {
    console.log(`fadeTo(${id})`);
    return new Promise((resolve, reject) => {
        var element = document.getElementById(id);
        element.setAttribute('fading', 'fade-in');
        element.classList.remove('hidden');
        setTimeout(() => {
            element.removeAttribute('fading');
            resolve();
        }, TransitionDelay);
    });
}

var doError = (message) => {
    console.log(`doError(${message})`);
    var eframe = document.getElementById("error");
    var element  = eframe.contentDocument || eframe.contentWindow.document;
    var err = element.createElement('p');
    err.innerHTML = message;
    element.getElementById('cause').appendChild(err);
    eframe.classList.remove('hidden');
    throw "Fatal, cannot continue.";
}

/*
 * This is the javascript entrypoint from index.html body.onload()
 *
 */
var init = () => {
    console.log("init()");

    // fixes for IOS, Retina Mac, and Samsung phone devices
    //document.body.style.fontSize = (document.body.offsetWidth * .282) + '%'; 
    document.ontouchmove = (e) => { e.preventDefault(); }

    L.trueSize = Math.min(document.body.clientWidth, document.body.clientHeight);
    L.overallScale = L.trueSize / 960;
    console.log(`trueSize: ${L.trueSize} overallScale: ${L.overallScale}`);
    L.title = new Title();
//    L.menu = new Menu();
    L.mallet = new Mallet();
    L.game = new Game();
    // use Promise.all() to run in parallel - all() expects an array of promises (returned from functions)
    Promise.all([
            L.title.init(),
            L.mallet.init(),
            L.game.init(),
    ]) // chained events run serially - then() expects a function, not a promise (so wrap function invocations)
    .catch(reason => doError(reason))
    .then(() => fadeFrom('loading'))
    .then(() => L.title.fadeIn())
    .then(() => L.title.start())
    .then(() => L.title.fadeOut())
    // menu will go here instead of mallet
    .then(() => L.mallet.fadeIn())
    .then(() => L.mallet.enable())
    .then(() => L.game.fadeIn())
    .then(() => L.game.start())
    .catch(reason => doError(reason)); 
}
