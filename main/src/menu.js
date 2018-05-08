/*
 * menu.js
 *
 * Methods Defined:
 *Start()- When user click "Start Game" button, the game will start.
*
 *Score()- Showing the highest score of this game.  
 */

"use strict";

class menu extends Layer {

    constructor(options = {}) {
        super({
        id:'menu',
        hasCanvas:true,
        squareCanvas:true,
        classes:['hidden', 'fullscreen']
       });
    this.menuSound = new Sound('sounds/menu_select.mp3');
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                let container = self.innerDoc;
                return Promise.all([
                self.cast.init(),
                self.menuSound.load()
                ]);
            }).then(resolve, reason => reject(reason));
        });
    }


    Start(){
	this.menuSound.play();
    /* super.L.game.init() ;**/
  }

}

