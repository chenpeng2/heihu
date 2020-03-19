import React, { Component } from 'react';
import { Form, Button } from 'antd';
import message from 'components/message';
import Spin from 'components/spin';
import classNames from 'classnames';
import _ from 'lodash';
import { Text } from 'src/components';

import { isFraction, fraction } from 'src/utils/number';
import mathJs from 'src/utils/mathjs';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { setFieldsValue } from './utils';
import { MaxDigits } from '../../constants';
import styles from './index.scss';
import rules from './utils/rules';
import CustomFields from './customFields';

export { CustomFields };

// export Item from './item';

export const formItemLayoutShort = {
  labelCol: { span: 6 },
  wrapperCol: { span: 8 },
};
export const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
export const formItemLayoutForLgTask = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};
export const formItemLayoutForModal = {
  labelCol: { span: 4 },
  wrapperCol: { span: 24 },
};
export const formItemLayoutForFilter = {
  labelCol: { span: 6 },
  wrapperCol: { span: 22 },
};

// 只能由中文、英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成
// TODO: 改名字
export const reg1 = /^[\w\s\*\u00b7\_\/\.\-\uff08\uff09\&\(\)\u4e00-\u9fa5]+$/;

// 只能由中文，英文和数字组成
export const CHINESE_ENGLISH_NUMBER_REG = /^[a-zA-Z0-9\u4e00-\u9fa5]+$/;

// form验证的基本函数
// reg 正则表达式。必填
// errorMsg 错误信息
export const baseValidate = (reg, errorMsg) => {
  if (!reg) return;
  return (rule, value, callback) => {
    if (!reg.test(value)) {
      callback(changeChineseToLocaleWithoutIntl(errorMsg || '错误'));
      return;
    }
    callback();
  };
};

// amount验证, 默认判断 value > min && value <= max
// type有integer（整数）, fraction（分数）两种情况。
export const amountValidator = (max, min, type, maxDigtis = MaxDigits, name) => {
  return (rule, value, callback) => {
    let maxJudge = max;
    let minJudge = min;

    if (value === null || value === undefined || value === '') {
      callback();
      return;
    }

    const defaultName = changeChineseToLocaleWithoutIntl('数字');
    const getMaxMessage = (name, max) => {
      return changeChineseToLocaleWithoutIntl('{name}必需小于等于{maxSize}', {
        name: name || defaultName,
        maxSize: max,
      });
    };
    const getMustBiggerThanZeroMessage = name => {
      return changeChineseToLocaleWithoutIntl('{name}必需大于0', {
        name: name || defaultName,
      });
    };
    const getMinMessage = (name, min) => {
      return changeChineseToLocaleWithoutIntl('{name}必需大于等于{min}', {
        name: name || defaultName,
        min,
      });
    };

    // 整数的时候。当没有指定type的时候默认可以支持小数，但不支持分数
    if (!type || type === 'integer') {
      const reg = /^(\-)?\d+(\.\d+)?$/;
      if (!maxJudge && typeof maxJudge !== 'number') {
        maxJudge = {
          value: Number.MAX_SAFE_INTEGER,
          message: getMaxMessage(name, Number.MAX_SAFE_INTEGER),
        };
      } else if (reg.test(max)) {
        maxJudge = {
          value: max,
          equal: true,
          message: getMaxMessage(name, max),
        };
      }
      if (!minJudge && typeof minJudge !== 'number') {
        minJudge = {
          value: 0,
          equal: false,
          message: getMustBiggerThanZeroMessage(name),
        };
      } else if (reg.test(min)) {
        minJudge = {
          value: min,
          equal: true,
          message: getMinMessage(name, min),
        };
      }

      // 小数部分
      const decimalPart = value && value.toString().split('.')[1];

      if (!reg.test(value)) {
        callback(changeChineseToLocaleWithoutIntl('数字格式不正确'));
      } else if (maxDigtis && !type && decimalPart && decimalPart.length > maxDigtis) {
        /* 检查输入的数字小数点后是否多于三位 */
        callback(new Error(changeChineseToLocaleWithoutIntl('小数点后最多保留{amount}位数字', { amount: maxDigtis })));
      }
      if ((value === minJudge.value && !minJudge.equal) || value < minJudge.value) {
        callback(minJudge.message);
      } else if ((value === maxJudge.value && !maxJudge.equal) || value > maxJudge.value) {
        callback(maxJudge.message);
      }

      // 在这个地方还有这个type的判断。是因为没有指定type的时候也走上面的逻辑
      if (type === 'integer') {
        // 使用input的时候。value是string。使用inputNumber的时候value是number
        if (
          (typeof value === 'number' && !Number.isInteger(value)) ||
          (typeof value === 'string' && value.indexOf('.') !== -1)
        ) {
          callback(new Error(changeChineseToLocaleWithoutIntl('必须是整数')));
        }
      }
    }

    // 分数的时候。分数时分子和分母不支持小数
    if (type === 'fraction') {
      // 分数的时候。之所以不将小数和分数的格式分开。是因为有分数的情况下必然要支持小数
      const reg = /^(\-)?\d+((\.||\/)\d+)?$/;

      // max和min是object也是可行的
      if (!max && typeof max !== 'number') {
        // 如果没有指定max
        maxJudge = {
          value: Number.MAX_SAFE_INTEGER,
          message: getMaxMessage(name, Number.MAX_SAFE_INTEGER),
        };
      } else if (reg.test(max)) {
        // max，min必须是整数，分数或者小数中的一种
        maxJudge = {
          value: max,
          equal: true,
          message: getMaxMessage(name, max),
        };
      }

      if (!min && typeof min !== 'number') {
        minJudge = {
          value: 0,
          equal: false,
          message: getMustBiggerThanZeroMessage(name),
        };
      } else if (reg.test(min)) {
        minJudge = {
          value: min,
          equal: true,
          message: getMinMessage(name, min),
        };
      }

      if (!reg.test(value)) {
        callback(changeChineseToLocaleWithoutIntl('数字格式不正确'));
      } else if (isFraction(value)) {
        // 分数的时候需要确定分母大于0
        const values = value.split('/');
        const denominator = values[1];
        const numerator = values[0];

        if (!denominator || denominator === '0') {
          callback(changeChineseToLocaleWithoutIntl('分母必须大于0'));
        }

        const backendMax = 100000000; // 后端可以支持的最大的分子和分母
        if (denominator && Number(denominator) > backendMax) {
          callback(changeChineseToLocaleWithoutIntl('分母不可以大于{amount}', { amount: backendMax }));
        }
        if (numerator && Number(numerator) > backendMax) {
          callback(changeChineseToLocaleWithoutIntl('分子不可以大于{amount}', { amount: backendMax }));
        }
      }

      // 小数位数检查
      if (value && value.toString().indexOf('.') !== -1) {
        const decimalPart = value.toString().split('.')[1];
        if (maxDigtis && decimalPart && decimalPart.length > maxDigtis) {
          callback(
            new Error(changeChineseToLocaleWithoutIntl('小数点后最多保留{amount}位数字', { amount: maxDigtis })),
          );
        }
      }
      if (
        reg.test(value) &&
        ((mathJs.equal(fraction(value), fraction(minJudge.value)) && !minJudge.equal) ||
          mathJs.smaller(fraction(value), fraction(minJudge.value)))
      ) {
        callback(minJudge.message);
      } else if (
        reg.test(value) &&
        ((mathJs.equal(fraction(value), fraction(maxJudge.value)) && !maxJudge.equal) ||
          mathJs.larger(fraction(value), fraction(maxJudge.value)))
      ) {
        callback(maxJudge.message);
      }
    }

    callback();
  };
};

// 0或正整数验证
export const checkPositiveInteger = () => {
  return (rule, value, callback) => {
    const reg = /^\d+$/;
    if (!reg.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('必须是0或正整数'));
    }
    callback();
  };
};

// 正整数验证
export const checkPositiveIntegerWithoutZero = () => {
  return (rule, value, callback) => {
    const reg = /^[1-9]\d*$/;
    if (!reg.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('必须是正整数'));
    }
    callback();
  };
};

// 验证编号
export const codeFormat = type => {
  return (rule, value, callback) => {
    const re = /[\u4e00-\u9fa5]|\s/g;
    if (re.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('{type}只能由英文字母、数字、符号组成', { type }));
    }
    callback();
  };
};

// 汉字检查
export const chineseFormat = type => {
  return (rule, value, callback) => {
    const reg = /[^\u4e00-\u9fa5]/;
    if (reg.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('{type}只能由汉字组成', { type }));
    }
    callback();
  };
};

// 二维码
export const qrCodeFormat = type => {
  return (rule, value, callback) => {
    if (!value) {
      callback();
    } else {
      const re = /^[a-zA-Z0-9-\u4e00-\u9fa5]+$/;
      if (!re.test(value)) {
        callback(changeChineseToLocaleWithoutIntl('{type}不能包含空格和特殊字符', { type }));
      }
      callback();
    }
  };
};

// 验证订单号(I)
export const orderNumberFormat = type => {
  return (rule, value, callback) => {
    const re = /^[a-zA-Z0-9-]+$/;
    if (!value) {
      callback();
    }
    if (!re.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('{type}只能由英文、数字、-组成', { type }));
    }
    callback();
  };
};

// 验证订单号(II)
export const orderNumberFormatII = type => {
  return (rule, value, callback) => {
    const re = /^[a-zA-Z0-9]+$/;
    if (!value) {
      callback();
    }
    if (!re.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('{type}只能由英文字母、数字组成', { type }));
    }
    callback();
  };
};

// 英文，数字，-，_
export const validateRule1 = type => {
  return (rule, value, callback) => {
    const re = /^[a-zA-Z0-9-_]+$/;
    if (!value) {
      callback();
    }
    if (!re.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('{type}只能由英文字母、数字、-、_组成', { type }));
    }
    callback();
  };
};

export const nullCharacterVerification = type => (rule, value, callback) => {
  const reg = /\s/g;
  if (reg.test(value)) {
    callback(changeChineseToLocaleWithoutIntl('{type}不能包含空字符', { type }));
  }
  callback();
};

export const dotValidator = name => (rule, value, callback) => {
  const reg = /\./g;
  if (reg.test(value)) {
    callback(changeChineseToLocaleWithoutIntl('{name}不能包含.', { name }));
  }
  callback();
};

// 验证string的长度，默认最大是50
export const checkStringLength = (max = 50, min) => {
  return (rule, value, callback) => {
    if (min && value && value.length < min) {
      const msg = changeChineseToLocaleWithoutIntl('最少输入{amount}个字符', { amount: min });
      callback(new Error(msg));
    }

    // 超出检查
    const diff = value ? value.length - max : 0;
    if (diff > 0) {
      const msg = changeChineseToLocaleWithoutIntl('最多可输入{max}个字符，已超出{diff}个字符', { max, diff });
      callback(new Error(msg));
    }
    callback();
  };
};

// 验证输入的email地址是否满足 string@string.string.string 的格式
export const emailValidator = type => {
  return (rule, value, callback) => {
    const reg = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
    if (!reg.test(value) && value) {
      callback(changeChineseToLocaleWithoutIntl('请输入正确的{type}格式', { type }));
    }
    callback();
  };
};

// 电话验证
export const telValidator = type => {
  return (rule, value, callback) => {
    const telReg = /^(([0\+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
    // const phoneReg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
    const phoneReg = /^1\d{10}$/;
    if (!telReg.test(value) && !phoneReg.test(value) && value) {
      callback(changeChineseToLocaleWithoutIntl('请输入正确的{type}格式（区号-电话号码/手机号）', { type }));
    }
    callback();
  };
};

// 输入值不可是以空格开头的值，用在normalize上
export const trimValue = (value, preValue) => {
  if (preValue) {
    return value;
  }
  if (typeof value === 'string') {
    return value && value.trim();
  }
  return value;
};

export const trimWholeValue = (value, prevValue, allValues) => {
  if (typeof value === 'string') {
    return value && value.trim();
  }
  return value;
};

// 前后是否出现空格
export const checkTwoSidesTrim = name => {
  return (rule, value, cb) => {
    if (_.startsWith(value, ' ') || _.endsWith(value, ' ')) {
      cb(changeChineseToLocaleWithoutIntl('{name}前后不可包含空格', { name }));
      return;
    }
    cb();
  };
};

export const chineseValidator = name => {
  return (rule, value, cb) => {
    const reg = /^[^\u4e00-\u9fa5]*$/;
    if (!reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}不可以包含中文', { name }));
      return;
    }
    cb();
  };
};

export const specialCharacterValidator = name => {
  return (rule, value, cb) => {
    const reg = /^[^\\\/\?\%\\#*]*$/;
    if (!reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}不可以包含\\, #, /, ?, %, *特殊字符', { name }));
      return;
    }
    cb();
  };
};

// 目前可以支持的最大限度的特殊字符
// 开始结束位置不能有特殊字符。
// 中间不可以有\,?,%
export const supportSpecialCharacterValidator = name => {
  return (rule, value, cb) => {
    const reg = /^\/+[\s\S]*$|^[\s\S]*\/$/;

    if (reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}不可以用/开头结尾', { name }));
      return;
    }

    const reg1 = /[\\\?\%]+/;
    if (reg1.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}不可以包含\\，?，%', { name }));
      return;
    }

    cb();
  };
};

export const QcItemsGroupValidator = name => {
  return (rule, value, cb) => {
    const reg = /^[-_,/ a-zA-Z0-9\u4e00-\u9fa5]*$/;
    if (!reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}只能包含-_,/空格特殊字符', { name }));
      return;
    }
    cb();
  };
};

export const QcItemsValidator = name => {
  return (rule, value, cb) => {
    const reg = /^[\*\s\&·Ω℃%>~.\-:=\'\"_/a-zA-Z0-9\u4e00-\u9fa5\uff08\uff09()\&]*$/;
    if (!reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}只能包含-_/Ω℃.%>~:=\'"*·,中文括号,英文括号,&,空格特殊字符', { name }));
      return;
    }
    cb();
  };
};

export const lengthValidate = (min, max) => {
  return (rule, value, cb) => {
    const length = value && value.toString().length;
    if (length) {
      if (min && length < min) {
        cb(changeChineseToLocaleWithoutIntl('不能小于{min}位', { min }));
      } else if (max && length > max) {
        cb(changeChineseToLocaleWithoutIntl('不能大于{max}位', { max }));
      }
    }
    cb();
  };
};

// 密码校验
export const passwordValidate = name => {
  return (rule, value, cb) => {
    const reg = /^[A-Za-z0-9]+$/;
    if (!reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{type}只能由英文字母、数字组成', { type: name }));
      return;
    }
    cb();
  };
};

// 编码限制不能以「/」开头结尾（用于当code需要放在url里做跳转）
export const codeInUrlValidator = name => {
  return (rule, value, cb) => {
    const regStart = /^\/.*$/;
    const regEnd = /^.*\/$/;
    if (regStart.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}不可以用/开头结尾', { name }));
      return;
    }
    if (regEnd.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}不可以用/开头结尾', { name }));
      return;
    }
    cb();
  };
};

// 账号校验
export const usernameValidator = type => {
  return (rule, value, callback) => {
    const re = /^[a-zA-Z0-9_]+$/;
    if (value && !re.test(value)) {
      callback(changeChineseToLocaleWithoutIntl('{type}只能由英文字母、数字、_组成', { type }));
    }
    callback();
  };
};

// 姓名校验
export const nameValidator = name => {
  return (rule, value, cb) => {
    const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+$/;
    // const reg2 = /[^\u4e00-\u9fa5]/;
    if (value && !reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}只能包含数字、英文及汉字', { name }));
      return;
    }
    cb();
  };
};

// 名称校验(II)
export const nameValidatorII = name => {
  return (rule, value, cb) => {
    const reg = /^[A-Za-z0-9-\u4e00-\u9fa5]+$/;
    if (value && !reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}只能包含-、数字、英文及汉字', { name }));
      return;
    }
    cb();
  };
};

// 设备相关编号统一校验
export const equipCodeFormat = name => {
  return (rule, value, cb) => {
    const reg = /^[A-Za-z0-9/*\-_#]+$/;
    if (value && !reg.test(value)) {
      cb(changeChineseToLocaleWithoutIntl('{name}只能包含/*-_#、大小写字母、数字', { name }));
      return;
    }
    cb();
  };
};
export const requiredRule = name => ({
  required: true,
  message: `${changeChineseToLocaleWithoutIntl(name)} ${changeChineseToLocaleWithoutIntl('不能为空')}！`,
});

type Props = {
  form: any,
  style: any,
  onCancel: Function,
  onClose: ?() => void,
  onSuccess: ?() => void,
  onSubmit: ?() => void,
  renderFooter: ?() => React.element,
};

export const FormItem = props => <Form.Item colon={false} {...props} />;

const withForm = (options, WrappedComponent) => {
  const { showFooter, footerClassName, style: optionStyle, hideCancel, className, ...otherOptions } = options;
  const text = options.text || '完成';
  class WithFormComponent extends Component {
    props: Props;

    state = {
      loading: false,
    };

    getSubmitValue = () => {
      let value = {};
      this.props.form.validateFields((err, values) => {
        if (!err) {
          value = values;
        }
      });
      return value;
    };

    submit = () => {
      const { form, onClose, onSuccess, onSubmit } = this.props;
      const wrappedInstanceSubmit = this && this.wrappedInstance && this.wrappedInstance.submit;
      let result;
      form.validateFieldsAndScroll((err, val) => {
        // 在之后的流程中 val 会被改变导致不能调用 moment 的一些方法，所以先复制出一份
        const values = _.cloneDeep(val);
        if (!err) {
          // 如果传入onSubmit, 则使用传入的submit方法
          if (onSubmit) {
            result = onSubmit(values);
            if (onClose) {
              onClose();
            }
          } else if (wrappedInstanceSubmit) {
            this.setState({ loading: true });
            // WrappedComponent的submit需要return一个promise函数
            result = this.wrappedInstance.submit(values);
            if (!result) {
              this.setState({ loading: false });
              onClose();
              return;
            }
            try {
              result
                .then(() => {
                  // 公共的success部分
                  this.setState({ loading: false });
                  if (onSuccess) {
                    onSuccess();
                  }
                  if (onClose) {
                    onClose();
                  }
                })
                .catch(err => {
                  if (typeof err === 'string') {
                    message.error(err);
                  } else {
                    global.log.error(err);
                  }
                  this.setState({ loading: false });
                });
            } catch (e) {
              // no Promise
              this.setState({ loading: false });
              if (onSuccess) {
                onSuccess();
              }
              if (onClose) {
                onClose();
              }
            }
          }
        }
      });
      return result;
    };

    add = () => {
      const { form } = this.props;
      let keys = form.getFieldValue('keys');
      if (keys.length) {
        keys = keys.concat(keys[keys.length - 1] + 1);
      } else {
        keys.push(0);
      }
      form.setFieldsValue({ keys });
    };

    remove = k => {
      const { form } = this.props;
      let keys = form.getFieldValue('keys');
      keys = keys.filter(key => {
        return key !== k;
      });
      form.setFieldsValue({
        keys,
      });
    };

    clear = () => {
      const { form } = this.props;
      form.resetFields();
    };

    render() {
      // maxHeight是通过modal传入的content的最大高度
      const { style, ...rest } = this.props;
      const { onCancel, onClose, renderFooter, onSuccess } = this.props;
      const form = this.props.form;
      form.addField = this.add;
      form.removeField = this.remove;
      form.clearFields = this.clear;

      const _style = { ...style, ...optionStyle };
      if (_style && _style.maxHeight && showFooter) {
        _style.maxHeight -= 62;
      }

      return (
        <Spin spinning={this.state.loading}>
          <div className={className || 'modal-body-form'} style={_style}>
            <WrappedComponent
              {...rest}
              onSubmit={() => this.submit()}
              onSuccess={onSuccess}
              form={{
                ...form,
                setFieldsValue: setFieldsValue(form),
              }}
              ref={e => {
                if (e) {
                  this.wrappedInstance = e;
                }
                // 外层可以通过getRef函数获得form实例
              }}
              add={() => this.add()}
              remove={k => this.remove(k)}
            />
          </div>
          {showFooter ? (
            <div className={classNames(styles.footer, footerClassName)}>
              {renderFooter
                ? renderFooter({ onSubmit: this.submit, onClose })
                : onCancel &&
                  !hideCancel && (
                    <Button type="ghost" onClick={() => onCancel()} className={styles.footerButton}>
                      <Text>取消</Text>
                    </Button>
                  )}
              <Button type="primary" onClick={() => this.submit()} className={styles.footerButton}>
                <Text>{text}</Text>
              </Button>
            </div>
          ) : null}
        </Spin>
      );
    }
  }
  return Form.create({ ...otherOptions })(WithFormComponent);
};

export const defaultGetValueFromEvent = e => {
  if (!e || !e.target) {
    return e;
  }
  const { target } = e;
  return target.type === 'checkbox' ? target.checked : target.value;
};
withForm.rules = rules;

export default withForm;
