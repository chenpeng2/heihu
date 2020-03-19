const initialState = {};

export const reducer = (state = initialState, { type, formName, key, payload } = { type: 'none' }) => {
  let value;
  switch (type) {
    case 'SAVE':
      value = state[formName] || {};
      return { ...state, [formName]: { ...value, [key]: payload } };
    default:
      return state;
  }
};

export default 'dummy';
