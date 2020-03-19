import { baseFind } from 'src/utils/object';
import moment, { formatRangeUnix } from 'src/utils/time';
import { replaceSign } from 'src/constants';

export const RULE_TYPE = {
  constant: { name: '常量', value: 2 },
  date: { name: '日期', value: 1 },
  seq: { name: '流水号', value: 3 },
};

export const DATE_FORMAT = [
  'YY',
  'YYYY',
  'YYMM',
  'MMYY',
  'YYMMDD',
  'YYYYMMDD',
  'YY/MM',
  'MM/YY',
  'YY/MM/DD',
  'YYYY/MM/DD',
  'YY.MM',
  'MM.YY',
  'YY.MM.DD',
  'YYYY.MM.DD',
];

export const SEQ_TYPE = {
  decimalism: { name: '十进制', value: 1 },
  duotricemaryNotation: { name: '三十二进制（除I,O,S,Z）', value: 2 },
};

export const findRuleType = baseFind(RULE_TYPE);
export const findSeqType = baseFind(SEQ_TYPE);

export const DEFAULT_USE_RANGE = { name: '全工厂', value: 1 };
export const CODE_TYPE = { name: '入厂批次', value: 1 };

/**
 * @description: 将baseForm中的值格式化为后端接口需要的
 *
 * @date: 2019/4/4 下午2:18
 */
export const formatFormValueForSubmit = formValue => {
  if (!formValue) return;

  const { codeName, desc, ruleDetail, validTime, ...rest } = formValue;

  const range = Array.isArray(validTime) && validTime.length === 2 ? formatRangeUnix(validTime) : null;
  return {
    validRange: DEFAULT_USE_RANGE.value,
    type: CODE_TYPE.value,
    name: codeName,
    des: desc,
    validDateFrom: range ? range[0] : null,
    validDateTo: range ? range[1] : null,
    items: Array.isArray(ruleDetail)
      ? ruleDetail.map(i => {
          const { setValue, type, dateFormat, length, seqType, startValue, stepLength, ...rest } = i || {};
          return {
            type,
            serialLength: length,
            dateFormat,
            consValue: setValue,
            serialFrom: startValue,
            serialStep: stepLength,
            serialFormat: seqType,
            ...rest,
          };
        }).filter(i => i)
      : null,
    ...rest,
  };
};

/**
 * @description: 将后端的数据格式化为form需要的data
 *
 * @date: 2019/4/4 下午5:01
 */
export const formatServiceDataToFormData = serviceData => {
  if (!serviceData) return;

  const { name, des, validDateFrom, validDateTo, items } = serviceData || {};

  return {
    codeName: name,
    desc: des,
    validTime: [validDateFrom ? moment(validDateFrom) : null, validDateTo ? moment(validDateTo) : null],
    ruleDetail: Array.isArray(items)
      ? items.map(i => {
          const { consValue, dateFormat, serial, serialFormat, serialFrom, serialLength, serialStep, type } = i || {};
          return {
            setValue: consValue,
            length: serialLength,
            dateFormat,
            serial,
            seqType: serialFormat,
            startValue: serialFrom,
            stepLength: serialStep,
            type: findRuleType(type),
          };
        }).filter(i => i)
      : undefined,
  };
};

export const getCustomCodeDetailPageUrl = (id) => {
  return `/customCode/${id}/detail`;
};

export const goToCustomCodeDetailPage = (history, id) => {
  if (!history || !id) return;
  const url = getCustomCodeDetailPageUrl(id);
  if (url) history.push(url);
};

export const goToCustomCodeEditPage = (history, id) => {
  if (!history || !id) return;
  history.push(`/customCode/${id}/edit`);
};

/**
 * @description: 获取有效期的text
 *
 * @date: 2019/4/4 下午4:13
 */
export const getValidDateText = (from, to) => {
  const formText = from ? moment(from).format('YYYY/MM/DD') : replaceSign;
  const toText = to ? moment(to).format('YYYY/MM/DD') : replaceSign;

  return `${formText} - ${toText}`;
};

export default 'dummy';
