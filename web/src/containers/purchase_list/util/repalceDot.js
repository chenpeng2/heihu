// 用于替换materialCode中的.。因为rc-form不允许name中有.
export const replaceDot = (str) => {
  if (!str) return;

  return str.replace(/\./g, String.fromCharCode(127));
};

export default 'dummy';
