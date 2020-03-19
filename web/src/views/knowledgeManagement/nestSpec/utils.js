import { BASE_STATUS, findStatus } from 'src/constants';

// 创建嵌套规格页面的url
export const getCreateNestSpecPageUrl = () => '/knowledgeManagement/nestSpec/create';

// 编辑嵌套规格页面的url
export const getEditNestSpecPageUrl = id => `/knowledgeManagement/nestSpec/${encodeURIComponent(id)}/edit`;

// 嵌套规格详情页面的url
export const getNestSpecDetailPageUrl = id => `/knowledgeManagement/nestSpec/${encodeURIComponent(id)}/detail`;

// 嵌套规格列表页url
export const getNestSpecListPageUrl = () => '/knowledgeManagement/nestSpec';

// 嵌套规格状态
export const NEST_SPEC_STATUS = BASE_STATUS;

// 根据value找嵌套规格状态
export const findNestSpecStatus = findStatus;

export default 'dummy';
