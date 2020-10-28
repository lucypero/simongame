import "../scss/styles.scss"
import { DomTools as dt } from "./tools/domTools";
import { SimonGame } from "./simonGame";
import 'babel-polyfill' //this is so that i can use await and async

let svg = dt.getById("simon-board")

let counterElem = dt.getById("counter")
let buttons = dt.querySelectorAll(svg, "#btn-red,#btn-blue,#btn-yellow,#btn-green")
let bgOverlay = dt.querySelector(document.body, ".bg-overlay")

let game = new SimonGame(svg, buttons, counterElem)

let resetBtn = dt.querySelector(document, ".restart>.btn")
resetBtn.addEventListener("click", () => {
    game.reset()
})

let strictModeBtn = dt.querySelector(document, ".strict>.btn")
strictModeBtn.addEventListener("click", () => {
    game.strictMode = !game.strictMode
    if(game.strictMode){
        dt.removeClass(strictModeBtn.parentElement!, "off")
        dt.addClass(bgOverlay, "strict")
    }
    else{
        dt.addClass(strictModeBtn.parentElement!, "off")
        dt.removeClass(bgOverlay, "strict")
    }
})