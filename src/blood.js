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
        this.spriteSize = options.spriteSize || Math.round(300 * L.overallScale);
        this.frames = options.frames || 8;
        this.spread = options.spread || 20 * L.overallScale;
        this.scale  = options.scale  || 2; 
        this.speed  = options.speed  || 1000; // one second 
    }

    init(container) {
        let self = this;
        self.container = container;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                return Promise.all([
                    self.generateSprites(),
                    self.splatSound.load(),
                ]);
            }).then(resolve, reason => reject(reason));
        });
    }

    createSpritesCanvas() {
        this.spritesCanvas = this.container.createElement('canvas');
        this.spritesCanvas.classList.add('accelerated');
        this.spritesCanvas.height = this.spriteSize;
        this.spritesCanvas.width = this.spriteSize * this.frames;
        this.spritesCtx = this.spritesCanvas.getContext('2d');
        this.spritesCtx.save();
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
                // iterate over frames
                for (let n = 0; n < self.frames; n++) {
                    let offset = n * self.spriteSize;
                    let center = Math.round(self.spriteSize / 2);
                    let position = (n / frames);
                    self.spritesCtx.restore();
                    self.spritesCtx.translate(offset + center, center);
                    // the canvas is now centered in the frame to render
                    // we want each bit to sweep across the top two quadrants
                    let theta = Math.PI * (3/4);
                    let delta = Math.PI / (2 * images.length);
                    let i = 0;
                    images.forEach(I => {
                        self.spritesCtx.save();
                        if (i === 0) {
                            // the first image is the big splatter, we just
                            // want to keep it centered and scale it up
                            self.spritesCtx.scale(position * self.scale);
                            // draw blood - recenter first
                            self.spritesCtx.translate(-I.width / 2, -I.height / 2);
                            self.spritesCtx.drawImage(I);
                        } else {
                            // all other splatters get rotated and offset
                            // for 'explosion' effect.
                            // we want left side blood to fall left and
                            // right side blood to fall right - thus
                            // the ternary operator.
                            let angle = 2*theta > Math.PI ? 
                                        position * Math.PI / 4: 
                                        -position * Math.PI / 4;
                            self.spritesCctx.rotate(theta + angle);
                            // scale
                            self.spritesCtx.scale(position * self.scale);
                            // offset - since we scaled, its fixed
                            self.spritesCtx.translate(self.spread);
                            // rotate again - for realistic 'tumble'
                            self.spritesCtx.rotate(angle);
                            // draw blood - recenter first
                            self.spritesCtx.translate(-I.width / 2, -I.height / 2);
                            self.spritesCtx.drawImage(I, 0, 0);
                            // sweet across top two quadrants
                            theta = theta - delta;
                        }
                        i++;
                        self.spritesCtx.restore();
                    });
                }
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
        const corner = new Coord(loc.x - self.spriteSize / 2,
                                 loc.y - self.spriteSize / 2);
        return new Promise((resolve, reject) => {
            let current = 0;
            let prior   = 0;
            let now = startTime;
            const bloodLoop = () => {
                now = window.performance.now();
                current = Math.floor(
                    (now - startTime) * 
                    self.frames / self.speed);
                if (current > self.frames) { // done
                    self.ctx.clearRect(corner.x, corner.y,
                            self.spriteSize, self.spriteSize);
                    resolve();
                } else { // continue animation
                    if (current !== prior) {  // change frame
                        self.ctx.clearRect(corner.x, corner.y, 
                                self.spriteSize, self.spriteSize);
                        self.ctx.drawImage(
                            self.spriteCanvas,                // source
                            current * self.spriteSize, 0,     // sX, sY
                            self.spriteSize, self.spriteSize, // sW, sH
                            corner.x, corner.y,               // dX, dY
                            self.spriteSize, self.spriteSize  // dW, dH
                        );
                        prior = current;
                    }
                    window.requestAnimationFrame(bloodLoop);
                }
            };

            bloodLoop();
        });
    }
}
