"use strict";

class Util {
    static uniform(n) {
        return Math.floor(Math.random() * n);
    }

    static poisson(lambda) {
        const L = Math.exp(-lambda);
        let k = 0;
        let p = 1;
        do {
            k = k + 1;
            p = p * Math.random();
        } while (p > L);
        return k - 1;
    }

    static loadImage(url) {
        var image = new Image();
        return new Promise((resolve, reject) => {
            image.onerror = () => {
                reject(`Failed to load image: ${url}`);
            }
            image.onload = () => {
                resolve(image);
            }
            image.src = url;
        });
    }

    static getProperty(obj, property, defaultValue = null) {
        return obj && obj[property] ? obj[property] : defaultValue;
    }

    static cartesian(a, b, ...c) {
      const _f = (a, b) => [].concat(...a.map(a => b.map(b => [].concat(a, b))));
      const _cart = (a, b, ...c) => b ? _cart(_f(a, b), ...c) : a;
      return _cart(a, b, ...c);
    }
}

class Coord {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setTo(x, y) {
        this.x = x;
        this.y = y;
        return this;
    }
    copy(other) {
        this.x = other.x;
        this.y = other.y;
        return this;
    }
    scaleBy(multiplier) {
        this.x = Math.round(this.x * multiplier);
        this.y = Math.round(this.y * multiplier);
        return this;
    }
    offsetBy(other) {
        this.x = this.x + other.x;
        this.y = this.y + other.y;
        return this;
    }
}
