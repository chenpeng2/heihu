import _ from 'lodash';

export const findMaterial = (materialCode, materialList) => {
  if (!materialCode || !materialList || !Array.isArray(materialList)) {
    return null;
  }
  return materialList.find(e => _.isEqual(e.material.code, materialCode));
};

export const findNode = (treeData, value) => {
  let res;
  const [type, id] = value.split('-');
  if (treeData) {
    treeData.forEach(node => {
      if (res) {
        return;
      }
      if (Number(node.id) === Number(id) && type === node.type) {
        res = node;
      } else {
        res = findNode(node.children, value);
      }
    });
  }
  return res;
};

export const formatNode = (node, parent, cb) => {
  const res = {
    name: node.name,
    label: node.name,
    title: node.name,
    value: `${node.type}-${node.id}`,
    type: node.type,
    key: `${node.type}-${node.id}`,
    id: node.id,
    isLeaf: !node.children,
  };
  res.children = node.children && node.children.map(ws => this.formatNode(ws, res, cb));
  if (cb) {
    cb(res);
  }
  return res;
};

// 为初始值的amount, amountFraction做出选择
export const getAmountInitialValue = data => {
  if (!data) return null;
  const { amount, amountFraction } = data || {};

  if (amountFraction && amountFraction.numerator && amountFraction.denominator) {
    const { numerator, denominator } = amountFraction;
    return `${numerator}/${denominator}`;
  }

  return amount || 0;
};
export const getProcessFormPayload = value => {
  // 在之后的流程中 val 会被改变导致不能调用 moment 的一些方法，所以先复制出一份
  const values = _.cloneDeep(value);
  const {
    nodeCode,
    inputMaterials,
    outputMaterialCode: materialCodeString,
    outputMaterialAmount: amount,
    outputMaterialCurrentUnitId,
    successionMode,
    workstations,
    workstationGroups,
    primaryMaterialCode,
    preMaterialProductionMode = 1,
    preparationTimeValue,
    preparationTimeCategory,
    attachments,
    productDesc,
    toolings,
    toolingKeys,
    deliverable,
    qcConfigs,
  } = values;
  const outputMaterial = materialCodeString ? JSON.parse(materialCodeString.key) : null;

  return {
    nodeCode,
    // 如果没填投产方式 默认为1-扫码投产
    preMaterialProductionMode,
    inputMaterials:
      Array.isArray(inputMaterials) &&
      inputMaterials
        .filter(e => e && e.material && e.amount)
        .map(({ materialProductionMode = 1, ...rest }) => ({
          ...rest,
          materialProductionMode,
        })),
    successionMode,
    primaryMaterialCode,
    deliverable,
    outputMaterial:
      outputMaterial || amount
        ? {
            material: outputMaterial,
            amount,
            currentUnitId: outputMaterialCurrentUnitId,
          }
        : null,
    productDesc,
    workstations,
    workstationGroups,
    toolings: toolings && toolings.filter(e => e && e.toolingCode && e.toolingCode.key),
    toolingKeys,
    attachments,
    qcConfigs,
    preparationTimeCategory,
    preparationTime: preparationTimeValue,
  };
};

export default 'dummy';
