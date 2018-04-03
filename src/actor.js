/*
 * actor.js
 *
 * parent class for characters - professor, admin, trustee
 *
 */

"use strict";

class Actor {
    constructor(options = {}) {
        console.log(options);
        this.id = options.id;
        
        this.sprites = {};

        this.likelihood = options.likelihood || 1;
       
        this.adjustment = {
            hit:  options.hit,
            miss: options.miss
        }

        this.duration = {
            raise:  options.raise || 500,
            linger: options.linger || 500,
            lower:  options.lower || 300
        }

        this.imageUrl = {
            base:  `sprites/${this.id}/base.svg`,
            smirk: `sprites/${this.id}/smirk.svg`,
            //shock: `sprites/${this.id}/shock.svg`,
            hit:   `sprites/${this.id}/hit.svg`
        }
    }

    init(container) {
        let self = this;
        self.container = container; // the iframe body object
        return Promise.all([
                self.generateSprites()
        ]);
    }

    generateSprites() {
        let self = this;
        const generateOne = (image) => {
            let m = self.container.createElement('canvas');
            let ctx = m.getContext('2d');
            let scale = window.devicePixelRatio;
            m.width = image.width;
            m.height = image.height;
            if (scale > 1) {
                m.width = image.width / scale;
                m.height = image.height / scale;
                ctx.scale(scale, scale);
            }
            ctx.drawImage(image, 0, 0);
            return m;
        }
        return Promise.all([
            Util.loadImage(self.imageUrl.base).then(image => self.sprites.base = generateOne(image)),
            Util.loadImage(self.imageUrl.hit).then(image => self.sprites.hit = generateOne(image)),
            Util.loadImage(self.imageUrl.smirk).then(image => self.sprites.smirk = generateOne(image)),
            //Util.loadImage(self.imageUrl.shock).then(image => self.sprites.shock = generateOne(image))
        ]);
                
    }

    hit() {
        
    }

    miss() {

    } 
}
