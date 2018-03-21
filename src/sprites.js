var svgNS = "http://www.w3.org/2000/svg";

function loadSvg(parentid, url, id) {
    let target = document.getElementById(parentid);
    let ajax = new XMLHttpRequest();
    gameState.resourcesTotal++;
    ajax.open("GET", url, true);
    ajax.responsetype = "document";
    ajax.onload = function(e) {
        let svgXML = ajax.responseXML.querySelector('svg');
        let children = Array.from(svgXML.childNodes);

        // we will place the loaded sprite into a new group with given id
        let newG = document.createElementNS(svgNS, "g");
        newG.id = id;
        children.forEach(function(item) {
            newG.appendChild(item);
        });
        target.appendChild(newG);
        gameState.resourcesLoaded++;
    }
    ajax.send();
}

function spritesInit() {
    console.log("spritesInit()");
    loadSvg("svgDefs", "sprites/professor.svg",  "professor-1");
    loadSvg("svgDefs", "sprites/trustee.svg",    "trustee-1");
    loadSvg("svgDefs", "sprites/farnsworth.svg", "farnsworth-1");
    loadSvg("svgDefs", "sprites/hole-bg.svg",    "hole-bg");
    loadSvg("svgDefs", "sprites/hole-fg.svg",    "hole-fg");
}
    
