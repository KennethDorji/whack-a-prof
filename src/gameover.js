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
                return Promise.all([ // load in parallel
                    
                ]);   
            }).then(resolve, reason => reject(reason));
        });
    }

}
