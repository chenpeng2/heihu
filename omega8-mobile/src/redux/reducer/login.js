const defaultState = {
    loginInfo : {}
  }
  const login = (state = defaultState, action) => {
      switch (action.type) {
        case 'LOGIN/GET_USER_INFO':
            return Object.assign({}, state, {
                loginInfo: action.payload
              })
        default:
          return state
      }
    }
    
  export default login  