// inPage: ['productOrderSchedule'], 'cooperate/productOrders']

const ganttRuducer = (state = { inPage: '' }, { type, inPage }) => {
  switch (type) {
    case 'setGanttPage':
      return {
        ...state,
        inPage,
      };
    default:
      return state;
  }
};

export default ganttRuducer;
