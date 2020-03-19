import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { withForm, InputNumber, Icon, FormItem, Form, Input, Select } from 'src/components';
import { checkStringLength } from 'src/components/form';
import { PRIORITY } from 'src/containers/exceptionalEvent/constant';
import { getTypeList, getTypeDetail } from 'src/services/knowledgeBase/exceptionalEvent';

const COMMON_FORMITEM_WIDTH = 100;
const formItemStyle = {
  width: 500,
  margin: 'auto',
  paddingRight: 0,
};

type Props = {
  disabled: boolean,
  form: {},
  initialValue: {},
};

class BaseForm extends Component {
  props: Props;
  state = {
    typeList: null,
  };

  componentWillReceiveProps(nextProps) {
    const { initialValue: nowInitialValue, form } = this.props;
    const { initialValue: nextInitialValue } = nextProps;

    if (!_.isEqual(nowInitialValue, nextInitialValue)) {
      form.setFieldsValue(nextInitialValue);
    }
  }

  componentDidMount() {
    getTypeList().then(res => {
      const data = _.get(res, 'data.data');

      this.setState({
        typeList: data,
      });
    });
  }

  render() {
    const { typeList } = this.state;
    const { form, initialValue } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, setFieldsValue } = form;

    // 内置主题不可编辑名称
    const { internal } = initialValue || {};

    return (
      <Form>
        <FormItem label={'主题名称'} style={formItemStyle}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '名称必填',
              },
              {
                validator: checkStringLength(60, 4),
              },
            ],
          })(<Input disabled={internal} style={{ width: 310 }} />)}
        </FormItem>
        <FormItem label={'事件类型'} style={formItemStyle}>
          {getFieldDecorator('type', {
            rules: [
              {
                required: true,
                message: '事件类型必须',
              },
            ],
            onChange: value => {
              getTypeDetail(value).then(res => {
                const data = _.get(res, 'data.data');
                const { priority, overdueTimeout } = data || {};

                setFieldsValue({
                  priority: typeof priority === 'number' ? priority.toString() : priority,
                  overdueDate: overdueTimeout,
                });
              });
            },
          })(
            <Select disabled={internal} style={{ width: 310 }}>
              {Array.isArray(typeList)
                ? typeList.map(({ id, name }) => {
                    return (
                      <Select.Option value={id} key={id}>
                        {name}
                      </Select.Option>
                    );
                  })
                : null}
            </Select>,
          )}
        </FormItem>
        <FormItem label={'默认重要性'} style={formItemStyle}>
          {getFieldDecorator('priority', {
            rules: [
              {
                required: true,
                message: '重要性必填',
              },
            ],
            initialValue: '0',
          })(
            <Select style={{ width: COMMON_FORMITEM_WIDTH }}>
              {Object.entries(PRIORITY).map(([value, options]) => {
                const { display, iconType, iconColor } = options;

                return (
                  <Select.Option value={value}>
                    <Icon iconType={'gc'} type={iconType} style={{ color: iconColor }} />
                    {changeChineseToLocale(display)}
                  </Select.Option>
                );
              })}
            </Select>,
          )}
        </FormItem>
        <FormItem label={'默认逾期时间'} style={formItemStyle}>
          {getFieldDecorator('overdueDate', {
            rules: [
              {
                required: true,
                message: '默认逾期时间必填',
              },
            ],
            initialValue: 0,
          })(<InputNumber style={{ width: COMMON_FORMITEM_WIDTH }} />)}
          <span style={{ marginLeft: 10 }}>{changeChineseToLocale('分钟')}</span>
        </FormItem>
      </Form>
    );
  }
}

BaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, BaseForm);
