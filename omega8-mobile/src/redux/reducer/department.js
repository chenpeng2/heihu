const defaultState = {
  list : [
    { name: '收货部', id: 0 },
    { name: '分货部', id: 1 },
    { name: '稳定库存', id: 2 },
    // { name: '收货部', id: 3 }
  ],
  depart: {},
  warehouse: []
}
const departDeal = (state = defaultState, action) => {
    switch (action.type) {
      case 'SET_CURRENT_DEPART':
        return Object.assign({}, state, {
          depart: {
            id: action.id,
            name: action.name
          }
        })
      case 'SET_WAREHOUSE':
        return Object.assign({}, state, {
          warehouse: action.warehouse
        })
      default:
        return state
    }
  }
  
export default departDeal  