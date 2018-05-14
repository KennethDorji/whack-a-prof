/*
 * blood.js
 *
 * blood splatter animation class
 *
 */

"use strict";

class Blood extends Layer {
    constructor(options = {}) {
        super({
            id:"blood",
            hasCanvas:true,
            squareCanvas:true,
            classes: ['hidden', 'fullscreen']
        });
        this.splatSound = new Sound('sounds/blood_explosion.mp3');
        this.screamSound = new Sound('sounds/Wilhelm-Scream.mp3');
        this.spriteSize = options.spriteSize || Math.round(600 * L.overallScale);
        this.frames = options.frames || 12;
        this.spread = options.spread || 6 * L.overallScale;
        this.scale  = options.scale  || 2 * L.overallScale; 
        this.speed  = options.speed  || 500; // one second 
    }

    init() {
        let self = this;
        console.log('Hlood.init()');
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                return Promise.all([
                    self.generateSprites(),
                    self.splatSound.load(),
                    self.screamSound.load(),
                ]);
            }).then(resolve, reason => reject(reason));
        });
    }

    createSpritesCanvas() {
        this.spritesCanvas = this.innerDoc.createElement('canvas');
        this.spritesCanvas.classList.add('accelerated');
        this.spritesCanvas.height = this.spriteSize;
        this.spritesCanvas.width = this.spriteSize * this.frames;
        this.spritesCtx = this.spritesCanvas.getContext('2d');
    }

    generateSprites() {
        let self = this;
        self.createSpritesCanvas();
        return new Promise((resolve, reject) => {
            Promise.all([
                    Util.loadImage('sprites/blood/blood12.svg'),
                    Util.loadImage('sprites/blood/blood1.svg'),
                    Util.loadImage('sprites/blood/blood5.svg'),
                    Util.loadImage('sprites/blood/blood7.svg'),
                    Util.loadImage('sprites/blood/blood9.svg'),
                    Util.loadImage('sprites/blood/blood11.svg'),
            ]).then(images => {
                let center = Math.round(self.spriteSize / 2);
                let delta = Math.PI / (2*images.length);
                self.spritesCtx.save();
                self.spritesCtx.translate(center, center);
                // iterate over frames
                for (let n = 0; n < self.frames; n++) {
                    let position = (n+1) / self.frames;
                    let scaler = position * self.scale;
                    
                    // the canvas is now centered in the frame to render
                    // we want each bit to sweep across the top two quadrants
                    console.log(`blood frame ${n} position ${position} scale ${scaler}`);
                    let i = 0;
                    let theta = Math.PI * (3/4);
                    images.forEach(I => {
                        self.spritesCtx.save();
                        if (i === 0) {
                            // the first image is the big splatter, we just
                            // want to keep it centered and scale it up
                            //self.spritesCtx.scale(Math.sqrt(position) * self.scale, Math.sqrt(position) * self.scale);
                            //self.spritesCtx.translate(-I.width/2, -I.height/2);
                            // draw blood - recenter first

                            self.spritesCtx.drawImage(I,
                                    0, 0, 
                                    I.width, I.height,
                                    -I.width * scaler, -I.height * scaler,
                                    I.width * 2 * scaler, I.height * 2 * scaler
                                    );
                        } else {
                            // all other splatters get rotated and offset
                            // for 'explosion' effect.
                            // we want left side blood to fall left and
                            // right side blood to fall right - thus
                            // the ternary operator.
                            let angle = 2*theta > Math.PI ? 
                                        position * Math.PI / 4: 
                                        -position * Math.PI / 4;
                            self.spritesCtx.rotate(theta + angle);
                            // scale
                            let scaler = Math.sqrt(position) * self.scale;
                            self.spritesCtx.scale(scaler, scaler);
                            // offset - since we scaled, its fixed
                            self.spritesCtx.translate(self.spread, 0);
                            // rotate again - for realistic 'tumble'
                            self.spritesCtx.rotate(angle);
                            // draw blood - recenter first
                            self.spritesCtx.translate(-I.width / 2, -I.height / 2);
                            self.spritesCtx.drawImage(I, 0, 0);
                            //self.spritesCtx.drawImage(I, 
                            //        0, 0,                        // sX, sY
                            //        I.width, I.height,           // sW, sH,
                            //        -I.width * scaler / 2, -I.width * scaler/ 2,  // dX, dY,
                            //        I.width * scaler, I.height * scaler  // dW, dH
                            //        );
                            // sweep across top two quadrants
                            theta = theta - delta;
                        }
                        i++;
                        self.spritesCtx.restore();
                    });
                    self.spritesCtx.translate(self.spriteSize, 0);
                }
                self.spritesCtx.restore();
            })
            .then(resolve, reason => reject(reason));
        });
    }

    splat(loc) {
        // initialize a new splatter animation
        // resolves when animation is done - then we can stain
        // the tables with the last frame
        console.log(`Blood.splat(${loc.x}, ${loc.y})`);
        let self = this;
       
        const startTime = window.performance.now();
        const corner = new Coord(loc.x - self.spriteSize/2,
                                 loc.y - self.spriteSize/2);
        self.splatSound.play();
        self.screamSound.play();
        return new Promise((resolve, reject) => {
            let current = 0;
            let prior   = 0;
            let now = startTime;
            const drawFrame = (n) => {
                //console.log('blood frame');
                self.ctx.clearRect(corner.x, corner.y, 
                        self.spriteSize, self.spriteSize);
                // temporary black background for debugging
                //self.ctx.fillRect(corner.x, corner.y, self.spriteSize, self.spriteSize);
                self.ctx.drawImage(
                    self.spritesCanvas,                // source
                    n * self.spriteSize, 0,           // sX, sY
                    self.spriteSize, self.spriteSize, // sW, sH
                    corner.x, corner.y,               // dX, dY
                    self.spriteSize, self.spriteSize  // dW, dH
                );
            };

            const bloodLoop = () => {
                let resolved = false;
                now = window.performance.now();
                current = Math.floor(self.frames * Math.sin(
                    (now - startTime) * Math.PI / self.speed
                ));
                if (!resolved && now > startTime + self.speed / 2) {
                    resolve();
                    resolved = true;
                }
                if (now > startTime + self.speed) { // done
                    self.ctx.clearRect(corner.x, corner.y,
                            self.spriteSize, self.spriteSize);
                } else { // continue animation
                    if (current !== prior) {  // change frame
                        drawFrame(current);
                        prior = current;
                    }
                    window.requestAnimationFrame(bloodLoop);
                }
            };
            drawFrame(0);
            bloodLoop();
        });
    }
}
