import { message } from 'antd';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';

/**
 * @api {message} message.
 * @APIGroup message.
 * @apiExample {js} Example usage:
 * 其他详情见antd的message
 */

const { error, info, success, loading, warn, warning, ...rest } = message;

const intlFn = (content, duration, onClose, fn) => {
  if (typeof content === 'string') {
    const str = changeChineseToLocaleWithoutIntl(content);
    return fn(str, duration, onClose);
  }
  return fn(content, duration, onClose);
};

export default {
  error: (content, duration, onClose) => intlFn(content, duration, onClose, error),
  info: (content, duration, onClose) => intlFn(content, duration, onClose, info),
  success: (content, duration, onClose) => intlFn(content, duration, onClose, success),
  loading: (content, duration, onClose) => intlFn(content, duration, onClose, loading),
  warn: (content, duration, onClose) => intlFn(content, duration, onClose, warn),
  warning: (content, duration, onClose) => intlFn(content, duration, onClose, warning),
  ...rest,
};
