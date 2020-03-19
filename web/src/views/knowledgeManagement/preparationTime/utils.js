import { primary, error } from 'src/styles/color';

const baseUrl = '/knowledgeManagement/preparationTime';
export const STATUS = [
  {
    value: 1,
    display: '启用中',
  },
  {
    value: 0,
    display: '停用中',
  },
];

export const UPDATE_STATUS = {
  inUse: { name: '启用中', value: 1, color: primary },
  stop: { name: '停用中', value: 0, color: error },
};

export const TYPES = [
  { value: 0, display: '产出物料相同' },
  {
    value: 1,
    display: '产出物料不同',
  },
];

export const knowledgeItem = {
  value: 'preparationTime',
  display: '动态准备时间',
};

// export const getDetailPath = id => {
//   return `${baseUrl}/${id}/detail`;
// };

export default 'dummy';
