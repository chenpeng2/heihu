import _ from 'lodash';

import { formatToUnix } from 'src/utils/time';
import { arrayIsEmpty } from 'utils/array';
import { WEIGHING_MODE_CUSTOM } from '../constants';

export const formatValues = values => {
  const { planBeginTime, planEndTime, instructions, executorType, executor, ...rest } = values;

  values.planBeginTime = formatToUnix(planBeginTime);
  values.planEndTime = formatToUnix(planEndTime);
  values.userChooseMode = executorType;
  values.userChooseId = _.get(executor, 'key');
  delete values.executorType;
  delete values.executor;

  if (instructions && instructions.length > 0) {
    const _instructions = instructions.map(item => {
      const { segments } = item;
      const _segments = segments && segments.filter(s => s);

      return {
        ...item,
        segments: _segments,
      };
    });

    values.instructions = _instructions && _instructions.filter(x => _.get(x, 'segments.length') > 0);
  }

  return values;
};

export const formatInstructions = (instructions, defaultExpanded = true) => {
  const dataSource = [];
  if (instructions && instructions.length > 0) {
    instructions.forEach((item, index) => {
      const { segments, weighingMode, ...rest } = item;
      const { materialCode, materialName, materialUnit } = rest || {};
      /** 称量规则为任意细分时，则不指定细分 */
      const children = !arrayIsEmpty(segments)
        ? segments.map((segment, i) => {
            return {
              key: `instructions[${index}].segments[${i}]`,
              parentKey: `instructions[${index}]`,
              ...segment,
              weighingMode,
              materialCode,
              materialName,
              materialUnit,
            };
          })
        : [];
      dataSource.push({
        ...rest,
        lastChildKey: children.length, // 保持增删item时key的唯一性
        materialName,
        weighingMode,
        baseChild: children[0],
        key: `instructions[${index}]`,
        expanded: defaultExpanded,
        children,
      });
    });
  }
  return dataSource;
};

export default 'dummy';
