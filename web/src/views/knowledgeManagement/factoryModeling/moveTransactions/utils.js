export const getCreateMoveTransactionsUrl = () => '/knowledgeManagement/moveTransactions/create';

export const getMoveTransactionsListUrl = () => '/knowledgeManagement/moveTransactions';

export const getDetailMoveTransactionsUrl = (code, transType) => `/knowledgeManagement/moveTransactions/detail?code=${code}&transType=${transType}`;

export const getEditMoveTransactionsUrl = (code, transType) => `/knowledgeManagement/moveTransactions/edit?code=${code}&transType=${transType}`;

export default 'dummy';
