import uuid from 'uuid';
import { formatValues } from 'containers/qcConfig/qcConfigBase';
import { Big, round } from 'src/utils/number';
import _ from 'lodash';

export const createUUID = () => {
  return uuid();
};

// 为了将数值转为毫秒值。后端接口需要存储毫秒值
export const convertPreparationTime = (value, unit) => {
  if (typeof value !== 'number') return;
  // 小时
  if (unit === 1) {
    return new Big(value)
      .times(60 * 60 * 1000)
      .round(6)
      .valueOf();
  }

  // 分钟
  if (unit === 0) {
    return new Big(value).times(60 * 1000);
  }
};

// 将后端的准备时间(ms单位)转换为小时和分钟
export const convertPreparationTimeToRightFormat = (value, unit) => {
  if (typeof value !== 'number') return;
  // 小时
  if (unit === 1) {
    return new Big(value)
      .div(60 * 60 * 1000)
      .round(6)
      .valueOf();
  }

  // 分钟
  if (unit === 0) {
    return new Big(value)
      .div(60 * 1000)
      .round(6)
      .valueOf();
  }
};

// 将rest process接口拉回来的数据format为需要的格式
export const formatWorkstationsInProcess = processData => {
  if (!processData) return {};
  const _data = _.cloneDeep(processData);

  const { workstations, workstationGroups, workstationDetails } = _data;

  const _workstations = [];
  const _workstationGroups = [];

  workstations.forEach(id => {
    const workstation = workstationDetails.find(item => item && item.id === id);
    if (workstation) {
      workstation.workstationGroup = workstation.group;
      workstation.id = Number(id);
      _workstations.push(workstation);
    }
  });

  workstationGroups.forEach(id => {
    const children = workstationDetails.filter(item => item && item.groupId === id);
    const group = Array.isArray(children) && children.length ? children[0].group : {};

    _workstationGroups.push({ id: Number(group.id), name: group.name, workstations: children });
  });

  return { ..._data, workstations: _workstations, workstationGroups: _workstationGroups };
};

// 验证工艺路线提交时候的数据是否合法
export const validatePostProcessRouteData = data => {
  const validRes = {
    res: true,
    message: null,
  };

  // 判断是否有工序
  if (
    data &&
    Array.isArray(data.processList) &&
    data.processList.length === 1 &&
    Array.isArray(data.processList[0].nodes) &&
    data.processList[0].nodes.length &&
    !data.processList[0].nodes[0].process
  ) {
    validRes.res = false;
    validRes.message = '请至少添加一个工序';
    return validRes;
  }

  // 判断是否每一个工序都合理
  data.processList.forEach(({ nodes }) => {
    if (nodes) {
      nodes.forEach(({ process }) => {
        if (!process) {
          validRes.res = false;
          validRes.message = '存在没有数据的工序';
        }
      });
    } else {
      validRes.res = false;
      validRes.message = '存在没有数据的工序';
    }
  });

  return validRes;
};

// format将要提交给后端的数据
export const formatPostProcessRouteData = data => {
  if (!data) return null;

  data.processList = data.processList.map(({ nodes }, index) => {
    return {
      seq: index + 1,
      name: nodes && nodes.length > 1 ? `并行工序${index}` : null,
      nodes: nodes.map(
        ({
          process,
          nodeCode,
          productDesc,
          workstationGroups,
          workstations,
          attachments,
          qcConfigs,
          successionMode,
          preparationTime,
          preparationTimeCategory,
          deliverable,
          id,
        }) => {
          const { code } = process || {};

          return {
            id,
            nodeCode,
            productDesc,
            processCode: code,
            successionMode,
            preparationTime: convertPreparationTime(preparationTime, preparationTimeCategory),
            deliverable,
            preparationTimeCategory,
            workstationGroups,
            workstations: Array.isArray(workstations) ? workstations.filter(a => a) : [],
            attachments: Array.isArray(attachments) ? attachments.map(({ restId }) => restId).filter(a => a) : [],
            qcConfigDetails:
              Array.isArray(qcConfigs) && qcConfigs.filter(e => e).map(qcConfig => formatValues(qcConfig)),
          };
        },
      ),
    };
  });

  return data;
};

export default 'dummy';
