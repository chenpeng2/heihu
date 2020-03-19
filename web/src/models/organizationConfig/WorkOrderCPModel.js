/** 计划工单自定义字段 view model */
class WorkOrderCPModel {
  /** 字段列表 */
  properties = [];
  /** 编辑字段列表 */
  editProperties = [];

  static of() {
    const o = new WorkOrderCPModel();
    return o;
  }

  get fields() {
    if (!Array.isArray(this.properties)) return [];
    const _fields = [];
    this.properties.forEach(property => {
      const { name, maxLen } = property;
      const field = {
        name,
        maxLen,
      };
      _fields.push(field);
    });
    return _fields;
  }

  getCustomPropertyDTO(formValue) {
    if (Array.isArray(formValue) && Array.isArray(this.properties)) {
      for (const formItem of formValue) {
        for (const property of this.properties) {
          const { id, name } = property;
          if (formItem.name === name) {
            formItem.id = id;
            break;
          }
        }
      }
    }
    return formValue;
  }
}

export default WorkOrderCPModel;
