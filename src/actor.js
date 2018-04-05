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
            linger: options.linger || 700,
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
        // to fix an Android rendering bug, instead of each sprite
        // being its own canvas, we draw each sprite onto one canvas with a 
        // predefined offset for each.
        let self = this;
        let m = self.container.createElement('canvas');
        let ctx = m.getContext('2d');
        m.width = Math.ceil(200 * 2 * L.overallScale) + 10;
        m.height = Math.ceil(200 * 2 * L.overallScale) + 10;
        m.classList.add('hidden');
        //m.style['image-rendering'] = 'pixelated';
        //self.container.body.appendChild(m);
        self.sprites = m;
        const generateOne = (image, dx, dy) => {
            ctx.save();
            ctx.scale(L.overallScale, L.overallScale);
            ctx.translate(dx, dy);
            ctx.drawImage(image, 0, 0);
            ctx.restore();
        }
        return Promise.all([
            Util.loadImage(self.imageUrl.base).then(image => generateOne(image, 0, 0)),
            Util.loadImage(self.imageUrl.hit).then(image => generateOne(image, 210, 0)),
            Util.loadImage(self.imageUrl.smirk).then(image => generateOne(image, 0, 210)),
            //Util.loadImage(self.imageUrl.shock).then(image => self.sprites.shock = generateOne(image))
        ]);
                
    }

    hit(score) {
    }

    miss(score) {

    } 
}
