export {SimonGame}

import { DomTools as dt } from "./tools/domTools";
import { State, Stateful } from "./tools/state";
import { sleep } from "./tools/sleep";
import { popup } from "./popup";
import * as Velocity from "velocity-animate";
import { Howl, Howler } from "howler";


enum Button {
    Red = "red", Yellow = "yellow", Blue = "blue", Green = "green"
}

enum PlayerMove{
    Right, Wrong, Start
}

//game states
/**
 * - waiting for user input
 * - showing steps
*/
class SimonGame extends Stateful<PlayerMove> {

    playState: State<PlayerMove>
    replayState: State<PlayerMove>
    steps:Button[] // The current series of correct button presses
    buttonsElem:NodeListOf<HTMLElement>
    buttonDisplayTime:number = 450
    inBetweenDisplayTime:number = 200
    counterElem:HTMLElement
    boardElem:HTMLElement
    private _strictMode:boolean = false
    static soundUrls: {[key:string]:string} = {
        green: "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3",
        red: "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3",
        yellow: "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3",
        blue: "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3",
    }
    sounds: {[key:string]:Howl} = {}

    constructor(boardElem:HTMLElement, buttons:NodeListOf<HTMLElement>, counterElem:HTMLElement) {
        super()
        this.boardElem = boardElem
        this.steps = []
        this.buttonsElem = buttons
        this.counterElem = counterElem

        this.preloadAudio()

        this.playState = new PlayState(this)
        this.replayState = new ReplayState(this)
        this.setState(this.replayState, PlayerMove.Start)
    }

    get stepCount():number {
        return this.steps.length
    }

    addStep(button:Button){
        this.steps.push(button)
        // this.refreshCounterDisplay()
    }

    clearSteps() {
        this.steps = []
        this.refreshCounterDisplay()
    }

    refreshCounterDisplay() {
        this.counterElem.textContent = ("0" + (this.stepCount)).slice(-2)
    }

    reset() {
        this.clearSteps()
        this.setState(this.replayState, PlayerMove.Start)
    }

    get strictMode(){
        return this._strictMode
    }

    set strictMode(strictMode : boolean){
        this._strictMode = strictMode
        if(strictMode)
            dt.addSvgClass(this.boardElem, "strict")
        else
            dt.removeSvgClass(this.boardElem, "strict")
    }

    getButtonElem(btn:Button){
        return dt.getById(`btn-${btn}`);
    }

    playSound(sound:Howl){
        sound.play()
        sound.fade(1,0,sound.duration()*1000)
    }

    preloadAudio() {
        for (let url in SimonGame.soundUrls) {
            this.sounds[url] = new Howl({
                src:SimonGame.soundUrls[url]
            })
        }    
    }
}

function highlightButton(button:HTMLElement, time:number, className:string = "highlighted") {
    return new Promise((resolve, fail) =>{
        dt.addSvgClass(button, className)
        setTimeout(() =>{
            dt.removeSvgClass(button, className)
            resolve()
        }, time)
    })
}

class PlayState implements State<PlayerMove> {

    game:SimonGame
    canClick:boolean
    stepsClicked:number

    constructor(game:SimonGame){
        this.game = game
        let state = this
        this.canClick = false
        this.stepsClicked = 0
        dt.addEventListener(game.buttonsElem,"click",function (this:HTMLElement){
            if(!state.canClick) return
            state.onButtonClick.bind(state)(this, state.idToButton(this.id))
        })
    }

    idToButton(id:string):Button {
        return id.slice(4) as Button
    }

    onButtonClick(btnElem:HTMLElement, btn:Button){
        
        if(this.isRightButton(btn)){//check if player clicked the right button or not
            this.canClick = false
            this.stepsClicked++
            if(this.stepsClicked === this.game.stepCount){
                this.game.refreshCounterDisplay()
            }

            this.game.playSound(this.game.sounds[btn])            
            highlightButton(btnElem, this.game.buttonDisplayTime).then(()=>{
                
                this.canClick = true;
    
                if(this.stepsClicked === this.game.stepCount){
                    this.game.setState(this.game.replayState, PlayerMove.Right)
                }
                    
            })
        }
        else{

            Velocity.animate(this.game.boardElem, {translateX: -11}, {duration:60})
            .then(()=>Velocity.animate(this.game.boardElem, {translateX: 11}, {duration:60, loop:2}))
            .then(()=>Velocity.animate(this.game.boardElem, {translateX: 0}, {duration:60}))

            highlightButton(btnElem, this.game.buttonDisplayTime, "wrong")
            highlightButton(this.game.getButtonElem(this.game.steps[this.stepsClicked]), this.game.buttonDisplayTime)
            .then(()=> this.game.setState(this.game.replayState, PlayerMove.Wrong))
        }
        
    }

    isRightButton(btn:Button) {
        return btn === this.game.steps[this.stepsClicked]
    }

    enter(){
        // this.game.state = this.game.replayState
        this.canClick = true
        this.stepsClicked = 0
    }

    exit(){
        this.canClick = false
    }
}

class ReplayState implements State<PlayerMove> {

    game:SimonGame

    constructor(game:SimonGame){
        this.game = game
    }

    enter(lastPlayerMove:PlayerMove){

        sleep(300)
        .then(()=>{
            //If the game is just starting, or if the player got the sequence right...
            if(lastPlayerMove === PlayerMove.Start || lastPlayerMove === PlayerMove.Right){
                //If the player got 20 steps right, the game is won
                if(this.game.stepCount === 20){
                    popup("Congratulations, you won!!", 5000)
                    .then(()=> this.game.reset())
                }
                //If not, add one step and show the whole sequence
                else{
                    this.addRandomStep()
                    this.showSteps().then(()=>{
                        this.game.setState(this.game.playState, PlayerMove.Start)
                    })
                }
                
            }
            //If not, proceed accordingly
            //Player got it wrong
            // strict mode: reset game
            // non strict mode: show the steps again
            else{
                if(this.game.strictMode){
                    this.game.reset()
                }
                else{
                    this.showSteps()
                    .then(()=>this.game.setState(this.game.playState, PlayerMove.Start))
                }
            }
        })
    }

    exit(){

    }

    showSteps() {
        return new Promise((resolve, fail) =>{
            let replays = 0
            let state = this
            let timeOutFunc = async function() {
                
                while(true){
                    await sleep(state.game.inBetweenDisplayTime)
                    if(replays >= state.game.stepCount){
                        resolve()
                        return
                    }
                    let buttonToHighlight = state.game.steps[replays]
                    state.game.playSound(state.game.sounds[buttonToHighlight])
                    await highlightButton(state.game.getButtonElem(buttonToHighlight), state.game.buttonDisplayTime)
                    replays++
                }
            }
            timeOutFunc()
        })   
    }

    addRandomStep(){
        this.game.addStep(this.getRandomButton())
    }

    getRandomButton() {
        let ran = Math.floor(Math.random() * 4)

        switch(ran){
            case 0:
                return Button.Yellow
            case 1:
                return Button.Red
            case 2:
                return Button.Blue
            default:
                return Button.Green
        }
    }
}
