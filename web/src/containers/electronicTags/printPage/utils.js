import LocalStorage from 'src/utils/localStorage';
import { baseFind } from 'src/utils/object';

// 标签模式
export const ELECTRONIC_TAG_MODEL = {
  productLabel: { name: '成品出货模式', value: 0 },
  oneLabel: { name: '流转卡模式', value: 1 },
};

export const findElectronicTagModel = baseFind(ELECTRONIC_TAG_MODEL);

const LABEL_TYPE_KEY = 'labelTypeKey';

// 将标签模式保存在本地
export const saveLabelType = value => {
  LocalStorage.set(LABEL_TYPE_KEY, value);
};

// 获取本地的标签模式
export const getLabelType = () => {
  return LocalStorage.get(LABEL_TYPE_KEY);
};

const DEFAULT_TEMPLATE_KEY = 'useDefaultTemplateKey';

export const saveUseDefaultTemplate = (value) => {
  LocalStorage.set(DEFAULT_TEMPLATE_KEY, value);
};

export const getUseDefaultTemplate = () => {
  return LocalStorage.get(DEFAULT_TEMPLATE_KEY);
};

export default 'dummy';
