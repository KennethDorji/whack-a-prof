/*
 * hole.js
 *
 */

"use strict";

class Hole {
    constructor(options) {
        this.game = options.game;
        this.coordinate = options.coordinate;
        this.size = options.size;
        this.hitColor = options.hitColor || "rgba(255,60,60,0.5)";
        this.delay = options.delay || 1000;
        this.currOccupant = null;
        this.nextOccupant = null;
    }

    init(container) {
        var self = this;
        self.container = container;
        return new Promise((resolve, reject) => {
            console.log(`Hole.init(): loc: ${self.coordinate.x}, ${self.coordinate.y}`);
            self.canvas = self.container.createElement('canvas');
            self.canvas.height = self.size.y;
            self.canvas.width  = self.size.x;
            self.ctx = self.canvas.getContext('2d');
            self.ctx.fillStyle = self.hitColor;
            self.canvas.style.transform = 'translate(' + self.coordinate.x + 'px, ' + self.coordinate.y + 'px)';
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

                var A, delta, raiseLimit, lingerLimit, lowerLimit;

                const reset = () => {
                    A = self.currOccupant;
                    self.startTime = window.performance.now();
                    self.currPos = self.lastPos = 1;
                    self.isHit = false;
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
                            resolve();
                        }
                    } else if (delta > lingerLimit) { 
                        // lower back down
                        self.currPos = -Math.round(A.height*Math.cos(Math.PI * (lingerLimit - delta) / A.duration.lower));
                    } else if (delta < A.duration.raise) { 
                        // still rising
                        self.currPos = Math.round(A.height*Math.cos(Math.PI * delta / A.duration.raise));
                    } else {
                        // lingering
                        // no change to currPos

                    }

                    // pick which sprite to use - base, smirk, or shock
                    if (self.isHit) {
                        // definitely use shocked if hit
                        self.sprite = A.sprites.hit;
                    } else if (true) {
                        // definitely use smirk if ...
                        self.sprite = A.sprites.smirk;
                    } else {
                        // pick randomly?
                    }

                    // clear existing
                    self.ctx.clearRect(0, 0, self.size.x, self.size.y);
                    // draw sprite
                    self.ctx.drawImage(self.sprite, 0, self.currPos);

                    // have we been hit?  apply a color overlay
                    if (self.isHit) {
                        self.ctx.globalCompositeOperation = "source-atop";
                        self.ctx.fillRect(0, 0, self.size.x, self.size.y);
                        self.ctx.globalCompositeOperation = "source-over";
                    }
                    window.requestAnimationFrame(holeLoop);
                }

                holeLoop();
            }
        });
    }

    hit() {
        if (self.currOccupant) {
            self.isHit = true;
            var A = self.currOccupant; // occupant may change before we can calc score
            // raise score, etc
            A.hit();
        }
    }
    
    start() {
        // the parameter lambda refers to the average delay to next occupant
        let self = this;
        const holeLoop = () => {
            let delay = Util.poisson(self.delay);
            if (S.currentState === States.PLAYING) {   
                setTimeout(() => {
                    self.occupy(cast.getRandom())
                        .then(() => holeLoop());
                }, delay);
            }
        }
        holeLoop();
    } 
}    
