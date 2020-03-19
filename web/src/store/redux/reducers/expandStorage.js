export const reducer = (state = [], action) => {
  switch (action.type) {
    case 'expandStorage':
      if (action.isPackup) {
        state = state.filter(n => n.id !== action.record.id);
      } else if (action.clear) {
        state = [];
      } else {
        state.push(action.record);
      }
      return state;
    default:
      return state;
  }
};

export const createStorage = (state = {}, action) => {
  switch (action.type) {
    case 'create':
      state = action.record;
      return state;
    default:
      return state;
  }
};

export const editStorage = (state = {}, action) => {
  switch (action.type) {
    case 'edit':
      state = action.record;
      return state;
    default:
      return state;
  }
};


export default 'dummy';
