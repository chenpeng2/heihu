export const GENERATE_NEW_VERSION = {
  generate: 1,
  notGenerate: 2,
};

// 更换物料的format
export const formatValueForUpdateMaterial = (value) => {
  if (!value) return null;

  const { materialsNeedToChange, materialsAfterChange, rate, generateNewVersion, amountNeedChange, amountAfterChange, ...rest } = value;

  return {
    oldMaterialCode: materialsNeedToChange ? materialsNeedToChange.key : null,
    newMaterialCode: materialsAfterChange ? materialsAfterChange.key : null,
    lossRate: rate,
    beforeRatio: amountNeedChange,
    afterRatio: amountAfterChange,
    isNewVersion: generateNewVersion === GENERATE_NEW_VERSION.generate,
    ...rest,
  };
};

export default 'dummy';
