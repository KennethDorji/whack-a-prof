/*
 * score.js
 *
 * the container for all game score data
 *
 * hit(A)  -> increases score for hitting an actor of type A
 * miss(A) -> decreases score for an actor of type A eluding us
 *
 * swing() -> increases swing count. 
 * note that swing() returns true if it exhausts the available swings and false otherwise.
 *
 * reset() -> resets the score for a new game
 */

"use strict";

class Score {
    constructor(options = {}) {
        this.maxTime  = options.maxTime || null;
        this.maxSwing = options.maxSwing || null;
        this.reset();
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
        console.log(`${A.type} escaped at ${window.performance.now()}! score: ${this.currentScore}`);

    }

    swing() {
        this.malletSwings++;
        if (this.swingsLeft > 0) {
            this.swingsLeft--;
            console.log(`${this.swingsLeft} swings remain.`);
        }
        if (this.swingsLeft === 0) { 
            return true;
        }
        return false;
        
    }

    reset() {
        this.currentScore = 0;
        this.stats = {
            professor:     { hit: 0, miss: 0 },
            administrator: { hit: 0, miss: 0 },
            trustee:       { hit: 0, miss: 0 }
        }
        this.malletSwings = 0;
    }
}
