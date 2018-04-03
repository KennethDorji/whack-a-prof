/*
 * cast.js
 *
 * container for all the actors
 *
 */

"use strict";

class Cast {
    constructor(actorStats = []) {
        let self = this;
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

