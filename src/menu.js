function menuInit() {
    console.log("menuInit()");
    
    // load menu iframe
    createIFrame('menu');
}

function waitForMenu(callback) {
    
}

function doMenu() {
    gameState.currentState = States.MENU;
    var intervalM = setInterval(watch(gameState, "currentState", (oldval, newval) => {
        if (oldval != newval) {
            var nextState = 'menu';
            var nextAction = doMenu;
            clearInterval(intervalM);
            switch(newval) {
                case States.PLAYING:
                    nextState = 'playing';
                    nextAction = doPlaying;
                    break;
                case States.HELP:
                    nextState = 'help';
                    nextAction = doHelp;
                    break;
                case States.QUIT:
                    nextState = 'quit';
                    nextAction = doQuit;
                    break;
            }

            transitionFrom('menu', () => {
                transitionTo(nextState, () => {
                    nextAction();
            });});

        }
    }));

}
