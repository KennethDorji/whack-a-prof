var allSounds = [];

soundsInit = () => {
    console.log("soundsInit()");
}

loadSound = (url) => {
    gameState.resourcesTotal++;
    var audio = new Audio(url);
    allSounds.push(audio);
    audio.onloadeddata = () => { gameState.resourcesLoaded++; };
    audio.load();
    return audio;
}

