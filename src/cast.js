/*
 * cast.js
 *
 * container for all the actors
 *
 */

"use strict";

const Characters = ['professor', 'administrator', 'trustee'];

const CharacterStats = {
    professor:     { likelihood:3, hit:new Coord(1,   50), miss:new Coord(1,   0), blood:false },
  administrator: { likelihood:2, hit:new Coord(1,  100), miss:new Coord(1, -50), blood:false },
  trustee:       { likelihood:1, hit:new Coord(1.5,  0), miss:new Coord(0.5, 0), blood:true }
};

class Cast {
    constructor() {
        let self = this;
        const actorStats = Util.cartesian(Characters, [1,2,3,4]).map(ch => ({
            id:ch.join('/'),
            hit:CharacterStats[ch[0]].hit,
            miss:CharacterStats[ch[0]].miss,
            likelihood:CharacterStats[ch[0]].likelihood,
            blood:CharacterStats[ch[0]].blood
        }));
        self.actors = [];
        self.pool = [];
        self.totalLikelihood = 0;
        actorStats.forEach(A => {
            self.totalLikelihood += A.likelihood;
            self.actors.push(new Actor(A));
        });
        self.actors.forEach(A => {
            self.pool.push(...Array(A.likelihood).fill(A));
        });
    }

    init(container) {
        console.log('Cast.init()');
        console.log(container);
        let self = this;
        return Promise.all(self.actors.map(A => A.init(container)));
    }

    getRandom() {
        let self = this;
        return self.pool[Util.uniform(self.pool.length)];
    }

}

