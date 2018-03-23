/*
 * init.js
 *
 * global variables
 * javascript entrypoint
 * basic functions required during initialization
 *
 */

const States = Object.freeze({"LOADING":0, "TITLE":1, "MENU":2, "PLAYING":3, 
                            "GAMEOVER":4, "WINNER":5, "HELP":6, "QUIT":7});

const TransitionDelay = 250;
const WatchInterval   = 30;

var gameState = {
    resourcesTotal:0,
    resourcesLoaded:0,
    currentState:States.LOADING,
    highScore:0,
    currentScore:0,
    malletPosition:-1.0
};

/*
 * Set a watcher for a specific property of an object
 *
 * to be called like so:
 * var intervalH = setInterval(watchProperty(myobj, "prop", myhandler), timeout);
 *
 * then to unwatch:
 * clearInterval(intervalH);
 */
watchProperty = (obj, prop, handler) => {
    var currval = obj[prop];
    return () => {
        if (obj[prop] != currval) {
            var temp = currval;
            currval = obj[prop];
            handler(temp, currval);
        }
    };
}

/*
 * loads a script dynamically then optionally executes callback
 * NOTE: the callback should depend only on methods defined here (init.js) or in the script loaded,
 *       don't rely on things defined in other dynamically loaded scripts
 */
loadScript = (src, callback) => {
    var script = document.createElement('script');
    gameState.resourcesTotal++;
    script.onload = () => {
        gameState.resourcesLoaded++;
        if (callback) {
            callback();
        }
    }
    script.src = src;
    document.head.appendChild(script);
}


/*
 * executes callback after all dynamic resources are loaded
 */
waitForLoading = (callback) => {
    var intervalH = setInterval(watchProperty(gameState, "resourcesLoaded", (oldval, newval) => {
        console.log(newval + "/" + gameState.resourcesTotal);

        // are we done loading? then go to title
        if (newval == gameState.resourcesTotal) {
            clearInterval(intervalH);
            console.log("done loading");
            callback();
        }
    }), WatchInterval);
}


/*
 * Transition functions control the CSS visibility of iframes, 
 * and then optionally runs a callback after the fade is complete.
 *
 * this works using the rules in main.css:
 * an element having fading="fade-out" will have its opacity reduced to 0%
 * an element having fading="fade-in" will have its opacity increased to 100%
 * an element having class="hidden" will not be displayed.
 */
transitionFrom = (id, callback) => {
    var element = document.getElementById(id);
    element.setAttribute('fading', 'fade-out');
    setTimeout(() => {
        element.classList.add('hidden');
        element.removeAttribute('fading');
        if (callback) {
            callback();
        }
    }, TransitionDelay);
}

transitionTo = (id, callback) => {
    var element = document.getElementById(id);
    element.setAttribute('fading', 'fade-in');
    element.classList.remove('hidden');
    setTimeout(() => {
        element.removeAttribute('fading');
        if (callback) {
            callback();
        }
    }, TransitionDelay);
}

/*
 * create a new (initially hidden) fullscreen iframe with a specified id
 * there must exist a file in the root folder called id.html (i.e. menu.html if id='menu')
 *
 * then optionally runs a callback after its loaded.
 */
createIFrame = (id, callback) => {
    var element = document.createElement('iframe');
    gameState.resourcesTotal++;
    element.src = id + '.html';
    element.id  = id;
    //element.setAttribute('allowTransparency', 'true');
    element.classList.add('hidden');
    element.classList.add('fullscreen');
    element.onload = () => {
        gameState.resourcesLoaded++;
        if (callback) {
            callback(element);
        }
    }
    document.body.appendChild(element);
}

/*
 * This is the javascript entrypoint from index.html body.onload()
 *
 */
init = () => {
    console.log("init()");

    window.addEventListener("mousedown", (event) => {
        console.log(event);
        //console.log("click: (" + event.clientX + ", " + event.clientY + ")");
    }, false);

    loadScript("src/title.js",   () => { titleInit();   });
    loadScript("src/sprites.js", () => { spritesInit(); });
    loadScript("src/mallet.js",  () => { malletInit();  });
    loadScript("src/music.js",   () => { musicInit();   });
    loadScript("src/sounds.js",  () => { soundsInit();  });
    loadScript("src/menu.js",    () => { menuInit();    });
    loadScript("src/engine.js",  () => { engineInit();  });
    loadScript('src/score.js',   () => { scoreInit();   });

    waitForLoading(() => {
        transitionFrom('loading', () => {
        transitionTo('title', () => { 
        doTitle(); 
    });});});
}
