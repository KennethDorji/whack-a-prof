/*
 * menu.js
 *
 * Methods Defined:
 * clickStart()- When user click "Play Game" button, the game will start.
 * clickDifficulty() - Set the difficulty of game.
 * clickSound()- Mute or unmuted sound of game.
 * clickScore()- Showing the highest score of this game.  
 * clickInstruction() - Showing the instruction of game.
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
                self.muteButton = self.innerDoc.getElementById('menuSound');
                self.highScores = self.innerDoc.getElementById('highScores');
                self.menuOuter = self.innerDoc.getElementById('menuOuter');
                self.menuOuter.style = `transform:scale(${1/window.devicePixelRatio})`;
                return Promise.all([
                self.menuSound.load()
                ]);
            }).then(resolve, reason => reject(reason));
        });
    }


    start(){
        let self = this;
        return new Promise((resolve, reject) => {
            self.fadeIn()
                .then(resolve)
                .catch(reason => reject(reason));
        });
    }

    //When user click "Play Game" button, the game will start.
    clickStart() {
        console.log('menu.clickStart()');
        this.menuSound.play();
        this.fadeOut().then(() => L.game.start());
    }
    
    //Set the difficulty of game.
    clickDifficulty(){
        console.log('menu.clickDifficulty');
        this.menuSound.play();
    }

    //Mute or unmuted sound of game.
    clickSound(){
        console.log('menu.clickSound()');

        Sound.toggleMute();
        if (soundMuted) {
            this.muteButton.innerHTML = 'Enable Sound';
        } else {
            this.muteButton.innerHTML = 'Mute Sound';
        }
        this.menuSound.play(); 
    }

    //Showing the highest score of this game.
    clickScore(){
        console.log('menu.clickScore()');
        this.menuSound.play();
        L.highscore.start();
    }

    //Showing the instruction of game.
    clickHelp(){
        console.log('menu.clickHelp()');
        this.menuSound.play();
        L.help.start();
    }

    clickQuit() {
        window.history.back();
    }
}

