var counterLeft = 0;
var counterRight = 0;
var counterHistory = []
var isMobile = false
var iconIndex = 0
var isDark = false

// get is mobile
const urlParams = new URLSearchParams(window.location.search);
let isMobileParam = urlParams.get('mobile')
isMobile = isMobileParam === "1"

// if is mobile, load "styles_mobile.ccs" else load "styles_desktop.css"
var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = isMobile ? 'styles_mobile.css' : 'styles_desktop.css';
document.head.appendChild(link);

var icons = [
    ['check-circle', 'x-circle'],
    ['arrow-up-circle', 'arrow-down-circle'],
    ['caret-up', 'caret-down'],
    ['circle-fill', 'circle'],
    ['brightness-high-fill', 'cloud-rain'],
    ['balloon-fill', 'bandaid'],
    ['emoji-smile', 'emoji-dizzy'],
    ['plus-circle', 'dash-circle'],
]
var currentIcons = []

var iconIndex = urlParams.get('icon')
if (iconIndex == null) {
    iconIndex = Math.floor(Math.random() * icons.length)
    currentIcons = icons[iconIndex]
} else {
    iconIndex = parseInt(iconIndex)
    if (iconIndex < 0 || iconIndex >= icons.length) {
        iconIndex = 0
        currentIcons = icons[0]
    } else {
        currentIcons = icons[iconIndex]
    }
}

isDark = urlParams.get('dark') === "1"
// load "styles_dark.css" if isDark is true else load "styles_light.css"
link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = isDark ? 'styles_dark.css' : 'styles_light.css';
document.head.appendChild(link);

let linkContainer = document.getElementById("linkContainer")
// add link to linkContainer to let user switch between dark and light mode
function constructLink(dark, iconIndex) {
    let link = window.location.href.split("?")[0]
    if (dark) {
        link += "?dark=1"
    } else {
        link += "?dark=0"
    }
    link += "&icon=" + iconIndex
    return link
}
let switchDarkButton = document.getElementById("buttonSwitchDark")
// switchDarkButton is an "a" element, so just set href
switchDarkButton.href = constructLink(!isDark, iconIndex)
switchDarkButton.innerHTML = "<i class='bi bi-" + (isDark ? "sun" : "moon") + "'></i>"

let switchIconButton = document.getElementById("buttonSwitchIcon")
switchIconButton.href = constructLink(isDark, (iconIndex + 1) % icons.length)
switchIconButton.innerHTML = (
    "<i class='buttonSwitchIcon bi bi-" + currentIcons[0] + "'></i>/" +
    "<i class='buttonSwitchIcon bi bi-" + currentIcons[1] + "'></i>"
)

const copyToClipboard = str => {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText)
        return navigator.clipboard.writeText(str);
    return Promise.reject('The Clipboard API is not available.');
};

function resized() {
    let totalHeight = window.innerHeight;
    let containerHeight = document.getElementById("container").clientHeight;
    let height = 0
    if (!isMobile) {
        height = (totalHeight - containerHeight) / 2
    } else {
        height = (totalHeight - containerHeight) / 8
    }
    let linkContainerHeight = linkContainer.clientHeight
    height -= linkContainerHeight
    if (height < 0) height = 0
    document.getElementById("topSpace").style.height = height.toString() + "px"
}

function numberDisplayClicked(left) {
    if (left) {
        counterLeft ++;
        counterHistory.push(true)
        document.getElementById("numberDisplayLeft").classList.add("focused");
        document.getElementById("numberDisplayRight").classList.remove("focused");
    } else {
        counterRight ++;
        counterHistory.push(false)
        document.getElementById("numberDisplayLeft").classList.remove("focused");
        document.getElementById("numberDisplayRight").classList.add("focused");
    }
    document.getElementById("numberDisplayLeft").innerText = counterLeft.toString()
    document.getElementById("numberDisplayRight").innerText = counterRight.toString()
    refreshHistories()
}

function buttonUndoClicked() {
    if (counterHistory.length == 0) return;
    let p = counterHistory.pop()
    if (p) {
        counterLeft--;
    } else {
        counterRight--;
    }
    document.getElementById("numberDisplayLeft").innerText = counterLeft.toString()
    document.getElementById("numberDisplayRight").innerText = counterRight.toString()
    refreshHistories()
}

function buttonResetClicked() {
    counterLeft = 0
    counterRight = 0
    counterHistory = []
    document.getElementById("numberDisplayLeft").innerText = counterLeft.toString()
    document.getElementById("numberDisplayRight").innerText = counterRight.toString()
    refreshHistories()
}

function refreshHistories() {
    let h = ""
    counterHistory.forEach((p) => {
        h += p ? (
            '<i class="history-icon margined-bi bi bi-' + currentIcons[0] + '"></i>'
        ) : (
            '<i class="history-icon margined-bi bi bi-' + currentIcons[1] + '"></i>'
        )
    })
    document.getElementById("histories").innerHTML = h
}

function copyHistories() {
    let h = ""
    counterHistory.forEach((p) => {
        h += p ? "t" : "f"
    })
    copyToClipboard(h).then(() => {
        document.getElementById("histories").innerHTML = "Copied to clipboard."
    }).catch((err) => {
        document.getElementById("histories").innerHTML = "Failed to copy to clipboard."
    })
    setTimeout(() => {refreshHistories();}, 3000);
}

function getRandomHuedColor() {
    let v = Math.floor(Math.random() * 6)
    if (v==0) return [1, Math.random(), 0]
    if (v==1) return [Math.random(), 1, 0]
    if (v==2) return [0, 1, Math.random()]
    if (v==3) return [0, Math.random(), 1]
    if (v==4) return [Math.random(), 0, 1]
    return [1, 0, Math.random()]
}

function setColors() {
    let hued = getRandomHuedColor()
    let or = hued[0], og = hued[1], ob = hued[2]
    let lightness = 0.299 * or + 0.587 * og + 0.114 * ob;
    let factor = 1
    if (lightness > 0.65) factor -= (lightness - 0.65)
    let sc = (p) => {return p*factor*255}
    or = sc(or); og = sc(og); ob = sc(ob);
    let dark = (p) => {return Math.floor(p * 0.6);}
    let bright = (p) => {return Math.floor(255 - (255-p) * 0.4)}
    let dcolor = `rgb(${dark(or)},${dark(og)},${dark(ob)})`
    let bcolor = `rgb(${bright(or)},${bright(og)},${bright(ob)})`
    let p = document.getElementById("numberDisplayLeft")
    p.style.backgroundColor = bcolor
    p.style.color = dcolor
    p = document.getElementById("numberDisplayRight")
    p.style.backgroundColor = dcolor
    p.style.color = bcolor
    let style = document.createElement("style");
	// style.appendChild(document.createTextNode(".iconButton:hover {color: " + bcolor + ";}"));
    document.head.appendChild(style);
    style.sheet.insertRule(".buttonContainer:hover {color: " + bcolor + "; border-color: " + bcolor + "; background-color: " + dcolor + "}", 0)
}

function keydown(event) {
    if (event.key == "Z" || event.key == "z") {
        numberDisplayClicked(true)
    } 
    if (event.key == "X" || event.key == "x") {
        numberDisplayClicked(false)
    } 
    if (event.key == "Backspace") {
        buttonUndoClicked()
    }
}

resized()
setColors()

setTimeout(() => {resized();}, 100);