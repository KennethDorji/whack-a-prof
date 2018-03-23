var tCtx = null;
titleInit = () => {
    console.log("titleInit()");

    // load title iframe
    createIFrame('title', (element) => {
        var innerDoc = element.contentDocument || element.contentWindow.document;
        var c = innerDoc.createElement('canvas');
        tCtx = c.getContext("2d");
        c.width = document.body.clientWidth;
        c.height = document.body.clientHeight;
        innerDoc.body.appendChild(c);
    });
}

waitForTitle = (delay, callback) => {
    setTimeout(() => { callback(); }, delay);
}

doTitle = () => {
    gameState.currentState = States.TITLE;
    tCtx.globalAlpha = 0.5;
    var i = 0;
    var limit = Math.min(tCtx.canvas.width/2, tCtx.canvas.height/2);

    window.requestAnimationFrame(loop = () => {
        tCtx.clearRect(0,0, tCtx.canvas.width, tCtx.canvas.height); 
        tCtx.fillRect(i, i, tCtx.canvas.width-2*i, tCtx.canvas.height-2*i);
        i++;
        if (i < limit) {
            window.requestAnimationFrame(loop);
        }
    });

    waitForTitle(1000, () => {
        transitionFrom('title', () => {
        transitionTo('menu', () => { 
        doMenu(); 
    });});});
}

