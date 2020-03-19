// @flow
import {
  PROCESS_TYPE_VALUES,
  STANDARD_TYPE_VALUES,
  TIME_TEXT,
} from 'src/containers/productivityStandard/base/constant';
import { replaceSign } from 'src/constants';

// 获取标准信息
export const getStandardMessage = (
  timeInterval: number,
  timeUnit: string,
  amount: number,
  unit: string,
  type: string,
): string | null => {
  let res = null;

  // 如果是生产节拍，那结果是多少单位生产一个物料
  if (type === 'beatChoose') {
    res = `${timeInterval}${TIME_TEXT[timeUnit]}生产一${unit || '个'}物料`;
  }

  // 如果是产能，那结果是每单位生产多少pcs
  if (type === 'capacityChoose') {
    res = `每${timeInterval}${TIME_TEXT[timeUnit]}生产${amount}${unit || '个'}`;
  }

  return res;
};

// 格式化form中的数据,为了在编辑和创建的时候将数据格式化为后端需要的数据
export const formatFormValue = (value: any): any => {
  if (!value) return {};

  const { processData, material, standard, workstation, toolingCode } = value || {};
  console.log(workstation);

  const { timeUnit, time, type: standardType, amount } = standard || {};
  const [type, workstationId] = workstation.value.split('-');
  const { key: materialKey } = material || {};

  // 工序部分的信息
  let processCode = null;
  let processSeq = null;
  let processRouteCode = null;
  let mBomId = null;

  const { type: processType, process, processRouting, mBom } = processData || {};
  const seqType = PROCESS_TYPE_VALUES[processType];

  if (processType === 'process') {
    processCode = process ? process.key : null;
  }

  if (processType === 'processRouting') {
    const processKey = process && process.key ? process.key.split('/') : null;

    processRouteCode = processRouting ? processRouting.key : null;
    processSeq = processKey ? processKey[0] : null;
    processCode = processKey ? processKey[1] : null;
  }

  if (processType === 'mBom') {
    const processKey = process && process.key ? process.key.split('/') : null;

    mBomId = mBom ? mBom.key : null;
    processCode = processKey ? processKey[1] : null;
    processSeq = processKey ? processKey[0] : null;
  }

  // 标准部分的信息；
  let _amount = null;
  let _time = null;
  let _timeUnit = null;

  if (standardType === 'beat') {
    _amount = 1;
    _time = time;
    _timeUnit = timeUnit;
  }

  if (standardType === 'capacity') {
    _time = time;
    _amount = amount;
    _timeUnit = 'hour';
  }

  // material的信息
  const _materialKey = materialKey ? materialKey.split('/') : null;
  const materialCode = Array.isArray(_materialKey) ? _materialKey[0] : null;

  return {
    time: _time,
    amount: _amount,
    timeUnit: _timeUnit,
    standardType: STANDARD_TYPE_VALUES[standardType],
    workstationId,
    materialCode,
    seqType,
    processCode,
    toolingCode,
    nodeCode: processSeq,
    processRouteCode,
    mbomId: mBomId,
  };
};

// 将编辑的时候，后端的值转为前端需要的样子
export const getInitialValue = (value: any): any => {
  const {
    amount,
    materialCode,
    materialName,
    processCode,
    processName,
    processRouteCode,
    processRouteName,
    nodeCode: processSeq,
    processSeqType,
    standardType,
    timeInterval,
    timeUnit,
    unit, // material的unit
    workstationId,
    workstationName,
    mbomId,
    mbomMaterialCode,
    mbomMaterialName,
    mbomVersion,
  } = value || {};

  const workstation =
    workstationId && workstationName ? { value: `WORKSTATION-${workstationId}`, label: workstationName } : null;
  const material =
    materialCode && unit ? { key: `${materialCode}/${unit}`, label: `${materialCode}/${materialName}` } : null;

  // 工序的值
  let _type = null;
  Object.entries(PROCESS_TYPE_VALUES).forEach(
    ([key, label]: any): any => {
      if (label === processSeqType) {
        _type = key;
      }
    },
  );

  let _process = '';
  if (_type === 'process') {
    _process = { key: processCode, label: `${processCode}/${processName}` };
  } else {
    _process = { key: `${processSeq}/${processCode}`, label: `${processSeq}/${processCode}/${processName}` };
  }

  let _processRouting = '';
  if (_type === 'processRouting') {
    _processRouting = { key: processRouteCode, label: `${processRouteCode}/${processRouteName}` };
  }

  let _mBom = '';
  if (_type === 'mBom') {
    _mBom = { key: mbomId, label: `${mbomMaterialCode}/${mbomMaterialName}/${mbomVersion}` };
  }

  const processData = {
    type: _type,
    process: _process,
    processRouting: _processRouting,
    mBom: _mBom,
  };

  // 标准的值
  let _standardType;
  if (standardType === 'beatChoose') {
    _standardType = 'beat';
  } else {
    _standardType = 'capacity';
  }

  const standard = {
    timeUnit,
    time: Number(timeInterval),
    type: _standardType,
    amount: Number(amount),
  };

  return {
    workstation,
    material,
    standard,
    processData,
  };
};

// 获取工序信息
export const getProcessMessage = (recordData: any): any => {
  if (!recordData) return replaceSign;
  const {
    processCode,
    processName,
    nodeCode: processSeq,
    processSeqType,
    processRouteCode,
    processRouteName,
    mbomVersion,
    mbomMaterialCode,
    mbomMaterialName,
  } = recordData;

  if (processSeqType === PROCESS_TYPE_VALUES.process) {
    return `${processCode}/${processName}`;
  }

  if (processSeqType === PROCESS_TYPE_VALUES.processRouting) {
    return `${processRouteCode}/${processRouteName}-${processSeq}/${processCode}/${processName}`;
  }

  if (processSeqType === PROCESS_TYPE_VALUES.mBom) {
    return `${mbomMaterialCode}/${mbomMaterialName}/${mbomVersion}-${processCode}/${processName}`;
  }

  return replaceSign;
};

export default 'dummy';
