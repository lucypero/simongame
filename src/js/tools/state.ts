//use Mixins instead of plain inheritance
//check the ts docs
export {State, Stateful}

interface State<T> {
    enter(info:T):void;
    exit():void;
}

class Stateful<T> {

    protected currentState?:State<T>

    get state(): State<T>{
        return this.currentState!
    }
    
    setState(nextState: State<T>, info:T){
        if(this.currentState)
            this.currentState.exit()
        this.currentState = nextState
        this.currentState.enter(info)
    }
}

