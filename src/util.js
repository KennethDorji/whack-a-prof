"use strict";

class Util {
    static uniform(n) {
        return Math.floor(Math.random() * n);
    }

    static poisson(lambda) {
        return 
    }

    static loadImage(url) {
        var image = new Image();
        return new Promise((resolve, reject) => {
            image.onerror = () => {
                reject("Failed to load image " + url);
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
