import React from 'react';
import ProdTaskHistory from 'containers/task/produceTask/detail/prodTaskOperationLog';
import { TASK_CATEGORY_INJECT_MOLD } from 'constants';

const History = props => {
  return <ProdTaskHistory category={TASK_CATEGORY_INJECT_MOLD} {...props} />;
};

export default History;
