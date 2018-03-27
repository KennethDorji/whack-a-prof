var malletState = {
    ctx:     null,
    image:   null,
    sprites: [],
    position: -1.0,
    last:     -1.0,
    target:  { x:0, y:0 },
    next:    { x:0, y:0 },
    home:    { x:0, y:0 },
    time:    null,
    hit:     null,
    xoffset: 0,
    yoffset: 0,
    swoosh: null,
    hits:[]
};

const MalletSprites       = 8;
const MalletSpeed         = 300;  // time in ms for swing
const DistanceCoefficient = 0;  // less time for a "close" swing
const HitTime             = 2000;
const SwingStart          = 0.5;
const SwingOver           = 1.5; // how far into swing cycle to stop - upto 2
var BiasX               = -125;   // offset from origin of mallet image to "strike location"
var BiasY               = -250;

function malletInit() {
    console.log("malletInit(): window.devicePixelRatio = ", window.devicePixelRatio);
    
    // load mallet iframe
    createIFrame('mallet', (element) => {
        element.setAttribute("style", "z-index:999");
        var innerDoc = element.contentDocument || element.contentWindow.document;
        var c = innerDoc.createElement('canvas');  // the full-screen canvas
        
        malletState.ctx = c.getContext("2d");
       
        if (document.body.clientWidth > document.body.clientHeight) {
            malletState.xoffset = Math.floor((document.body.clientWidth - document.body.clientHeight)/2);
            c.setAttribute("style", "left:" + malletState.xoffset);
            c.classList.add("bordered"); 
            c.width = document.body.clientHeight;
        } else {

            c.width = document.body.clientWidth;
        }
        c.height = document.body.clientHeight;
        
        malletState.home.x = c.width;
        malletState.home.y = 0;

        malletState.image = new Image();
        gameState.resourcesTotal++;
        malletState.image.src = 'sprites/mallet.svg';
        pixelRatio = window.devicePixelRatio;
        BiasX = BiasX / pixelRatio;
        BiasY = BiasY / pixelRatio;
        malletState.swoosh = loadSound('sounds/swoosh.mp3');
        malletState.hits.push(
                loadSound('sounds/jab.mp3'),
                loadSound('sounds/left-hook.mp3'),
                loadSound('sounds/right-cross.mp3'),
                loadSound('sounds/right-hook.mp3')
                );
        malletState.image.onload = () => {
            gameState.resourcesLoaded++;
            // generate the set of sprites for mallet animation
            for (i = 0; i < MalletSprites; i++) {
                gameState.resourcesTotal++;
                let scaleFactor = (0.75 - 4 * Math.pow(1 / (MalletSprites - i + 4), 2)) / pixelRatio;
                let rotateFactor = -Math.PI * (i + 3) / (2 * MalletSprites);
                let m = innerDoc.createElement('canvas');
                let height = Math.ceil(malletState.image.height / 2);
                let width = Math.ceil(malletState.image.width / 2);
                let diagonal = Math.ceil(Math.sqrt(malletState.image.height * malletState.image.height +
                                         malletState.image.width * malletState.image.width) / 2);
                m.width =  Math.ceil(2 * diagonal * scaleFactor); 
                m.height = 0.8 * m.width;
                let ctx = m.getContext("2d");
                ctx.imageSmoothingEnabled = false;
                ctx.scale(scaleFactor, scaleFactor);
                ctx.translate(diagonal, diagonal*0.75);
                ctx.rotate(rotateFactor);
                ctx.translate(-width, -height);
                ctx.drawImage(malletState.image, 0, 0);
                
                malletState.sprites.push(m);
                gameState.resourcesLoaded++;
                
            } 
        };
        innerDoc.body.appendChild(c);
    });
}


doMallet = (callback, clientX, clientY) => {
    // trigger the mallet
    // if the mallet is already swinging, then we set the 'next' target to (x,y) and wait for current
    // swing to complete before doing next one
    // if the mallet is resting, we activate a new loop to swing it to (x,y)
    
    if (malletState.time) { // mallet active - don't start new loop, just change the next target
        malletState.next.x = clientX - malletState.xoffset;
        malletState.next.y = clientY; 
    } else { // mallet resting - start a new loop
        malletState.swoosh.play();
        malletState.time = window.performance.now();  // reset the swing start time
        malletState.position = -1.00;   // reset the position just in case
        malletState.last = -1.00;   // reset the position just in case
        malletState.target.x = clientX - malletState.xoffset;
        malletState.target.y = clientY;
        var index = 0;
        var x = malletState.home.x;
        var y = malletState.home.y;
        var limit = MalletSpeed - (DistanceCoefficient * malletState.target.x / malletState.ctx.canvas.width);
        var progress = 1;
        var delta = 0;
        malletLoop = () => { // don't allocate new variables in loop
            delta = window.performance.now() - malletState.time; // ms since swing started

            if (delta > SwingOver * limit) { // done with swing
                malletState.position = -1.0;
                malletState.last = -1.0;
                if (malletState.next.x != 0 && malletState.next.y != 0) { // there is another swing queued
                    malletState.swoosh.play();
                    malletState.target.x = malletState.next.x;
                    malletState.target.y = malletState.next.y;
                    limit = MalletSpeed - (DistanceCoefficient * malletState.target.x / malletState.ctx.canvas.width);
                    malletState.next.x = 0;
                    malletState.next.y = 0;

                    malletState.time = window.performance.now();
                } else { // no more swings queued
                    malletState.time = null;  // reset 
                    malletState.hit  = null;
                    malletState.target.x = 0;
                    malletState.target.y = 0;
                }
            } else { // continuing a swing
                malletState.ctx.clearRect(x, y, malletState.sprites[index].width, malletState.sprites[index].height);
                malletState.last = malletState.position;
                malletState.position = (delta / limit) - 1 + SwingStart;
                progress = Math.abs(Math.sin(malletState.position * Math.PI/2));
                index = Math.min(MalletSprites - Math.floor(progress * MalletSprites), MalletSprites - 1);
                x = malletState.target.x + progress * (malletState.home.x - malletState.target.x + BiasX) + BiasX;
                y = malletState.target.y + progress * (malletState.home.y - malletState.target.y + BiasY) + BiasY;
            }
            
            if (malletState.last * malletState.position < 0) { // we "hit" 
                malletState.hit = window.performance.now();
                if (callback) {
                    callback(malletState.target.x, malletState.target.y);
                }
            }
            
            malletState.ctx.drawImage(malletState.sprites[index], x, y);
            if (malletState.time) {
                window.requestAnimationFrame(malletLoop);
            }
        };
        window.requestAnimationFrame(malletLoop);
    }
}

doHit = (x, y) => {
    console.log("hit: " + x, ", " + y);
    var soundIndex = Math.floor(Math.random() * malletState.hits.length);
    malletState.hits[soundIndex].play();
}

enableMallet = () => {
    console.log("enableMallet()");
    malletState.ctx.canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
        doMallet(doHit, e.clientX, e.clientY);
    }, true);
    
    malletState.ctx.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        doMallet(doHit, e.clientX, e.clientY);
    }, true);

    malletState.ctx.canvas.addEventListener('mousemove', (e) => {
        mousePosition.x = e.clientX;
        mousePosition.y = e.clientY;
    }, true);    
    window.addEventListener('keydown', (e) => {
        e.preventDefault();
        if (e.keyCode == 32) { // spacebar
            doMallet(doHit, mousePosition.x, mousePosition.y);
        }
    }, true);
    
}

disableMallet = () => {
    malletState.ctx.canvas.removeEventListener('mousedown', doMallet);
    malletState.ctx.canvas.removeEventListener('keydown', doMallet);
}
