"use strict";

class Help extends Layer {

    constructor(options = {}) {
        super({
        id:'help',
        hasCanvas:false,
        classes:['hidden', 'fullscreen']
       });
    }

    init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                self.panel = self.innerDoc.getElementById('help1');
                self.panel.style = `margin:auto;transform:scale(${1/window.devicePixelRatio})`;
                self.contentDiv = self.innerDoc.getElementById('helpContent');
                self.nextButton = self.innerDoc.getElementById('nextButton');
                self.prevButton = self.innerDoc.getElementById('prevButton');
                self.doneButton = self.innerDoc.getElementById('doneButton');
                resolve();
            }, reason => reject(reason));
        });
    }


    start(){
        let self = this;
        return new Promise((resolve, reject) => {
            self.displayPage1();
            self.fadeIn()
                .then(() => resolve())
                .catch(reason => reject(reason));
        });
    }

    displayPage1() {
        this.currentPage = 1;
        this.prevButton.disabled = true;
        this.nextButton.disabled = false;
        this.contentDiv.innerHTML = `<h2>Instructions</h2> 
        <p>Welcome to Whack-a-Prof! The goal of the game is to whack as many people as you can. Don't let trustees get away!</p>
        <h2>How to play</h2>
        <p>With a mouse, simply point your cursor to whomever you want to whack, and left-click or press spacebar.</p>
        <p>With a touchscreen, simply touch whomever you want to whack.</p>
        `;
    }

    displayPage2() {
        this.currentPage = 2;
        this.prevButton.disabled = false;
        this.nextButton.disabled = false;
        this.contentDiv.innerHTML = `<h2>Instructions</h2>
        <div style='text-align:center'>
            <img src='sprites/professor/1/base.svg'></img>
            <img src='sprites/professor/2/base.svg'></img>
            <img src='sprites/professor/3/base.svg'></img>
            <img src='sprites/professor/4/base.svg'></img>
        </div>
        <p>Professors are worth 5 points.</p>    
            `;
    }

    displayPage3() {
        this.currentPage = 3;
        this.prevButton.disabled = false;
        this.nextButton.disabled = false;
        this.contentDiv.innerHTML = `<h2>Instructions</h2>
        <div style='text-align:center'>
            <img src='sprites/administrator/1/base.svg'></img>
            <img src='sprites/administrator/2/base.svg'></img>
            <img src='sprites/administrator/3/base.svg'></img>
            <img src='sprites/administrator/4/base.svg'></img>
        </div>
        <p>Administrators are worth 10 points.</p>    
            `;
    }
    
    displayPage4() {
        this.currentPage = 4;
        this.prevButton.disabled = false;
        this.nextButton.disabled = true;
        this.contentDiv.innerHTML = `<h2>Instructions</h2>
        <div style='text-align:center'>
            <img src='sprites/trustee/1/base.svg'></img>
            <img src='sprites/trustee/2/base.svg'></img>
            <img src='sprites/trustee/3/base.svg'></img>
            <img src='sprites/trustee/4/base.svg'></img>
        </div>
        <p>Trustees are worth 20 points, and explode when you hit them!</p>
        <p>If you let a trustee escape, you loose 10 points!</p>    
            `;
    }

    clickPrev() {
        switch (this.currentPage) {
            case 2: this.displayPage1(); break;
            case 3: this.displayPage2(); break;
            case 4: this.displayPage3(); break;
            default: this.fadeOut();
        }
    }

    clickNext() {
       switch (this.currentPage) {
           case 1: this.displayPage2(); break;
           case 2: this.displayPage3(); break;
           case 3: this.displayPage4(); break;
           default: this.fadeOut();
       } 
    }

    clickDone() {
        this.fadeOut();
    }
}
