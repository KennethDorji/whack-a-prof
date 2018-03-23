function menuInit() {
    console.log("menuInit()");
    
    // load menu iframe
    createIFrame('menu');
}

function waitForMenu(callback) {
    
}

function doMenu() {
    gameState.currentState = States.MENU;
    
    transitionTo('mallet', () => { doMallet(); });

    var intervalM = setInterval(watchProperty(gameState, "currentState", (oldval, newval) => {
        if (oldval != newval) {
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
                default:
                    nextState = 'menu';
                    nextAction = doMenu;
                    break;
            }

            transitionFrom('menu', () => {
                transitionTo(nextState, () => {
                    nextAction();
            });});

        }
    }), WatchInterval);

}
