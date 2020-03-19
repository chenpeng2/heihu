export const toSOPDetail = id => `/knowledgeManagement/sop/detail/${id}`;

export const toSOPTemplateDetail = id => `/knowledgeManagement/sop-template/detail/${id}`;

export const toSOPEdit = id => `/knowledgeManagement/sop/edit/${id}`;

export const toSOPTemplateEdit = id => `/knowledgeManagement/sop-template/edit/${id}`;

export const toSOPTemplateStep = (id, params = {}) =>
  `/knowledgeManagement/sop-template/step/${id}?query=${JSON.stringify(params)}`;

export const toSOPStep = (id, params = {}) =>
  `/knowledgeManagement/sop/edit-sop-step/${id}?query=${JSON.stringify(params)}`;

export const toSOPTemplateLog = id => `/knowledgeManagement/sop-template/detail/${id}/log`;

export const toSOPList = (params = {}) => `/knowledgeManagement/sop?query=${JSON.stringify(params)}`;

export const toSOPTemplateList = (params = {}) =>
  `/knowledgeManagement/sop-template?query=${JSON.stringify(params)}`;

export const toSOPTaskDetail = id => `/cooperate/SOPTask/detail/${id}`;
