/*
 * background.js
 * 
 */

"use strict";

class Background extends Layer {
    constructor(options = {}) {
        super({
            id:'background',
            hasCanvas:true,
            squareCanvas:true,
            classes:['hidden', 'fullscreen']
        });
        this.maxGrass = options.maxGrass || 10;
    }

  init() {
    let self = this;
    return new Promise((resolve, reject) => {
        super.init().then(() => {
            let container = self.innerDoc;
            return Promise.all([
                Util.loadImage('sprites/background.svg').then(image => self.background = image),
                Util.loadImage('sprites/grass.svg').then(image => self.grass = image),
            ]);
        }).then(resolve, reason => reject(reason));
    });
  }

  drawBackground() {
      let self = this;
      let ratio = (self.background.width-60) / (self.background.height);
      let radius = self.canvas.width / (2*ratio);

      // draw the sky
      let skyGrad = self.ctx.createRadialGradient(
              self.canvas.width/2, radius, 0, 
              self.canvas.width/2, radius, radius*2);
      skyGrad.addColorStop(0, "#99ccff");
      skyGrad.addColorStop(0.5, "#5599ee");
      skyGrad.addColorStop(1, "#3377bb");
      self.ctx.fillStyle = skyGrad;
      self.ctx.fillRect(0, 0, self.canvas.width, self.canvas.width / ratio);

      // draw the library
      self.ctx.drawImage(self.background, 
              150, 40/ratio,    // sX, sY
              self.background.width-300, self.background.height-175/ratio,    // sW, sH
              0, 0,    // dX, dY
              self.canvas.width, self.canvas.width / ratio     // dW, dH
              );

      // draw blades of grass

      let ystart = -self.grass.height/4 + self.canvas.width / ratio;
      let ydelta = (self.canvas.height - ystart) / self.maxGrass;
      let ypos;
      let xpos;
      const setShadow = (ctx) => {
          ctx.fillStyle = "#8cc53e";
          ctx.shadowColor = "#3c851e";
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = -10;
      }
          setShadow(self.ctx);
      for (ypos = ystart; ypos < self.canvas.height; ypos += ydelta) {
          let xofs = -Util.uniform(self.grass.width);
          for (xpos = 0; xpos + xofs < self.canvas.width; xpos += self.grass.width) {
              self.ctx.drawImage(self.grass, xpos + xofs, ypos);
          }
      }
  }  

  start() {
      let self = this;
      return new Promise((resolve, reject) => {
          self.drawBackground();
          self.fadeIn()
          .then(resolve)
          .catch(reason => reject(reason));
      });
  }

}
