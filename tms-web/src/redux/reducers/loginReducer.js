const initialState = {
  userRole: ''
}

export default function userInfo(state = initialState, action) {
    switch (action.type) {
    case 'LOGIN/SETTING_USER_INFO':
      state = {
          ...action.payload
      }
      return state
    case 'LOGIN/GET_USER_ROLE':
      state = {
        ...state,
        ...action.payload
      }
      return state
    default:
      return state
    }
  }