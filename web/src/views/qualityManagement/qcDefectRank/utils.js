export const getQcDefectRankImportLogUrl = () => '/knowledgeManagement/qcDefectRank/importLog';

export const getQcDefectRankImportLogDetailUrl = id => `/knowledgeManagement/qcDefectRank/importLog/detail?id=${id}`;

export const getFormatSearchParams = value => {
  const { page, size, searchStatus, ...rest } = value;
  const params = {
    searchStatus: searchStatus && searchStatus.key,
    page: page || 1,
    size: size || 10,
    ...rest,
  };
  return params;
};
