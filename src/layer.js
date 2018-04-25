/*
 * layer.js
 *
 * the base class for iframe layers
 *
 * to instantiate, pass an options argument with key/values:
 *
 * REQUIRED:
 * id - the unique name of the layer.  
 *      a file named {id}.html should exist in the root directory,
 *      which will contain the layer's layout.
 *
 * OPTIONAL:     
 * classes      - CSS classes to give the iframe layer
 * style        - any CSS styling specific to this layer
 * hasCanvas    - if true, a <canvas> element will be created inside it
 * squareCanvas - if true, the canvas will be cropped to a square.
 *                if window is landscape, it will be horiz. centered 
 *                and full height.  if portrait, it will be bottom justified
 *                and full width.
 *
 * example: var foo = new Layer({id:"foo"});
 * 
 * methods defined:
 * fadeIn()  - if this layer is hidden, it will fade it to visible over a second
 * fadeOut() - if this layer is visible, it will fade it to hidden over a second 
 */

"use strict";

var mousePosition = new Coord(0, 0);

class Layer {
    constructor (options) {
        this.id         = options.id;
        this.classes    = Util.getProperty(options, 'classes', null);
        this.style      = Util.getProperty(options, 'style',   null);
        this.delay      = Util.getProperty(options, 'delay',   250);
        this.hasCanvas  = options && options.hasCanvas ? true : false;
        this.innerDoc   = null;
        this.iframe     = null;
        this.pixelRatio = window.devicePixelRatio || 1;
        this.width = document.body.clientWidth;
        this.height = document.body.clientHeight;
        if (this.hasCanvas) {
            this.squareCanvas = options && options.squareCanvas ? true : false;
            this.size = new Coord(this.width, this.height);
            this.offset = new Coord(0,0);
            if (this.squareCanvas) {
                if (this.width > this.height) {
                    this.offset.setTo(Math.floor((this.width - this.height) / 2), 0);
                    this.size.setTo(this.height, this.height);
                } else {
                    this.offset.setTo(0, Math.floor(this.height - this.width) / 2);
                    this.size.setTo(this.width, this.width);
                } 
            }
            console.log(`created ${this.size.x}x${this.size.y} canvas element at (${this.offset.x}, ${this.offset.y})`); 
        }
    }
    
    createCanvas() {
        let self = this;
        let width = document.body.clientWidth;
        let height = document.body.clientHeight; 

        return new Promise((resolve, reject) => {
            self.canvas = self.innerDoc.createElement('canvas');
            if (self.squareCanvas) {
                if (width > height) {
                    width = height;
                } else {
                    height = width;
                }
            }
            if (self.pixelRatio !== 1) {
                width = width * self.pixelRatio;
                height = height * self.pixelRatio;
            }
            let cssScale = 1 / self.pixelRatio;
            self.width = width;
            self.height = height;    
            self.canvas.width = width;
            self.canvas.height = height;
            self.canvas.style.transform = `translate(${self.offset.x}px, ${self.offset.y}px) scale(${cssScale})`;
            self.canvas.style['transform-origin'] = '0px 0px 0px';
            self.ctx = self.canvas.getContext("2d");
            self.innerDoc.body.appendChild(self.canvas);
            resolve();
        });
    }

    fadeOut() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.iframe.setAttribute('fading', 'fade-out');
            setTimeout(() => {
                self.iframe.classList.add('hidden');
                self.iframe.removeAttribute('fading');
                resolve();
            }, self.delay);
        });    
    }

    fadeIn() {
        let self = this;
        return new Promise((resolve, reject) => {
            self.iframe.setAttribute('fading', 'fade-in');
            self.iframe.classList.remove('hidden');
            setTimeout(() => {
                self.iframe.removeAttribute('fading');
                resolve();
            }, self.delay);
        });
    }

    init() {
        let self = this;   // needed when referred from nested function
        return new Promise((resolve, reject) => {
            self.iframe = document.createElement('iframe');
            self.iframe.id = self.id;
            self.iframe.src = `${self.id}.html`;
            self.classes.forEach(c => self.iframe.classList.add(c));
            if (self.style) {
                self.iframe.setAttribute("style", self.style);
            }
            self.iframe.classList.add('accelerated');
            self.iframe.onload = () => {
                self.innerDoc = self.iframe.contentDocument || self.iframe.contentWindow.document;
                if (self.hasCanvas) {
                    self.createCanvas().then(resolve);
                } else {
                    resolve();
                }
            };
            document.body.appendChild(self.iframe);
        });
    }
}
