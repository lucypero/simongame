import "../scss/popup"
import * as Velocity from "velocity-animate";
import { DomTools as dt } from "./tools/domTools";


export function popup(content:string, time:number = 1000){

    return new Promise((resolve, fail) => {

        //make a helper function that does this in DomTools
        let popupRange = document.createRange().createContextualFragment(
            `<div class="popup-cont"><div class="popup">${content}</div></div>`
        ) as Node
        
        document.body.appendChild(popupRange)
        let popup = dt.querySelector(document, ".popup")
        let popupCont = dt.querySelector(document, ".popup-cont")

        
        Velocity.animate(popup, {scale: 0.5, opacity:0}, {duration: 0})
        .then(() => Velocity.animate(popup, {scale:1, opacity: 1}, {duration: 300, easing: "ease-out"}))
        .then(() => Velocity.animate(popup, {scale:0.5, opacity: 0}, {duration: 300, easing: "ease-out", delay:time}))
        .then(() => {
            document.body.removeChild(popupCont)
            resolve()
        })
    })

    
    
}