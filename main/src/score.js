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
        this.maxScores = options.maxScores || 10;
        this.keepHighScores = false;
        this.highScores = [];
        this.lowestHighScore = 0;
        this.reset();
    }

    static storageAvailable() {
        try {
            var storage = window['localStorage'],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }
    
    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            if (Score.storageAvailable()) {
                self.storage = window.localStorage;
                navigator.storage.persist();
                console.log('localStorage available');
                self.keepHighScores = true;
                self.HighScores = self.storage.getItem('highScores');
                self.lowestHighScore = self.storage.getItem('lowestHighScore') || 0;
            } 
            resolve();
        });
    }
        
    display() {
        this.updated = false;
    }

    hit(A) {
        this.currentScore = A.adjustment.hit.x * this.currentScore + A.adjustment.hit.y;  
        this.stats[A.type].hit++;
        this.updated = true;
        console.log(`hit ${A.type}! score: ${this.currentScore}`);

    }

    miss(A) {
        this.currentScore = A.adjustment.miss.x * this.currentScore + A.adjustment.miss.y;  
        this.stats[A.type].miss++;
        this.updated = true;
        console.log(`${A.type} escaped at ${window.performance.now()}! score: ${this.currentScore}`);

    }

    swing() {
        this.malletSwings++;
        this.updated = true;
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
        this.currentTime  = this.maxTime;
        this.updated = true;
        this.stats = {
            professor:     { hit: 0, miss: 0 },
            administrator: { hit: 0, miss: 0 },
            trustee:       { hit: 0, miss: 0 }
        }
        this.malletSwings = 0;
    }

    setTime(time) {
        if (time !== this.currentTime) {
            this.updated = true;
            this.currentTime = time;
            this.timeLeft = this.maxTime - time;
        }
    }

    isHighScore() {
        return this.highScores.length < this.maxScores ||
               this.currentScore > this.lowestHighScore;
    }

    gameOver(score) {
        const sorter = (a, b) => {
            if (a.score > b.score) 
                return -1;
            if (a.score < b.score)
                return 1;
            return 0;
        };
        if (this.keepHighScores) {
            if (this.isHighScore()) {
                console.log('recording high score');
                this.highScores.sort(sorter);
                if (this.highScores.length > this.maxStores)
                    this.highScores.pop();
                this.highScores.push(score);
                this.highScores.sort(sorter);
                console.log(this.highScores);
                this.lowestHighScore = this.highScores[this.highScores.length - 1].score;
                this.storage.setItem('highScores', this.highScores);
                this.storage.setItem('lowestHighScore', this.lowestHighScore);
                this.storage.getItem('highScores');
                this.storage.getItem('lowestHighScore');
            }
        }
    }
}
