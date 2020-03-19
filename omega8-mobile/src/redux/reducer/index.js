import { combineReducers } from 'redux';

import department from './department'
import board from './board'
import login from './login'

const defaultState = {}
const globalReducer = (state = defaultState, action) => {
    switch (action.type) {
        case 'NAVIGATE':
           return state
        default:
            return state
    }
}

export default combineReducers({
    department,
    board,
    login
})