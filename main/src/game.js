/*
 * game.js
 *
 * the main game class
 *
 * methods defined:
 *
 * game state change:
 * start()   - enable game play
 * pause()   - pause the game
 * resume()  - resume from pause
 * restart() - restart from end screen
 *
 * game maintenance:
 * drawHoles() - renders the holes, or tables, portals, whatever
 *
 * game play:
 * checkHit(loc)   - given a location, check if it hit a character.
 *                   this will call hole.hit() which performs the score adjustment
 * amuseEveryone() - if you miss a swing, make everyone (not already hit) smirk
 * shockEveryone() - if you hit someone, make everyone else shocked
 *
 *
 */

"use strict";

const HITRADIUS = 125;


// hole locations are floats between 0 and 1, which will be scaled up to canvas size
const HoleLocations = [
    new Coord(.1, .22),
    new Coord(.4,  .22),
    new Coord(.7, .22),
    new Coord(.25, .44),
    new Coord(.55,  .44),
    new Coord(.1, .66),
    new Coord(.4,  .66),
    new Coord(.7, .66),
];

class Game extends Layer {
  constructor(options = {}) {
      super({
          id:'game',
          hasCanvas:true,
          squareCanvas:true,
          classes:['hidden', 'fullscreen']
      });
    let self = this;
    self.maxTime = options.maxTime || 60;
    self.startTime = null;
    self.hitRadius = HITRADIUS * L.overallScale;
    self.cast = new Cast();
    self.music = new Sound('sounds/background_3_loop.mp3');
    self.holes = HoleLocations.map(loc => new Hole({
        game: self,
        coordinate: loc,
    }));
  }

  init() {
    let self = this;
    return new Promise((resolve, reject) => {
        super.init().then(() => {
            let container = self.innerDoc;
            return Promise.all([
                self.cast.init(container),
                ...self.holes.map(hole => hole.init(container)),
                Util.loadImage('sprites/table.svg').then(image => self.portal = image),
                self.music.load()
            ]);
        }).then(resolve, reason => reject(reason));
    });
  }

  drawHoles() {
      let self = this;
      
      self.ctx.clearRect(0, 0, self.ctx.width, self.ctx.height);
      self.holes.forEach(hole => {
          self.ctx.save();
          self.ctx.translate(
              hole.coordinate.x - this.offset.x, // - 40*L.overallScale, 
              hole.coordinate.y + hole.size - this.offset.y // - 100*L.overallScale
          );
          self.ctx.scale(L.overallScale, L.overallScale); 
          self.ctx.drawImage(self.portal, 0, 0);
          self.ctx.restore();

          // temporarily draw "hit circles"
          /*

          self.ctx.beginPath();
          self.ctx.arc(hole.hitCenter.x, hole.hitCenter.y, self.hitRadius, 0, 2*Math.PI);
          self.ctx.closePath();
          self.ctx.stroke();
          */
      });

  }

  checkHit(loc) {
      let self = this;
      let hitSomeone = false;
      self.holes.some(hole => {
          if (hole.hitCenter.distanceTo(loc) < self.hitRadius) {
              // we hit this hole - find out who we hit (A)
              // hole.hit() will adjust the score
              let A = hole.hit();
              if (A) {
                  // someone was hit - shock everyone
                  self.shockEveryone();

                  // play hit sound
                  L.mallet.hitSound.play();
                  // vibrate if on a phone
                  Util.vibrate(100);
                  
                  if (A.blood) {
                      // start blood animation
                      L.blood.splat(hole.hitCenter);
                      // vibrate more if on a phone
                      Util.vibrate(300);
                  }
                  hitSomeone = true;
              }
              // short circuit if we know we've hit a hole
              return true;    
          }
      });
      if (!hitSomeone) {
          self.amuseEveryone();
          // play miss sound
          L.mallet.missSound.play();
      }
  }

  amuseEveryone() {
      let self = this;
      self.holes.forEach(hole => {
          hole.amuse();
      });
  }

  shockEveryone() {
      let self = this;
      self.holes.forEach(hole => {
          hole.shock();
      });
  }

  start() {
      console.log('Game.start()');
      currentState = States.PLAYING;
      let self = this;
      self.startTime = window.performance.now();
      self.drawHoles();
      Promise.all([
              L.game.fadeIn(),
              L.mallet.fadeIn(),
              L.blood.fadeIn()
      ]).then(() => {
          L.mallet.enable(loc => L.game.checkHit(loc));
          self.holes.forEach(hole => {
              hole.start(self.cast);
          });
      });
      self.music.play(true); // parameter -> loop if true
  }

  pause() { 
      if (currentState === States.PLAYING) {
          console.log("Game.pause()");
          currentState = States.PAUSED;
          this.pausedTime = window.performance.now();
          this.music.pause();
      } 
  }

  resume() {
      if (currentState === States.PAUSED && this.pausedTime) { // the game had been paused
          console.log("Game.resume()");
          // calculated duration of pause
          let delta = window.performance.now() - this.pausedTime;
          
          // adjust the times of everything
          this.startTime = this.startTime + delta;
          L.mallet.adjustTime(delta);
          L.blood.adjustTime(delta);
          
          this.holes.forEach(hole => {
              hole.adjustTime(delta);
          });
          
          currentState = States.PLAYING;
          this.pausedTime = null;
          this.holes.forEach(hole => {
              hole.start(this.cast);
          });
          this.music.play(true);

      } 
   
  }

  restart() {
      if (this.startTime && currentState === States.PLAYING) { // game in progress - stop it
          this.pause();
      }
      this.start();
  }
}
