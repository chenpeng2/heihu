export const getMachiningMaterialDetailUrl = code =>
  `/knowledgeManagement/machiningMaterial/${encodeURIComponent(code)}/detail`;

export const getEditMachiningMaterialUrl = code => `/knowledgeManagement/machiningMaterial/${code}/edit`;

export const getMachiningMaterialListUrl = () => '/knowledgeManagement/machiningMaterial';
