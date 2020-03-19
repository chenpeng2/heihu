const initialState = {
    routeName: '/inputData',
  }

export default function route(state = initialState, action) {
    switch (action.type) {
    case 'CHANGE-ROUTE':
      state.routeName = action.payload
      return state
    default:
      return state
    }
  }