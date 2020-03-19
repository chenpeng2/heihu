export const getFormatParams = (value, configValue) => {
  const { procureOrder, status, purchaseOrder, project, supplier, materialCode } = value || {};
  const { key: procureOrderCode } = procureOrder || {};
  const { key: purchaseOrderCode } = purchaseOrder || {};
  const { key: projectCode } = project || {};
  const { key: planWorkOrderCode } = project || {};
  const { key: supplierCode } = supplier || {};
  const { key: statusCode } = status || {};
  const params = {
    procureOrderCode,
    purchaseOrderCode,
    supplierCode,
    materialCode,
    status: statusCode,
    page: value.page || 1,
    size: value.size || 10,
  };
  if (!supplierCode) {
    delete params.supplierCode;
  }
  if (configValue === 'manager') {
    params.planWorkOrderCode = planWorkOrderCode;
  } else {
    params.projectCode = projectCode;
  }
  return params;
};

export default 'dummy';
