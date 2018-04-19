/*
 * game.js
 *
 * the main game class
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
  constructor() {
      super({
          id:'game',
          hasCanvas:true,
          squareCanvas:true,
          classes:['hidden', 'fullscreen']
      });
    let self = this;
    self.hitRadius = HITRADIUS * L.overallScale;
    self.cast = new Cast();
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
                Util.loadImage('sprites/portal.svg').then(image => self.portal = image)
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
              hole.coordinate.x - this.offset.x - 40*L.overallScale, 
              hole.coordinate.y + hole.size - this.offset.y - 100*L.overallScale
          );
          self.ctx.scale(L.overallScale, L.overallScale); 
          self.ctx.drawImage(self.portal, 0, 0);
          self.ctx.restore();

          // temporarily draw "hit circles"
          self.ctx.beginPath();
          self.ctx.arc(hole.hitCenter.x, hole.hitCenter.y, self.hitRadius, 0, 2*Math.PI);
          self.ctx.closePath();
          self.ctx.stroke();
      });

  }
  

  checkHit(loc) {
      let self = this;
      let hitSomeone = false;
      self.holes.some(hole => {
          if (hole.hitCenter.distanceTo(loc) < self.hitRadius) {
              // we hit this hole
              let A = hole.hit();
              if (A) {
                  console.log(A);
                  // someone was hit - shock everyone
                  self.shockEveryone();

                  // vibrate if on a phone
                  if (typeof window.navigator.vibrate === 'function') {
                      window.navigator.vibrate(100);
                  }

                  // play hit sound
                  L.mallet.hitSound.play();
                  if (A.blood) {
                      L.mallet.bloodSound.play();
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
      S.currentState = States.PLAYING;
      let self = this;
      self.drawHoles();
      self.holes.forEach(hole => {
          hole.start(self.cast);
      });
  }

  pause() { 
      console.log("Game.pause()");
      if (S.currentState === States.PLAYING) {
          S.currentState = States.PAUSED;
      } else if (S.currentState === States.PAUSED) {
          S.currentState = States.PLAYING;
      }
  }
}
