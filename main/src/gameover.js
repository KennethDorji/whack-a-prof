"use strict";

class Gameover extends Layer {

    constructor(options) {
        // generate underlying layer
        super({ 
            id:'gameover', 
            hasCanvas:true, 
            squareCanvas:true,
            classes: ['hidden', 'fullscreen']
        })
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                console.log("Gameover.init()");
                self.offset.scaleBy(self.pixelRatio);
                self.scoreBox = self.innerDoc.getElementById('finalScore');
                return Promise.all([ // load in parallel
                    
                ]);   
            }).then(resolve, reason => reject(reason));
        });
    }

    gameOver() {
        self.scoreBox.innerHTML = L.score.a;
    }

    retry(){
        L.game.restart();
    }
}
