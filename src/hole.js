/*
 * hole.js
 *
 */

"use strict";

class Hole {
    constructor(options) {
        this.game = options.game;
        this.coordinate = options.coordinate || new Coord(0, 0);
        this.size = options.size || new Coord(266, 266);
        this.hitColor = options.hitColor || "rgba(255,60,60,0.5)";
        this.delay = options.delay || 10000;
        this.currOccupant = null;
        this.nextOccupant = null;
    }

    init(container) {
        var self = this;
        self.container = container;
        return new Promise((resolve, reject) => {
            self.coordinate.scaleBy(self.game.width);
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
        console.log('Hole.occupy()');
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
                    delta = 0;
                    A = self.currOccupant;
                    self.startTime = window.performance.now();
                    self.currPos = self.lastPos = self.size.y;
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
                    
                    // pick which sprite to use - base, smirk, or shock
                    if (self.isHit) {
                        // definitely use shocked if hit
                        self.sprite = A.sprites.hit;
                    } else if (true) {
                        // definitely use smirk if ...
                        self.sprite = A.sprites.base;
                    } else {
                        // pick randomly?
                    }
                    let height = self.sprite.height;
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
                            self.ctx.clearRect(0, 0, self.size.x, self.size.y);
                            return resolve();
                        }
                    } else if (delta > lingerLimit) { 
                        // lower back down
                        self.currPos = self.size.y - Math.floor(self.size.y*Math.cos(Math.PI * (lingerLimit - delta) / (A.duration.lower*2)));
                    } else if (delta < A.duration.raise) { 
                        // still rising
                        self.currPos = self.size.y - Math.floor(self.size.y*Math.sin(Math.PI * delta / (2*A.duration.raise)));
                    } else {
                        // lingering
                        // no change to currPos

                    }
                

                    // clear existing
                    self.ctx.clearRect(0, 0, self.size.x, self.size.y);
                    // draw sprite
                    self.ctx.drawImage(self.sprite, 0, self.currPos);
                    //self.ctx.drawImage(self.sprite, 0, 0);
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
    
    start(cast) {
        console.log("Hole.start()");
        // the parameter lambda refers to the average delay to next occupant
        let self = this;
        const hLoop = () => {
            let delay = Util.uniform(self.delay);
            console.log(`delay: ${delay}`);
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
