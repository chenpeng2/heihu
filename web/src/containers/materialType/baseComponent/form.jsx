// 物料类型的表单
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Radio, withForm, FormItem, Form, Input, FormattedMessage } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { lengthValidate, checkTwoSidesTrim, requiredRule } from 'src/components/form';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';

import { MATERIAL_TYPE_STATUS } from '../utils';

// 验证
const codeValidate = type => {
  return (rule, value, callback) => {
    const re = /^[\w\s\*\u00b7\_\/\.\-\uff08\uff09\&\(\)]+$/;
    if (!re.test(value)) {
      callback(
        changeChineseToLocaleWithoutIntl('{type}只能由英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成', { type }),
      );
    }
    callback();
  };
};

const nameValidate = type => {
  return (rule, value, callback) => {
    const re = /^[\w\s\*\u00b7\_\/\.\-\uff08\uff09\&\(\)\u4e00-\u9fa5]+$/;
    if (!re.test(value)) {
      callback(
        changeChineseToLocaleWithoutIntl('{type}只能由中文、英文字母、数字、*·_ /-.,中文括号,英文括号,&,空格组成', {
          type,
        }),
      );
    }
    callback();
  };
};

const RadioGroup = Radio.Group;
const FORM_ITEM_WIDTH = 300;

class MaterialTypeForm extends Component {
  state = {};

  componentDidMount() {
    this.setInitialValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialValue, form, isEdit } = props || this.props;
    if (isEdit && initialValue) {
      const { processRouting, code, name, status } = initialValue || {};
      const { code: processRouteCode, name: processRouteName } = processRouting || {};
      form.setFieldsValue({
        code,
        name,
        status,
        processRoute:
          processRouteCode && processRouteName
            ? { key: processRouteCode, label: `${processRouteCode}/${processRouteName}` }
            : undefined,
      });
    }
  };

  getFormValue = () => {
    const { form } = this.props;
    const { validateFieldsAndScroll } = form || {};

    let res = null;
    if (typeof validateFieldsAndScroll === 'function') {
      validateFieldsAndScroll((err, value) => {
        if (err) return null;
        res = value;
      });
    }

    return res;
  };

  render() {
    const { form, isEdit } = this.props;
    const { getFieldDecorator } = form || {};

    return (
      <div>
        <Form>
          <FormItem label={'编号'}>
            {getFieldDecorator('code', {
              rules: [
                requiredRule('编号'),
                {
                  validator: lengthValidate(0, 20),
                },
                {
                  validator: codeValidate('编号'),
                },
                {
                  validator: checkTwoSidesTrim('编号'),
                },
              ],
            })(<Input style={{ width: FORM_ITEM_WIDTH }} disabled={isEdit} />)}
          </FormItem>
          <FormItem label={'名称'}>
            {getFieldDecorator('name', {
              rules: [
                requiredRule('名称'),
                {
                  validator: lengthValidate(0, 50),
                },
                {
                  validator: nameValidate('名称'),
                },
                {
                  validator: checkTwoSidesTrim('名称'),
                },
              ],
            })(<Input style={{ width: FORM_ITEM_WIDTH }} />)}
          </FormItem>
          <FormItem label={'状态'}>
            {getFieldDecorator('status', {
              rules: [
                {
                  required: true,
                  message: <FormattedMessage defaultMessage={'状态必选'} />,
                },
              ],
            })(
              <RadioGroup disabled={isEdit}>
                {Object.values(MATERIAL_TYPE_STATUS).map(i => {
                  const { name, value } = i || {};
                  return <Radio value={value}>{name}</Radio>;
                })}
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={'默认工艺路线'}>
            {getFieldDecorator('processRoute')(
              <SearchSelect params={{ status: 1 }} style={{ width: FORM_ITEM_WIDTH }} type={'processRouting'} />,
            )}
          </FormItem>
        </Form>
      </div>
    );
  }
}

MaterialTypeForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  isEdit: PropTypes.bool,
  initialValue: PropTypes.any,
};

export default withForm({}, MaterialTypeForm);
