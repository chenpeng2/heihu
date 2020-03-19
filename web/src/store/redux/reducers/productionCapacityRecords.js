export const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'changeProductionTab':
      state[action.tab] = action.query;
      return state;
    default:
      return state;
  }
};


export default 'dummy';
