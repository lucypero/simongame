export class DomTools {

    static getById(id:string){
        return document.getElementById(id) as HTMLElement
    }

    static querySelector(parent : NodeSelector, selector : string) {
        return parent.querySelector(selector) as HTMLElement
    }

    static querySelectorAll(parent : NodeSelector, selector : string) {
        return parent.querySelectorAll(selector) as NodeListOf<HTMLElement>
    }

    static animationEvents = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd"

    static getTransitionEvents= "transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd"

    static addEventListener(elements : NodeListOf<HTMLElement>, event:string, callback:Function) {
        for (let i = 0; i < elements.length; i++) {
            elements.item(i).addEventListener(event, callback.bind(elements.item(i)))            
        }
    }

    /* Add one or more listeners to an element
    ** @param {DOMElement} element - DOM element to add listeners to
    ** @param {string} eventNames - space separated list of event names, e.g. 'click change'
    ** @param {Function} listener - function to attach for each event as a listener
    */
    static addListenerMulti(element:HTMLElement, eventNames:string, listener:Function) {
        var events = eventNames.split(' ');
        for (var i=0, iLen=events.length; i<iLen; i++) {
            element.addEventListener(events[i], listener.bind(element), false);
        }
    }

    static addClass(el: HTMLElement, className:string):void;
    static addClass(el: NodeListOf<HTMLElement>, className:string):void ;
    static addClass(el: any, className:string) : void {
        if(el instanceof HTMLElement){
            el.classList.add(className);
        }
        else{
            for (let i = 0; i < el.length; i++) {
                el.item(i).classList.add(className);          
            }
        }
    }

    static removeClass(el: HTMLElement, className:string):void;
    static removeClass(el: NodeListOf<HTMLElement>, className:string):void ;
    static removeClass(el: any, className:string) {
        if(el instanceof HTMLElement){
            el.classList.remove(className);
        }
        else{
            for (let i = 0; i < el.length; i++) {
                el.item(i).classList.remove(className);          
            }
        }
    }

    static addSvgClass(el: HTMLElement, className:string){
        if(!el.getAttribute("class"))
            el.setAttribute("class", "")

        let classArray = el.getAttribute("class")!.split(' ')
        for (let iClass of classArray) {
            if(iClass === className)
                return;
        }
        // for(el.getAttribute("class").split(' '))
        let space = el.getAttribute("class") === "" ? "" : " "
        el.setAttribute("class", el.getAttribute("class") + `${space+className}`)
    }

    static removeSvgClass(el: HTMLElement, className:string){
        let classArray = el.getAttribute("class")!.split(' ')
        let newArray:string[] = []
        for (let iClass of classArray) {
            if(iClass !== className){
                newArray.push(iClass)
            }
        }
        el.setAttribute("class", newArray.join(' '))
    }
    
    static hasClass(el:HTMLElement, className:string) {
        return el.classList.contains(className);
    }

    static on(event:string, selector:string, handler:Function){
        document.addEventListener(event, function(this: HTMLElement,e) {
            for (var target=e.target as HTMLElement; target && target!=this; target=target.parentNode as HTMLElement) {
            // loop parent nodes from the target to the delegation node
                if (target.matches(selector)) {
                    handler.call(target, e);
                    break;
                }
            }
        }, false);
    }

    static clear(element:HTMLElement):void;
    static clear(element:NodeListOf<HTMLElement>):void;
    static clear(element:any):void{
        if(element instanceof HTMLElement){
            this.clearSingle(element)
        }
        else{
            for (let i = 0; i < element.length; i++) {
                this.clearSingle(element.item(i))        
            }
        }
        
    }

    private static clearSingle(element:HTMLElement){
        var cNode = element.cloneNode(false);
        if(element.parentNode)
            element.parentNode.replaceChild(cNode , element);
        else
            throw new DOMException("element needs a parent")
    }

    //This works for removing all event listeners on that node
    static recreateNode(el:HTMLElement, withChildren:boolean):void;
    static recreateNode(el:NodeListOf<HTMLElement>, withChildren:boolean):void;
    static recreateNode(el:any, withChildren:boolean) {
        if(el instanceof HTMLElement){
            this.recreateSingleNode(el, withChildren)
        }
        else{
            for (let i = 0; i < el.length; i++) {
                this.recreateSingleNode(el.item(i), withChildren)        
            }
        }
    }

    private static recreateSingleNode(el:HTMLElement,withChildren:boolean){
        if(!el.parentNode)
            return

        if (withChildren)
            el.parentNode.replaceChild(el.cloneNode(true), el);
        else {
            var newEl = el.cloneNode(false);
            while (el.hasChildNodes())
                newEl.appendChild(el.firstChild!);
            el.parentNode.replaceChild(newEl, el);
        }
    }
}