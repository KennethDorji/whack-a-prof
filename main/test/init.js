'use strict';
var prof = new Image();
var holeBg = new Image();
var holeFg = new Image();
var canvas = document.getElementById("canvas");

function init() {
  prof.src = 'characters/farnsworth.svg';
  holeBg.src = 'characters/hole-bg.svg';
  holeFg.src = 'characters/hole-fg.svg';
  window.requestAnimationFrame(draw);
  canvas.addEventListener('click', showLocation);
}

