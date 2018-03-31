
"use strict";

class Sound {
    constructor(url) {
        if (Array.isArray(url)) {
            this.count = url.length;
        } else {
            this.count = 0;
        }
        this.src = url; 
    }
    
    load() {
        var self = this;
        var loadOne = (u) => {
            return new Promise((resolve, reject) => {
                var a = new Audio(u);
                a.onloadeddata = () => {
                    console.log(u);
                    resolve(a);
                }
                a.onerror = () => { 
                    reject('Failed to load sound ' + u); 
                }
                a.load();
                document.body.appendChild(a);
            });
        };

        return new Promise((resolve, reject) => {
            if (self.count) {
                self.audio = [];
                Promise.all(self.src.map(s => loadOne(s)))
                .catch(reason => reject(reason))
                .then((alist) => {
                    self.audio = alist;
                    resolve();
                });
            } else {
                loadOne(self.src).then(a => {
                    self.audio = a;
                    resolve();
                });
            }
        });
    }

    play() {
        var self = this;
        var playOne = (a) => {
            if (a.readyState) {
                a.play();
            } else {
                a.currentTime = 0;
            }
        };
        if (self.count) {
            var index = Util.uniform(self.count);
            playOne(self.audio[index]);
        } else {
            playOne(self.audio);
        }
    }
}
