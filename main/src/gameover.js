"use strict";

class Gameover extends Layer {

    constructor(options) {
        // generate underlying layer
        super({ 
            id:'gameover', 
            hasCanvas:false, 
            classes: ['hidden', 'fullscreen']
        })
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                console.log("Gameover.init()");
                self.content = self.innerDoc.getElementById('gameoverContent');
                resolve();
            }).then(resolve, reason => reject(reason));
        });
    }

    start() {
        let highScore = false;
        console.log('Gameover.start()');
        if (S.isHighScore()) {
            highScore = true;
        }
        let D = new Date();
        S.gameOver({
            score: S.currentScore,
            date:  D.toLocaleDateString(),
            time:  D.toLocaleTimeString(),
        });
        this.content.innerHTML = `<h1>Final Score:</h1>
            <h3>${S.currentScore} points ${highScore ? '(HIGH SCORE)' : ''}</h3>
            <h3>Professors:</h3>
            <h3>${S.stats.professor.hit} hit, ${S.stats.professor.miss} missed.</p>
            <h3>Administrators:</h3>
            <h3>${S.stats.administrator.hit} hit, ${S.stats.administrator.miss} missed.</p>
            <h3>Trustees:</h3>
            <h3>${S.stats.trustee.hit} hit, ${S.stats.trustee.miss} missed.</p>
            `;

        this.fadeIn();
    }

    clickRetry() {
        this.fadeOut().then(() => L.game.restart());
    }

    clickMenu() {
        this.fadeOut().then(() => L.menu.start());
    }
}
