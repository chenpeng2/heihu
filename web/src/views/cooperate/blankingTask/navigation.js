import CONSTANT from './constant';

export const toProdTaskDetail = ({ category = CONSTANT.CATEGORY_PRODTASK, id }) => {
  if (category === CONSTANT.CATEGORY_INJECT_MOLD) {
    return `/cooperate/inject-mold-tasks/detail/${id}`;
  }
  return `/cooperate/prodTasks/detail/${id}?category=${category}`;
};

export default toProdTaskDetail;
