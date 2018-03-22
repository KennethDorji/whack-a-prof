titleInit = () => {
    console.log("titleInit()");

    // load title iframe
    createIFrame('title');
}

waitForTitle = (callback) => {
    setTimeout(() => { callback(); }, 3000);
}

doTitle = () => {
    gameState.currentState = States.TITLE;

    waitForTitle(() => {
        transitionFrom('title', () => {
        transitionTo('menu', () => { 
        doMenu(); 
    });});});
}

