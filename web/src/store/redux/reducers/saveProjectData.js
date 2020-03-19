export const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'saveProjectData':
      return { ...state, ...action.projectData };
    default:
      return state;
  }
};


export default 'dummy';
