var malletState = {
    ctx:     null,
    image:   null,
    sprites: [],
    position: -1.0,
    target:  { x:0, y:0 },
    next:    { x:0, y:0 }
};

const MalletSprites = 16;
const FramePulldown = 48;
function malletInit() {
    console.log("malletInit()");
    
    // load mallet iframe
    createIFrame('mallet', (element) => {
        var innerDoc = element.contentDocument || element.contentWindow.document;

        var c = innerDoc.createElement('canvas');  // the full-screen canvas
        
        malletState.ctx = c.getContext("2d");

        c.width = document.body.clientWidth;
        c.height = document.body.clientHeight;

        malletState.image = new Image();
        gameState.resourcesTotal++;
        malletState.image.src = 'sprites/mallet.svg';
        malletState.image.onload = () => {
            gameState.resourcesLoaded++;
            for (i = 0; i < MalletSprites; i++) {
                let m = innerDoc.createElement('canvas');
                m.width = malletState.image.height*4;
                m.height = malletState.image.height*4;
                
                let ctx = m.getContext("2d");
                let scaleFactor = 0.75 - 4*Math.pow(1/(MalletSprites - i + 2), 2);
                let rotateFactor = -Math.PI * (i + 3) / (2*MalletSprites);
                console.log(scaleFactor + " - " + rotateFactor);
                ctx.save();
                ctx.translate(15-Math.sqrt(i)*2, Math.sqrt(i+1)*75);
                ctx.scale(scaleFactor, scaleFactor);
                ctx.rotate(rotateFactor);
                ctx.drawImage(malletState.image, 0, 0);
                ctx.restore();

                malletState.sprites.push(m);
            } 
        };
        innerDoc.body.appendChild(c);
    });
}

doMallet = (x, y) => {
    var p = 0; 
    window.requestAnimationFrame(loop = () => {
        malletState.ctx.clearRect(0,0, malletState.ctx.canvas.width, malletState.ctx.canvas.height);
        let index = Math.floor(MalletSprites*Math.abs(Math.sin(p/FramePulldown)));
        malletState.ctx.drawImage(malletState.sprites[index], 110, 110);
        p++;
        //p = (p + 1) % (MalletSprites*FramePulldown);
        window.requestAnimationFrame(loop);
    });
}
