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

    }
        
    hit(A) {
        this.currentScore = A.adjustment.hit.x * this.currentScore + A.adjustment.hit.y;  
        this.stats[A.type].hit++;

    }

    miss(A) {
        this.currentScore = A.adjustment.miss.x * this.currentScore + A.adjustment.miss.y;  
        this.stats[A.type].miss++;

    }

    swing() {
        this.malletSwings++;
    }
}
