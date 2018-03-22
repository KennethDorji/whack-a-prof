/*
 * init.js
 *
 * global variables
 * javascript entrypoint
 * basic functions required during initialization
 *
 */

var States = Object.freeze({"LOADING":0, "TITLE":1, "MENU":2, "PLAYING":3, "GAMEOVER":4, "WINNER":5});

var gameState = {
    resourcesTotal:0,
    resourcesLoaded:0,
    currentState:States.LOADING,
    highScore:0,
    currentScore:0
};

// Set a watcher for a specific property of an object
// to be called like so:
// var intervalH = setInterval(watch(myobj, "prop", myhandler), timeout);
watch = (obj, prop, handler) => {
    var currval = obj[prop];
    return () => {
        if (obj[prop] != currval) {
            var temp = currval;
            currval = obj[prop];
            handler(temp, currval);
        }
    };
}

loadScript = (src, routine) => {
    var script = document.createElement('script');
    script.onload = routine;
    script.src = src;
    document.head.appendChild(script);
}

waitForLoading = (callback) => {
    var intervalH = setInterval(watch(gameState, "resourcesLoaded", (oldval, newval) => {
        console.log(newval + "/" + gameState.resourcesTotal);

        // are we done loading? then go to title
        if (newval == gameState.resourcesTotal) {
            clearInterval(intervalH);
            console.log("done loading");
            callback();
        }
    }), 50);
}

transitionFrom = (id, callback) => {
    var element = document.getElementById(id);
    element.setAttribute('fading', 'fade-out');
    setTimeout(() => {
        element.classList.add('hidden');
        element.removeAttribute('fading');
        callback();
    }, 500);
}

transitionTo = (id, callback) => {
    var element = document.getElementById(id);
    element.setAttribute('fading', 'fade-in');
    setTimeout(() => {
        element.classList.remove('hidden');
        element.removeAttribute('fading');
        setTimeout(callback, 500);
    }, 500);
}

createIFrame = (id) => {
    var element = document.createElement('iframe');
    gameState.resourcesTotal++;
    element.src = id + '.html';
    element.id  = id;
    element.classList.add('hidden');
    element.classList.add('fullscreen');
    element.onload = () => {
        gameState.resourcesLoaded++;
    }
    document.body.appendChild(element);
}

/*
 * This is the javascript entrypoint
 *
 */
init = () => {
    console.log("init()");

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
