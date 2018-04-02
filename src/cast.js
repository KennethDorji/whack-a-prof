/*
 * cast.js
 *
 * container for all the actors
 *
 */

"use strict";

class Cast {
    constructor(actorStats = []) {
        this.actors = [];
        this.totalLikelihood = 0;
        actorStats.forEach(A => {
            console.log(A);
            this.totalLikelihood += A.likelihood;
            this.actors.push(new Actor(A));
        });

    }

    init(container) {
        let self = this;
        console.log(container);
        return Promise.all(self.actors.map(A => A.init(container)));
    }

    getRandom() {


    }

}

