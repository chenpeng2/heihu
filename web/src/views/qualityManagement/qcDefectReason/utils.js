export const getQcDefectReasonImportLogUrl = () => '/knowledgeManagement/qcDefectReason/importLog';

export const getQcDefectReasonImportLogDetailUrl = id =>
  `/knowledgeManagement/qcDefectReason/importLog/detail?id=${id}`;

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
