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
    hit:     null
};

const MalletSprites       = 10;
const MalletSpeed         = 400; // time in ms for swing
const DistanceCoefficient = 200;
const HitTime             = 1000;
const BiasX = -30;
const BiasY = -175;

function malletInit() {
    console.log("malletInit()");
    
    // load mallet iframe
    createIFrame('mallet', (element) => {
        element.setAttribute("style", "z-index:999");
        var innerDoc = element.contentDocument || element.contentWindow.document;

        var c = innerDoc.createElement('canvas');  // the full-screen canvas
        
        malletState.ctx = c.getContext("2d");

        c.width = document.body.clientWidth;
        c.height = document.body.clientHeight;
        
        malletState.home.x = c.width;
        malletState.home.y = 0;

        malletState.image = new Image();
        gameState.resourcesTotal++;
        malletState.image.src = 'sprites/mallet.svg';
        malletState.image.onload = () => {
            console.log(malletState.image.width + " x " + malletState.image.height);
            gameState.resourcesLoaded++;

            // generate the set of sprites for mallet animation
            for (i = 0; i < MalletSprites; i++) {
                let m = innerDoc.createElement('canvas');
                m.width = malletState.image.height*1;
                m.height = malletState.image.height*1;
                
                let ctx = m.getContext("2d");
                let scaleFactor = 0.75 - 4*Math.pow(1/(MalletSprites - i + 2), 2);
                let rotateFactor = -Math.PI * (i + 3) / (2*MalletSprites);
                ctx.save();
                ctx.translate(15-Math.sqrt(i)*2, 25+Math.sqrt(i+1)*75);
                ctx.scale(scaleFactor, scaleFactor);
                ctx.rotate(rotateFactor);
                ctx.drawImage(malletState.image, 0, 0);
                ctx.restore();
                /*
                var img = new Image();
                img.src = ctx.canvas.toDataURL();
                malletState.sprites.push(img);
                */
                
                malletState.sprites.push(m);
                
            } 
        };
        innerDoc.body.appendChild(c);
    });
}


doMallet = (e) => {
    console.log("click: " + e.clientX + ", " + e.clientY);
    // trigger the mallet
    // if the mallet is already swinging, then we set the 'next' target to (x,y) and wait for current
    // swing to complete before doing next one
    // if the mallet is resting, we activate a new loop to swing it to (x,y)
    
    if (malletState.time) { // mallet active - don't start new loop, just change the next target
        malletState.next.x = e.clientX;
        malletState.next.y = e.clientY; 
    } else { // mallet resting - start a new loop
        malletState.time = Date.now();  // reset the swing start time
        malletState.position = -1.00;   // reset the position just in case
        malletState.last = -1.00;   // reset the position just in case
        malletState.target.x = e.clientX;
        malletState.target.y = e.clientY;

        malletLoop = () => {
            let delta = Date.now() - malletState.time; // ms since swing started
            let index = 0;

            let x = malletState.home.x;
            let y = malletState.home.y;
            let limit = MalletSpeed - (DistanceCoefficient * malletState.target.x / malletState.ctx.canvas.width);
            if (delta > 1.33 * limit) { // done with swing
                malletState.position = -1.0;
                malletState.last = -1.0;
                if (malletState.next.x != 0 && malletState.next.y != 0) { // there is another swing queued
                    malletState.target.x = malletState.next.x;
                    malletState.target.y = malletState.next.y;
                    malletState.next.x = 0;
                    malletState.next.y = 0;

                    malletState.time = Date.now();
                } else { // no more swings queued
                    malletState.time = null;
                    malletState.hit  = null;
                    malletState.target.x = 0;
                    malletState.target.y = 0;
                }
            } else { // continuing a swing
                malletState.last = malletState.position;
                malletState.position = (delta / limit) - 1;
                let progress = Math.abs(Math.sin(malletState.position * Math.PI/2));
                index = Math.min(MalletSprites - Math.floor(progress * MalletSprites), MalletSprites - 1);
                x = malletState.target.x + progress * (malletState.home.x - malletState.target.x + BiasX) + BiasX;
                y = malletState.target.y + progress * (malletState.home.y - malletState.target.y + BiasY) + BiasY;
            }
            
            if (malletState.last * malletState.position < 0) {
                console.log("hit: " + malletState.target.x + ", " + malletState.target.y);
                malletState.hit = Date.now();
            }
            
            malletState.ctx.clearRect(0,0, malletState.ctx.canvas.width, malletState.ctx.canvas.height);
            
            if (malletState.hit) {
               if (Date.now() - malletState.hit > HitTime) {
                  malletState.hit = null;
               } else {
                  malletState.ctx.beginPath();
                  malletState.ctx.arc(malletState.target.x, malletState.target.y, 32, 0, Math.PI*2, true);
                  malletState.ctx.strokeStyle = 'red';
                  malletState.ctx.stroke();
               }
            }
            //malletState.ctx.drawImage(malletState.sprites[index], 0, 0, 400, 400, x, y, 0, 0, 400, 400);
            malletState.ctx.drawImage(malletState.sprites[index], x, y);
            if (malletState.time) {
                window.requestAnimationFrame(malletLoop);
            }
        };
        window.requestAnimationFrame(malletLoop);
    }
}

enableMallet = () => {
    console.log("enableMallet()");
    malletState.ctx.canvas.addEventListener('click', doMallet, true);
}

disableMallet = () => {
    malletState.ctx.canvas.removeEventListener('click', doMallet);
}
