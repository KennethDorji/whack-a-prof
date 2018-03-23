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

    tCtx.font = "50pt Homemade Apple";
    tCtx.lineWidth = 1;
    tCtx.lineJoin  = "round";
    tCtx.strokeStyle = "#EEEEDD";
    dashLen = 500; 
    dashOffset = dashLen,
    dashSpeed = 40, 
    x = 100, 
    i = 0;

    txt = "Title Screen Animation";
    (loop = () => {

        tCtx.setLineDash([dashLen - dashOffset, dashOffset - dashSpeed]);
        dashOffset -= dashSpeed;

        tCtx.strokeText(txt[i], x, 200);

        if (dashOffset > 0) {
            window.requestAnimationFrame(loop);
        } else {
            dashOffset = dashLen;
            x += tCtx.measureText(txt[i++]).width;
            tCtx.rotate(-0.0025 + Math.random() * 0.005);

            if (i < txt.length) window.requestAnimationFrame(loop);
        }

    })();

    waitForTitle(1000, () => {
        transitionFrom('title', () => {
        transitionTo('menu', () => { 
        doMenu(); 
    });});});
}

