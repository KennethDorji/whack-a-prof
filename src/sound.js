
"use strict";

class Sound {
    constructor(url) {
        if (Array.isArray(url)) {
            this.count = url.length;
        } else {
            this.count = 0;
        }
        this.src = url;
        this.volume = 1.0; 
        this.looping = false;
        this.loopListener = (e) => {
            let a = e.target;
            let buffer = 0.40;
            if (a.currentTime > a.duration - buffer) {
                a.currentTime = 0;
                a.play();
            }
        };
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

    play(loop = false) {
        let self = this;
        self.loop = loop;
        const playOne = (a) => {
            if (loop) {
                self.looping = true;
                a.addEventListener('timeupdate', self.loopListener, false);
            }
            a.volume = self.volume;
            if (a.paused) {
                a.play();
            } else { // start from beginning to "play again" if already playing
                a.currentTime = 0;
                a.play();
            }
        };
        let A = self.audio;
        if (self.count) {
            A = self.audio[Util.uniform(self.count)];
        } 
        playOne(A);
    }

    pause() {
        let self = this;
        if (self.count) {
            self.audio.forEach(audio => {
                audio.pause();
                if (self.looping) {
                    audio.removeEventListener('timeupdate',self.loopListener);
                    self.looping = false;
                }
            });
        } else {
            self.audio.pause();
            if (self.looping) {
                self.audio.removeEventListener('timeupdate', self.loopListener);
                self.looping = false;
            }
        }
    }

    fadeOut(time = 1000) {
        let self = this;
        let startVol = self.volume;
        let step = startVol / time;

        const stepDown = (vol) => {
            return new Promise((resolve, reject) => {
                if (vol < 0) {
                    self.pause();
                    resolve();
                }
                if (self.count) {
                    self.audio.forEach(audio => audio.volume = vol);
                } else {
                    self.audio.volume = vol;
                }
                stepDown(vol - step).then(resolve);
            });
        }

        return new Promise((resolve, reject) => {
            stepDown(startVol).then(resolve);
        });
    }
    
}
