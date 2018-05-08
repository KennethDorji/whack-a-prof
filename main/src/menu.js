/*
 * menu.js
 *
 * Methods Defined:
 *Start()- When user click "Start Game" button, the game will start.
*
 *Score()- Showing the highest score of this game.  
 */

"use strict";

class Menu extends Layer {

    constructor(options = {}) {
        super({
        id:'menu',
        hasCanvas:false,
        classes:['hidden', 'fullscreen']
       });
    this.menuSound = new Sound('sounds/menu_select.mp3');
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                return Promise.all([
                self.menuSound.load()
                ]);
            }).then(resolve, reason => reject(reason));
        });
    }


    start(){
        this.fadeIn();
    }

    clickStart() {
        console.log('menu.clickStart()');
        this.fadeOut().then(() => L.game.start());
    }
}

