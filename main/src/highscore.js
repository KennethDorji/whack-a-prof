"use strict";

class Highscore extends Layer {

    constructor(options = {}) {
        super({
        id:'highscore',
        hasCanvas:false,
        classes:['hidden', 'fullscreen']
       });
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                self.contentDiv = self.innerDoc.getElementById('hsContent');
                self.okButton = self.innerDoc.getElementById('okButton');
                resolve();
            }, reason => reject(reason));
        });
    }

    start(){
        let self = this;
        return new Promise((resolve, reject) => {
            self.display();
            self.fadeIn()
                .then(resolve)
                .catch(reason => reject(reason));
        });
    }

    display() {
        let scoreTags = S.highScores.map(score => 
            `<p>Score: ${score.score}  &nbsp; Date: ${score.date} Time: ${score.time}</p`);
        if (scoreTags.length > 0)
            this.contentDiv.innerHTML = scoreTags.join(' ');
        else 
            this.contentDiv.innerHTML = `<h3>No High Scores Yet!</h3>`;
    }

    dismiss() {
        return new Promise((resolve, reject) => {
            this.fadeOut().then(resolve, reason => reject(reason));
        });
    }

}
        
