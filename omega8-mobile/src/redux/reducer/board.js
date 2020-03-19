const defaultState = {
    pageLoaded : false,
    donejob: '--',
    sorting: '--'
  }
  const Board = (state = defaultState, action) => {
      switch (action.type) {
        case 'PAGE_AFTER_IN':
          return Object.assign({}, state, {
              pageLoaded: action.bool
          })
        case 'SET_DOWN_JOB':
          return Object.assign({}, state, {
            donejob: action.donejob
          })
        case 'SET_SORTING':
          return Object.assign({}, state, {
            sorting: action.sorting
          })
        default:
            return state
      }
    }
    
  export default Board  