export const validateRule1 = type => {
  return (rule, value, callback) => {
    const re = /^[a-zA-Z0-9-_]+$/;
    if (!value) {
      callback();
    }
    if (!re.test(value)) {
      callback(`${type}只能由英文字母、数字、-、_组成`);
    }
    callback();
  };
};

const required = name => ({ required: true, message: `${name}不能为空！` });

export const SOPCodeRule = [required('编号'), validateRule1('编号'), { max: 50, message: '编号长度不超过50' }];
