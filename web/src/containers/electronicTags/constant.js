import { baseFind } from 'src/utils/object';

export const TAG_TYPE = {
  1: { name: '一维码', value: 1 },
  2: { name: '二维码', value: 2 },
};

export const EXPORT_SIGN = {
  all: { name: '全部', value: null },
  export: { name: '已导出', value: 1 },
  unExport: { name: '未导出', value: 0 },
};

export const PRINT_SIGN = {
  all: { name: '全部', value: null },
  print: { name: '已打印', value: 1 },
  unPrint: { name: '未打印', value: 0 },
};

export const ITEM_TYPE = {
  0: '常量',
  1: '日期',
  2: '变量',
  3: '流水号',
};

export const DATE_VALUE_SOURCE = {
  4: '创建时间',
  5: '当前时间',
};

export const SEQUENCE_TYPE = {
  0: '十进制',
  1: '三十二进制（除I、O、S、Z）',
};

export const DATE_VALUE_FORMAT = {
  0: 'YY',
  1: 'YYYY',
  2: 'YYMM',
  3: 'MMYY',
  4: 'YYMMDD',
  5: 'YYYYMMDD',
  6: 'YY/MM',
  7: 'MM/YY',
  8: 'YY/MM/DD',
  9: 'YYYY/MM/DD',
  10: 'YY.MM',
  11: 'MM.YY',
  12: 'YY.MM.DD',
  13: 'YYYY.MM.DD',
};

export const LETTER_VALUE_FORMAT = {
  14: '大写',
  15: '小写',
  // 16: '-',
};

export const EXPORT_COLUMN = {
  barcodeLabel: { name: '条码标签编号', value: 'barcodeLabel' },
  productSeq: { name: '产品序列号', value: 'productSeq' },
  productBatchSeq: { name: '产品批次号', value: 'productBatchSeq' },
  projectCode: { name: '项目编号', value: 'projectCode' },
  productName: { name: '产品名称', value: 'productName' },
  productCode: { name: '产品编号', value: 'productCode' },
  productSpecification: { name: '规格描述', value: 'productSpecification' },
  productUnit: { name: '单位', value: 'productUnit' },
  productAmount: { name: '产品数量', value: 'productAmount' },
  printStatus: { name: '打印状态', value: 'printStatus' },
};

export const PRINT_TEMPLATE_TYPE = {
  bar: { value: 0, name: '条码模版', alias: 'bar' },
  tag: { value: 1, name: '标签模版', alias: 'tag' },
};

export const findPrintTemplate = baseFind(PRINT_TEMPLATE_TYPE);

export const VARIABLE_VALUE_SOURCE = {
  0: '订单编号',
  1: '项目编号',
  2: '成品物料编号',
  3: '批次号',
};

export default 'dummy';
