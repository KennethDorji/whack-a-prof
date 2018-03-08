'use strict';
function draw() {
  var ctx = canvas.getContext('2d');
  
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, 300, 300); // clear canvas
   
  var time = new Date();
  for (var j = -2; j < 3; j++) { // rows
      for (var i = -1; i < 1; i++) { // columns
          ctx.save();
          
          let scaler = 1 - 0.1 * j + 0.1 * i;
          ctx.scale(scaler, scaler);
          ctx.translate(i*130 + 15*j, -30*j + 5*i);
          ctx.drawImage(holeFg, 150, 150);

          // draw professor
          ctx.save();
          let angle = ((2 * Math.PI) / 4) * time.getSeconds() + ((2 * Math.PI) / 4000) * time.getMilliseconds();
          let offset = 50 + 50 * Math.sin(angle+i+2*j);
          ctx.translate(195, 90 + offset);
          ctx.drawImage(prof, 0, 0, prof.width, prof.height - offset, 0, 0, prof.width, prof.height - offset);

          ctx.restore();
          
          ctx.drawImage(holeBg, 150, 150);
          ctx.restore();
      }
  }
  let horizon = 70;
  // draw sky
  ctx.fillStyle = 'rgba(150, 180, 255, 1)';
  ctx.fillRect(0,0,300,horizon);

  // draw background
  ctx.fillStyle = 'rgba(195, 149, 101, 1)';
  ctx.fillRect(0,horizon,300,300);

  window.requestAnimationFrame(draw);
}

