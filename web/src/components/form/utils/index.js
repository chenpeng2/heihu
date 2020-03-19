export const setFieldsValue = form => value => {
  const formFields = Object.keys(form.getFieldsValue());
  Object.keys(value).forEach(key => {
    // 是否被 getFieldsDecotor 过
    if (value[key] !== null && value[key] !== undefined && formFields.includes(key)) {
      form.setFieldsValue({
        [key]: value[key],
      });
    }
  });
};

export default 'x';
