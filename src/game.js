/*
 * game.js
 *
 * the main game class
 *
 */

"use strict";

const Characters = ['professor', 'administrator', 'trustee'];

const CharacterStats = {
  professor:     { likelihood:3, hit:new Coord(1,   50), miss:new Coord(1,   0) },
  administrator: { likelihood:2, hit:new Coord(1,  100), miss:new Coord(1, -50) },
  trustee:       { likelihood:1, hit:new Coord(1.5,  0), miss:new Coord(0.5, 0) }
};

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
    const charStats = Util.cartesian(Characters, [1,2,3,4]).map(ch => ({
        id:ch.join('/'),
        hit:CharacterStats[ch[0]].hit,
        miss:CharacterStats[ch[0]].miss,
        likelihood:CharacterStats[ch[0]].likelihood
    }));
    self.cast = new Cast(charStats);
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
      self.holes.forEach(hole => {
          self.ctx.save();
          self.ctx.translate(
              hole.coordinate.x - this.offset.x - 40*L.overallScale, 
              hole.coordinate.y + hole.size - this.offset.y - 90*L.overallScale
          );
          self.ctx.scale(L.overallScale, L.overallScale); 
          self.ctx.drawImage(self.portal, 0, 0);
          self.ctx.restore();
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
