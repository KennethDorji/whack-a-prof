/*
 * score.js
 *
 * the container for all game score data
 *
 */

"use strict";

class Score {
    constructor(options = {}) {
        this.currentScore = 0;
        this.stats = {
            professor:     { hit: 0, miss: 0 },
            administrator: { hit: 0, miss: 0 },
            trustee:       { hit: 0, miss: 0 }
        }
        this.malletSwings = 0;

    }

    init() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
        
    hit(A) {
        this.currentScore = A.adjustment.hit.x * this.currentScore + A.adjustment.hit.y;  
        this.stats[A.type].hit++;
        console.log(`hit ${A.type}! score: ${this.currentScore}`);

    }

    miss(A) {
        this.currentScore = A.adjustment.miss.x * this.currentScore + A.adjustment.miss.y;  
        this.stats[A.type].miss++;
        console.log(`${A.type} escaped! score: ${this.currentScore}`);

    }

    swing() {
        this.malletSwings++;
        console.log(`you swung ${this.malletSwings} times`);
    }
}
