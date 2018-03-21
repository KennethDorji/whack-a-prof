var States = Object.freeze({"LOADING":0, "MENU":1, "PLAYING":2, "GAMEOVER":3, "WINNER":4});

var gameState = {
    resourcesTotal:0,
    resourcesLoaded:0,
    currentState:States.LOADING
};

// Set a watcher for a specific property of an object
// to be called like so:
// var intervalH = setInterval(watch(myobj, "prop", myhandler), timeout);
function watch(obj, prop, handler) {
    var currval = obj[prop];
    function callback() {
        if (obj[prop] !=currval) {
            var temp = currval;
            currval = obj[prop];
            handler(temp, currval);
        }
    }
    return callback;
}

function loadScript(src, routine) {
    var script = document.createElement('script');
    script.onload = routine;
    script.src = src;
    document.head.appendChild(script);
}

function init() {
    console.log("init()");
    var intervalH = setInterval(watch(gameState, "resourcesLoaded", function(oldval, newval) {
        console.log(newval + "/" + gameState.resourcesTotal);

        // are we done?
        if (newval == gameState.resourcesTotal) {
            clearInterval(intervalH);
            console.log("done loading");
            var loading = document.getElementById("loading");
            // fade out loading screen
            loading.setAttribute('fading', 'fade-out');
            setTimeout(function() {
                // hide loading screen
                loading.classList.add("hidden");
                loading.removeAttribute('fading');

                // set menu gamestate and display menu
                // .....
                gameState.currentState = States.MENU;

                console.log(gameState);
            }, 500);
        }
    }), 100);

    loadScript("src/sprites.js", function() { 
        spritesInit(); 
    });

    loadScript("src/music.js", function() {
        musicInit();
    });
    
    loadScript("src/sounds.js", function() {
        soundsInit();
    });

    loadScript("src/menu.js", function() {
        menuInit();
    });

    loadScript("src/engine.js", function() {
        engineInit();
    });
}
