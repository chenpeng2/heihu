export const isBindEBomToProcessRouting = mBomData => {
  if (!mBomData) {
    return;
  }
  const { ebomVersion, bindEBomToProcessRouting } = mBomData;
  if (!ebomVersion) {
    return null; // 没有物料清单,没有组件分配
  }
  return bindEBomToProcessRouting; // 组件分配为是Or否
};
