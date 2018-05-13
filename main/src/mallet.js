/*
 * mallet.js
 *
 * implementation of the mallet:
 * a 'fullscreen' IFrame element containing a canvas element
 *
 * init():  initialize
 *
 * swing(target):  swing the mallet to (x,y) coordinates 
 *                 and run action(x,y) when it hits
 *
 * setAction(function):  sets the action to perform on hit                   
 *
 * enable():   captures the mouse / touchscreen / keyboard to trigger the mallet
 *
 * disable():  un-captures the above
 *
 */

"use strict";

class Mallet extends Layer {

    constructor(options) {
        // generate underlying layer
        super({ 
            id:'mallet', 
            hasCanvas:true, 
            squareCanvas:true,
            classes: ['hidden', 'fullscreen']
        });
        this.swingSound   = new Sound('sounds/swoosh.mp3');
        this.missSound    = new Sound('sounds/miss_the_hit_laugh.mp3');
        this.bloodSound   = new Sound('sounds/blood_explosion.mp3');
        this.hitSound     = new Sound([
                'sounds/jab.mp3',
                'sounds/left-hook.mp3',
                'sounds/right-cross.mp3',
                'sounds/right-hook.mp3']);
        this.sprites      = [];
        this.currPos      = -1.0;
        this.lastPos      = -1.0;
        this.currTarget   = new Coord(0, 0);
        this.nextTarget   = new Coord(0, 0);
        this.homeTarget   = new Coord(this.size.x, 0).scaleBy(this.pixelRatio);
        this.bias         = new Coord(-125, -250).scaleBy(L.overallScale);
        this.startTime    = null;
        this.swooshSound  = null;
        this.hitSounds    = [];
        this.frames       = Util.getProperty(options, 'frames',  11);
        this.speed        = Util.getProperty(options, 'speed',   400);
        this.donePos      = Util.getProperty(options, 'done',    1.5);
        this.initPos      = Util.getProperty(options, 'initial', 0.5);
        this.enabled      = false;
    }

    generateSprites() {
        let self = this;
        return new Promise((resolve, reject) => {
            let i = 0;
            Util.loadImage('sprites/mallet.svg').then(image => {
                let frames = self.frames;
                for (i = 0; i < frames; i++) {
                    // scale and rotate to desired position in swing
                    let scaleFactor = (0.75 - 4 * Math.pow(1 / (frames - i + 4), 2))*L.overallScale;
                    let rotateFactor = -Math.PI * (i + 3) / (2 * frames);
                    let m = self.innerDoc.createElement('canvas');
                    let height = Math.ceil(image.height / 2);
                    let width = Math.ceil(image.width / 2);
                    let diagonal = Math.ceil(Math.sqrt(
                          image.height * image.height +
                          image.width * image.width) / 2);
                    m.width =  Math.ceil(2 * diagonal * scaleFactor); 
                    m.height = 0.8 * m.width;
                    m.classList.add('hidden');
                    self.innerDoc.body.appendChild(m);
                    // draw sprite and append to sprite array
                    let ctx = m.getContext("2d");
                    ctx.imageSmoothingEnabled = false;
                    ctx.scale(scaleFactor, scaleFactor);
                    ctx.translate(diagonal, diagonal*0.75);
                    ctx.rotate(rotateFactor);
                    ctx.translate(-width, -height);
                    ctx.drawImage(image, 0, 0);
                    
                    self.sprites.push(m);
                }
                console.log("Mallet.generateSprites() done.");
                resolve();
            }, reason => reject(reason));
        });
    }

    loadSounds() {
        let self = this;
        return Promise.all([
                self.swingSound.load(),
                self.missSound.load(),
                self.bloodSound.load(),
                self.hitSound.load()]);
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                console.log("Mallet.init()");
				self.hudDiv = self.innerDoc.getElementById('hud');
				self.scoreBox = self.innerDoc.getElementById('scoreBox');
                self.pauseButton = self.innerDoc.getElementById('pause');
                self.quitButton = self.innerDoc.getElementById('quit');
                self.hudDiv.style = `left:${self.offset.x}px; width:${self.size.x}px; z-index:1000`;
                self.offset.scaleBy(self.pixelRatio);
                return Promise.all([ // load in parallel
                        self.generateSprites(),
                        self.loadSounds()
                ]);   
            }).then(resolve, reason => reject(reason));
        });
    }

    swing(target) {
        let self = this;
        target.scaleBy(self.pixelRatio);
        console.log(`swing: ${target.x - self.offset.x}, ${target.y - self.offset.y}`);
        return new Promise((resolve, reject) => {
            if (currentState === States.PAUSED) {
                resolve();
                return;
            }
            if (self.startTime) { // a swing is already in progress
                this.nextTarget.setTo(target.x - self.offset.x, target.y - self.offset.y);
            } else {   // no swing already
                self.swingSound.play();

                // count swing in score
                S.swing();
                
                self.startTime = window.performance.now();  // reset the swing start time
                self.currPos = self.lastPos = -1;
                this.currTarget.setTo(target.x - self.offset.x, target.y - self.offset.y);
                let index = 0;
                let pos = new Coord(self.homeTarget.x, self.homeTarget.y);
                let x = self.homeTarget.x;
                let y = self.homeTarget.y;
                let progress = 1;
                let delta = 0;

                // this is the animation loop for the mallet swing
                // if there is a queued next swing, it will continue to draw that one too
                // then once the animation is over it will resolve the promise

                const malletLoop = () => { // don't allocate new variables in loop
                    delta = window.performance.now() - self.startTime; // ms since swing started
                    if (delta > self.donePos * self.speed) { // done with swing
                        self.currPos = self.lastPos = -1.0;
                        if (self.nextTarget.x != 0 && self.nextTarget.y != 0) { // there is another swing queued
                            self.swingSound.play();

                            // count swing in score
                            S.swing();

                            self.currTarget.copy(self.nextTarget);
                            self.nextTarget.setTo(0,0);
                            self.startTime = window.performance.now();
                        } else { // no more swings queued
                            self.startTime = null;  // reset 
                            self.currTarget.setTo(0, 0);
                            resolve();
                        }
                    } else { // continuing a swing
                        self.ctx.clearRect(x, y, self.sprites[index].width, self.sprites[index].height);
                        self.lastPos = self.currPos;
                        self.currPos = (delta / self.speed) - 1 + self.initPos;
                        progress = Math.abs(Math.sin(self.currPos * Math.PI/2));
                        index = Math.min(self.frames - Math.floor(progress * self.frames), self.frames - 1);
                        x = self.currTarget.x + progress * (self.homeTarget.x - self.currTarget.x + self.bias.x) + self.bias.x;
                        y = self.currTarget.y + progress * (self.homeTarget.y - self.currTarget.y + self.bias.y) + self.bias.y;
                    }
                    if (self.lastPos * self.currPos < 0) { // we "hit" 
                        // don't play here - let game play the sound
                        self.hitTime = window.performance.now();
                        if (self.callback) {
                            self.callback(self.currTarget);
                        }
                    }
                    self.ctx.drawImage(self.sprites[index], x, y);
                    if (self.startTime) {
                        window.requestAnimationFrame(malletLoop);
                    }
                };
                malletLoop();
            }
        });
    }

    enable(callback = null) {
        let self = this;
        self.callback = callback;
		this.pauseButton.innerHTML = "PAUSE";
        if (!self.enabled) {
            const swingHandler = (e) => {
                if (e.clientY > 100) {
                    e.preventDefault();
                    self.swing(new Coord(e.clientX, e.clientY));
                }
            };
            self.canvas.addEventListener('mousedown', swingHandler, true); 

            self.canvas.addEventListener('mousemove', (e) => {
                mousePosition.setTo(e.clientX, e.clientY);
            }, true);  

            self.canvas.setAttribute('tabindex', 0);

            self.canvas.addEventListener('mouseover', (e) => {
                self.canvas.focus();
            });

            self.canvas.addEventListener('keydown', (e) => {
                console.log(`key hit: ${e.keyCode}`);
                switch (e.keyCode) {
                    case 32: // spacebar
                        self.swing(mousePosition);
                        break;
                    case 27: // escape
                        self.togglePause();
                        break;
                    default:
                        break;
                }
            }, true);
            self.canvas.focus();
            self.enabled = true;
        } 
    }

    disable() {
		// get rid of all event listeners
		let old_element = this.canvas;
		let new_element = old_element.cloneNode(true);
		old_element.parentNode.replaceChild(new_element, old_element);
		this.enabled = false;
    }

    setAction(action) {
        // stub
    }

    togglePause() {
        if (currentState === States.PLAYING) {
            this.pauseButton.innerHTML = "RESUME";
            L.game.pause();
        } else {
            this.pauseButton.innerHTML = "PAUSE";
            L.game.resume();
        }
    }

    clickQuit() {
        L.game.pause();

		Promise.all([
			L.mallet.fadeOut(),
			L.blood.fadeOut(),
			L.game.fadeOut(),
            L.hud.fadeOut()
		])
		.then(() => {
			L.menu.fadeIn();
		});
	}
    
}
