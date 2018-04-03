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
    new Coord(.12, 0),
    new Coord(.4,  0),
    new Coord(.65, 0),
    new Coord(.25, .33),
    new Coord(.5,  .33),
    new Coord(.12, .66),
    new Coord(.4,  .66),
    new Coord(.65, .66),
];

class Game extends Layer {
  constructor() {
      super({
          id:'game',
          hasCanvas:false,
          classes:['hidden', 'fullscreen']
      });
    let self = this;
    let holeSize = new Coord(200, 200);
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
        size: holeSize,
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
            ]);
        }).then(resolve, reason => reject(reason));
    });
  }

  start() {
      let self = this;
      self.holes.forEach(hole => hole.start());
  }
}
