/*
*	hud.js
*	Heads-Up-Display
*	CLass that will implement Whack-A-Prof's Overlay
*	Score/Point System, Timer, Pause button(Maybe?)
*	Counter for each "Mole hit" to caclulate score
*/


class Hud extends Layer{
	constructor() {
      super({
          id:'hud',
          hasCanvas:false,
          classes:['hidden', 'fullscreen']
          });
  	}

	init() {
        let self = this;
        return new Promise((resolve, reject) => {
            super.init().then(() => {
                let scale = window.devicePixelRatio;
                self.div = self.innerDoc.getElementById('hudDiv');
                self.div.style = `transform:scale(${1/scale}); transform-origin:0 0; top:${L.offset.y}px; left:${L.offset.x}px; width:${scale*(document.body.clientWidth - 2*L.offset.x)}px`; 
                self.scoreGroup = self.innerDoc.getElementById('scoreGroup');
                self.scoreBox = self.innerDoc.getElementById('scoreBox');
                self.timeBox = self.innerDoc.getElementById('timeBox');
                resolve();
            });
        });
    }

    start() {
        let self = this;
        const hudLoop = () => {
            if (currentState === States.PLAYING) {
                if (S.updated) {
                    self.scoreBox.innerHTML = `${S.currentScore}`;
                    self.timeBox.innerHTML  = `${S.currentTime}`;
                    S.display();
                }
                
                window.requestAnimationFrame(hudLoop);
            }
        };
        return new Promise((resolve, reject) => {
            hudLoop();
            resolve();
        }); 
    }

}
