const fetchReducer = (state = { loading: {} }, { type, loading, key }) => {
   switch (type) {
      case 'changeLoading':
         return {
            ...state,
            loading: {
               ...state.loading,
               [key]: loading,
            },
         };
      default:
         return state;
   }
};

export default fetchReducer;
