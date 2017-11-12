const StateMachine = require('./stateMachine.js')

class ZigzagBot extends StateMachine {
    constructor(opt = {}, apiInterface) {
        super(opt, apiInterface)
    }
}
