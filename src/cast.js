/*
 * cast.js
 *
 * container for all the actors
 * 
 */

"use strict";

const Characters = ['professor', 'administrator', 'trustee'];

/*
 * CharacterStats containts data about each class of character.  The properties:
 *
 *     likelihood: represents how likely the character is to be randomly chosen. take this value 
 *                 and divide it by the sum of all character likelihoods to get the probability 0..1.
 *     hit:        a two-dimensional vector representing how the score is effected when this character
 *                 is hit.  the first number (A) is how the existing score is scaled, and the second number
 *                 (B) is a constant offset: newScore := A * oldScore + B
 *     miss:       a two-dimensional vector representing how the score is effected when the chararacter
 *                 "escapes" unhit. The value (1, 0) represents no change to score.
 *     blood:      boolean, whether hitting this character causes the blood animation.
 *
 */
const CharacterStats = {
    professor:     { likelihood:3, hit:new Coord(1,   50), miss:new Coord(1,   0), blood:false },
    administrator: { likelihood:2, hit:new Coord(1,  100), miss:new Coord(1, -50), blood:false },
    trustee:       { likelihood:1, hit:new Coord(1.5,  0), miss:new Coord(0.5, 0), blood:true  }
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

