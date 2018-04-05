/*
 * hole.js
 *
 */

"use strict";

class Hole {
    constructor(options) {
        this.game = options.game;
        this.coordinate = options.coordinate || new Coord(0, 0);
        this.size = options.size || 200 * L.overallScale;
        this.hitColor = options.hitColor || "rgba(255,60,60,0.5)";
        this.delay = options.delay || 10000;
        this.currOccupant = null;
        this.nextOccupant = null;
    }

    init(container) {
        var self = this;
        self.container = container;
        return new Promise((resolve, reject) => {

            let w = self.game.width;
            let h = self.game.height;
            let dim = Math.min(self.game.width, self.game.height);
            let offset = self.game.offset;
            self.coordinate.scaleBy(dim).offsetBy(offset);

            // "hit center" is biased 2/3rd of the way down
            self.hitCenter = new Coord(
                Math.round(self.coordinate.x - offset.x + (self.size / 2)),
                Math.round(self.coordinate.y - offset.y + (2*self.size/3))
            );

            console.log(`Hole.init(): size: ${self.size} ofs: ${offset.x}, ${offset.y} loc: ${self.coordinate.x}, ${self.coordinate.y} hit: ${self.hitCenter.x}, ${self.hitCenter.y}`);
            self.canvas = self.container.createElement('canvas');
            self.canvas.classList.add('accelerated');
            self.canvas.height = self.size;
            self.canvas.width  = self.size;
            self.ctx = self.canvas.getContext('2d');
            self.ctx.fillStyle = self.hitColor;
            let cssPos = new Coord(self.coordinate.x - offset.x, self.coordinate.y - offset.y);
            let cssScale = 1 / window.devicePixelRatio;
            if (window.devicePixelRatio !== 1) {
                let scaled = Math.round(self.size / window.devicePixelRatio);
                //self.canvas.style.width = `${scaled}px`;
                //self.canvas.style.height = `${scaled}px`;
                cssPos.scaleBy(1 / window.devicePixelRatio);
            }
            cssPos.offsetBy(offset);

            self.canvas.style.transform = `translate(${cssPos.x}px, ${cssPos.y}px) scale(${cssScale})`;
            self.canvas.style['transform-origin'] = '0 0';
            self.container.body.appendChild(self.canvas);
            resolve();
        });
    }

    occupy(actor) {
        var self = this;
        return new Promise((resolve, reject) => {
            // if the hole is already occupied, queue up the next one else start a new one
            if (self.currOccupant) {
                self.nextOccupant = actor;
            } else {
                // start a new occupancy
                self.currOccupant = actor;
                self.nextOccupant = null;
                let A = null;
                let delta = 0;
                let raiseLimit = 0;
                let lingerLimit = 0;
                let lowerLimit = 0;

                const reset = () => {
                    // clear existing
                    self.ctx.clearRect(0, 0, self.size, self.size);
                    delta = 0;
                    A = self.currOccupant;
                    self.startTime = window.performance.now();
                    self.currPos = self.lastPos = self.size.y;
                    self.isHit = false;
                    self.isAmused = false;
                    raiseLimit  = A.duration.raise;
                    lingerLimit = raiseLimit + A.duration.linger;
                    lowerLimit  = lingerLimit + A.duration.lower;
                }

                reset();
                
                // this is the animation loop for the hole occupation
                // if there is a queued next occupant, it will continue to draw that one too
                // then once the animation is over it will resolve the promise
                
                const holeLoop = () => {
                    delta = window.performance.now() - self.startTime;
                    self.ctx.beginPath();
                    self.ctx.closePath();
                    let sprite = A.sprites.base; 
                    // pick which sprite to use - base, smirk, or shock
                    if (self.isHit) {
                        // definitely use shocked if hit
                        sprite = A.sprites.hit;
                        //sprite = A.sprites.base;
                    } else if (self.isAmused) {
                        // or use smirk if amused
                        sprite = A.sprites.smirk;
                    } else { 
                        // or just use base
                        //self.sprite = A.sprites.base;
                        
                    }
                    let height = 200;
                    if (delta > lowerLimit) {
                        // done with occupation 
                        //
                        if (self.isHit === false) { // beware javascript truthiness issues
                            // if there is a punishment for not hitting someone, apply it here
                            A.miss();
                        }

                        if (self.nextOccupant) {
                            // load the next queued occupant
                            self.currOccupant = self.nextOccupant;
                            self.nextOccupant = null;
                            reset();
                        } else {
                            // end occupation
                            self.currOccupant = null;
                            self.nextOccupant = null;
                            // clear existing
                            self.ctx.clearRect(0, 0, self.size, self.size);
                            return resolve();
                        }
                    } else if (delta > lingerLimit) { 
                        // lower back down
                        self.currPos = self.size - Math.floor(self.size*Math.cos(Math.PI * (lingerLimit - delta) / (A.duration.lower*2)));
                    } else if (delta < A.duration.raise) { 
                        // still rising
                        self.currPos = self.size - Math.floor(self.size*Math.sin(Math.PI * delta / (2*A.duration.raise)));
                    } else {
                        // lingering
                        // no change to currPos

                    }
                

                    // clear existing
                    self.ctx.clearRect(0, 0, self.size, self.size);
                    // draw sprite 
                    self.ctx.drawImage(sprite, 0, self.currPos);
                    // have we been hit?  apply a color overlay
                    if (self.isHit) {
                        self.ctx.globalCompositeOperation = "source-atop";
                        self.ctx.fillRect(0, 0, self.size, self.size);
                        self.ctx.globalCompositeOperation = "source-over";
                    }
                    if (S.currentState === States.PLAYING) {
                        window.requestAnimationFrame(holeLoop);
                    }
                }

                holeLoop();
            }
        });
    }

    hit() {
        let self = this;
        if (self.currOccupant) {
            self.isHit = true;
            let A = self.currOccupant; // occupant may change before we can calc score
            // raise score, etc
            S.currentScore = A.hit(S.currentScore);
            console.log(`Hit ${A.id}`);
            return true;
        }
        return false;
    }
   
    amuse() {
        let self = this;
        self.isAmused = true;
        setTimeout(() => self.isAmused = false, 1000);
    } 

    shock() {
        let self = this;
        self.isShocked = true;
        setTimeout(() => self.isShocked = false, 1000);
    }

    start(cast) {
        console.log("Hole.start()");
        let self = this;
        const hLoop = () => {
            let delay = Util.uniform(self.delay);
            if (S.currentState === States.PLAYING) {   
                setTimeout(() => {
                    let A = cast.getRandom();
                    self.occupy(A).then(() => hLoop());
                }, delay);
            }
        }
        hLoop();
    } 
}    
