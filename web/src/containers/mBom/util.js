import _ from 'lodash';
import { formatInitialValue } from 'containers/qcConfig/qcConfigBase';
import { isFraction, getFractionCompose } from 'src/utils/number';
import LocalStorage from 'utils/localStorage';
import { convertPreparationTimeToRightFormat } from 'src/containers/processRouting/util';

// 将rest接口拉回来的数据format为需要的格式
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
      _workstations.push(workstation);
    }
  });

  workstationGroups.forEach(id => {
    const children = workstationDetails.filter(item => item && item.groupId === id);
    const group = Array.isArray(children) && children.length ? children[0].group : {};

    _workstationGroups.push({ id: group.id, name: group.name, workstations: children });
  });

  return { ..._data, workstations: _workstations, workstationGroups: _workstationGroups };
};

// 将rest接口拉回来的数据format为需要的格式
export const formatWorkstationsInProgressForMBom = processData => {
  if (!processData) return {};
  const _data = _.cloneDeep(processData);

  const {
    workstations,
    workstationGroups,
    workstationDetails,
    workstationGroupDetails,
    preparationTime,
    preparationTimeCategory,
  } = _data;

  const _workstations = [];
  const _workstationGroups = [];

  workstations.forEach(id => {
    const _id = Number(id);
    const workstation = workstationDetails.find(item => item && item.id === _id);
    if (workstation) {
      workstation.workstationGroup = workstation.group;
      workstation.id = Number(workstation.id);
      _workstations.push(workstation);
    }
  });

  workstationGroups.map(id => Number(id)).forEach(id => {
    const group = workstationGroupDetails.find(item => item && item.id === id);
    if (group) {
      _workstationGroups.push({ id: Number(group.id), name: group.name, workstations: group.workstations });
    }
  });

  return {
    ..._data,
    preparationTime: convertPreparationTimeToRightFormat(preparationTime, preparationTimeCategory),
    preparationTimeCategory,
    workstations: _workstations,
    workstationGroups: _workstationGroups,
  };
};

export const formatWorkstationForProcessRouting = processRouting => {
  if (!processRouting) {
    return null;
  }
  return {
    ...processRouting,
    processList: processRouting.processList.map(process => ({
      ...process,
      nodes: process.nodes.map(node => {
        return {
          ...formatWorkstationsInProcess(node),
          attachments: node.attachmentFiles,
          process: { ...formatWorkstationsInProcess(node.process) },
        };
      }),
    })),
  };
};

export const formatProcessRouting = processRouting => {
  if (!processRouting) {
    return null;
  }
  return {
    ...processRouting,
    processList: processRouting.processList.map(process => ({
      ...process,
      nodes: process.nodes.map(
        ({ qcConfigDetails, attachmentFiles, preparationTime, preparationTimeCategory, ...rest }) => {
          const { process } = rest || {};
          return {
            ...formatWorkstationsInProcess(rest),
            preparationTime: convertPreparationTimeToRightFormat(preparationTime, preparationTimeCategory),
            preparationTimeCategory,
            attachments: attachmentFiles,
            process: { ...formatWorkstationsInProcess(process) },
            qcConfigs: qcConfigDetails && qcConfigDetails.map(qcConfig => qcConfig),
            outputFrozen: process ? process.outputFrozenCategory : null,
          };
        },
      ),
    })),
  };
};

export const formatWorkstationsForMBom = processRouting => {
  if (!processRouting) {
    return null;
  }
  return {
    ...processRouting,
    processList: processRouting.processList.map(process => ({
      ...process,
      nodes: process.nodes.map(node => ({
        ...formatWorkstationsInProgressForMBom(node),
        attachments: node.attachmentDetails,
        process: { ...formatWorkstationsInProgressForMBom(node.process) },
      })),
    })),
  };
};

export const formatMBom = processRouting => {
  if (!processRouting) {
    return null;
  }
  return {
    ...processRouting,
    processList: processRouting.processList.map(process => ({
      ...process,
      nodes: process.nodes.map(({ qcConfigDetails, attachmentDetails, ...rest }) => ({
        ...formatWorkstationsInProgressForMBom(rest),
        attachments: attachmentDetails,
        process: { ...formatWorkstationsInProgressForMBom(rest.process) },
        qcConfigs: qcConfigDetails && qcConfigDetails.map(qcConfig => qcConfig),
      })),
    })),
  };
};

// 判断是否是分数。给出正确的amount的格式
export const getRightAmount = amount => {
  if (!amount) return {};
  if (isFraction(amount)) {
    return {
      amountFraction: getFractionCompose(amount),
    };
  }
  return {
    amount,
  };
};

const MBOM_VERSION_LOCALSTORAGE_KEY = 'MBOM_VERSION';

export const setMbomVersionInLocalStorage = version => {
  if (version) LocalStorage.set(MBOM_VERSION_LOCALSTORAGE_KEY, version);
};

export const getMbomVersionInLocalStorage = () => {
  return LocalStorage.get(MBOM_VERSION_LOCALSTORAGE_KEY) || undefined;
};

export default 'dummy';
