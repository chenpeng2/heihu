import { QCLOGIC_TYPE } from 'src/views/qualityManagement/constants';
import { round } from './number';

const defaultCategoryReasonNames = ['良品', '其他', '待定'];

const reasonMap = {
  good: '良品',
  other: '其他',
  undetermined: '待定',
};

export const filterDefaultReason = categoryReasons =>
  Object.assign({}, categoryReasons, {
    edges: categoryReasons.edges
      .filter(e => defaultCategoryReasonNames.indexOf(e.node && e.node.defect ? e.node.defect.name : e.node.name) < 0)
      .map(e => ({
        node: {
          ...(e.node.defect ? e.node.defect : e.node),
          count: e.node.count,
        },
      })),
  });

export const checkItemConfigToDisplay = ({ logic, base, max, min, unit }) => {
  let res = '';
  if (!logic) return null;
  if (logic.value === 'yn' || logic.value === 'manual') {
    res = logic.display;
  } else {
    if (!(unit && unit.name)) {
      global.log.error('非人工判断应该有单位');
      return res;
    }
    if (logic.value === 'between') {
      res = `${min} ~ ${max} ${unit.name}`;
    } else if (logic.value === 'tolerance') {
      res = `${base} + ${round(max - base)} - ${round(base - min)} ${unit.name}`;
    } else {
      res = `${logic.display} ${base} ${unit.name}`;
    }
  }
  return res;
};

export const restCheckItemConfigToDisplay = ({ logic: _logic, base, max, min, unit }) => {
  const logic = QCLOGIC_TYPE[_logic];
  if (!logic) return null;
  let res = '';
  if (logic.value === 'yn' || logic.value === 'manual') {
    res = logic.display;
  } else {
    if (!(unit && unit.name)) {
      global.log.error('非人工判断应该有单位');
      // return res;
    }
    if (logic.value === 'between') {
      res = `${min} ~ ${max} ${unit ? unit.name : ''}`;
    } else if (logic.value === 'tolerance') {
      res = `${base} ${round(max - base) > 0 ? '+' : ''}${round(max - base)} ${round(min - base) > 0 ? '+' : ''}${round(
        min - base,
      )} ${unit ? unit.name : ''}`;
    } else {
      res = `${logic.display} ${base} ${unit ? unit.name : ''}`;
    }
  }
  return res;
};

const appendIfMatch = (arr: Array, item, condition: boolean) => {
  if (condition) {
    return arr.concat([item]);
  }
  return arr;
};

const appendIfMatchWithDefault = (arr, item, condition, defaultValue) => {
  return appendIfMatch(arr || defaultValue, item, condition);
};

export const distinguishDefects = (defects: Array<{ name: string }>) => {
  return defects.reduce((groups, defect: { defect: { name: string } }) => {
    return {
      ...groups,
      goods: appendIfMatchWithDefault(groups.goods, defect, defect.name === reasonMap.good, []),
      others: appendIfMatchWithDefault(groups.others, defect, defect.name === reasonMap.other, []),
      undetermined: appendIfMatchWithDefault(groups.undetermined, defect, defect.name === reasonMap.undetermined, []),
      defects: appendIfMatchWithDefault(groups.defects, defect, Object.values(reasonMap).indexOf(defect.name) < 0, []),
    };
  }, {});
};

export default filterDefaultReason;
