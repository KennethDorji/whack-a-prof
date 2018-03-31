/*
 * actor.js
 *
 * parent class for characters - professor, admin, trustee
 *
 */

"use strict";

class Actor {
    constructor(options) {
        this.id = options.id;
        
        this.container = options.container; // the iframe body container

        this.duration = {
            raise:  Util.getProperty(options, 'raise', 200),
            linger: Util.getProperty(options, 'linger', 1000),
            lower:  Util.getProperty(options, 'lower', 200)
        }

        this.imageUrl = {
            base:  'sprites/' + this.id + '/base.svg',
            smirk: 'sprites/' + this.id + '/smirk.svg',
            shock: 'sprites/' + this.id + '/shock.svg'
        }
    }

    init() {

    }

    generateSprites() {
        var self = this;
        var generateOne = (image) => {
            var m = self.container.createElement('canvas');
            let ctx = m.getContext('2d');
            m.width = image.width;
            m.height = image.height;
            ctx.drawImage(image, 0, 0);
            return m;
        }
        return Promise.all([
            Util.loadImage(self.imageUrl.base).then(image => self.sprites.base = generateOne(image)),
            Util.loadImage(self.imageUrl.smirk).then(image => self.sprites.smirk = generateOne(image)),
            Util.loadImage(self.imageUrl.shock).then(image => self.sprites.shock = generateOne(image))
        ]);
                
    }

    
}
