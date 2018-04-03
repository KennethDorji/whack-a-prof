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

class Game extends Layer {
  constructor() {
      super({
          id:'game',
          hasCanvas:false,
          classes:['hidden', 'fullscreen']
      });

    const charStats = Util.cartesian(Characters, [1,2,3,4]).map(ch => ({
        id:ch.join('/'),
        hit:CharacterStats[ch[0]].hit,
        miss:CharacterStats[ch[0]].miss,
        likelihood:CharacterStats[ch[0]].likelihood
    }));
    this.cast = new Cast(charStats);
  }

  init() {
    let self = this;
    return new Promise((resolve, reject) => {
        super.init().then(() => {
            return self.cast.init(self.innerDoc);
                
        }).then(resolve, reason => reject(reason));
    });
  }
}
