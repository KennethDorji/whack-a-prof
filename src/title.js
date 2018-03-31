"use strict";

class Title extends Layer {
    constructor() {
        super({
            id:'title',
            hasCanvas:true,
            squareCanvas:false,
            classes: ['hidden', 'fullscreen']
        });

    }

    init() {
        var self = this;
        return new Promise((resolve, reject) => {
            super.init()
                 .then(() => {
                     console.log("Title.init()");
                     resolve();
                 });
        });
    }

    start() {
        var self = this;
        return new Promise((resolve, reject) => {
            console.log("Title.start()");
            S.currentState = States.TITLE;
            
            self.ctx.font = "50pt Homemade Apple";
            self.ctx.lineWidth = 1;
            self.ctx.strokeStyle = "#EEEEDD";
            var txt = " Title Screen Animation",
                dashLen = 500,
                dashOffset = dashLen,
                dashSpeed = 40, 
                x = 100, 
                i = 0;
            var loop = () => {
                self.ctx.setLineDash(
                        [dashLen - dashOffset, dashOffset - dashSpeed]);
                dashOffset -= dashSpeed;
                self.ctx.strokeText(txt[i], x, 200);
                if (dashOffset > 0) {
                    window.requestAnimationFrame(loop);
                } else {
                    dashOffset = dashLen;
                    x += self.ctx.measureText(txt[i++]).width;
                    self.ctx.rotate(-0.0025 + Math.random() * 0.005);
                    if (i < txt.length) {
                        window.requestAnimationFrame(loop);
                    } else {
                        resolve();
                    }
                }
            };
            loop();
        });
    }
}
