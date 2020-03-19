const initialState = {
    OpenState:false
}

export default function OtherReducer(state = initialState, action) {
    switch (action.type) {
        case 'SET_OPEN_STATE':
            state = {...state,
                ...action.payload
            }
            return state
        case 'CANCEL_OPEN_STATE':
            state = {...state,
                ...action.payload
            }
            return state
        default:
            return state
    }
}
