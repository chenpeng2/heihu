import React, { Component } from 'react';
import _ from 'lodash';

import { Input, withForm, InputNumber, FormItem, Form, Select } from 'src/components';
import { checkStringLength, amountValidator } from 'src/components/form';
import { getTypeList } from 'src/services/knowledgeBase/exceptionalEvent';
import SearchSelect from 'src/components/select/searchSelect';
import { externalSearch } from 'src/containers/exceptionalEvent/subscribeManageList/util';
import WorkstationSelect from 'src/components/select/workstationSelect';
import { getOrganizationConfigFromLocalStorage, ORGANIZATION_CONFIG } from 'src/utils/organizationConfig';

export const formatWorkstation = value => {
  if (!value) return null;

  return value.map(id => {
    return {
      facilityId: id,
    };
  });
};

const COMMON_SHORT_FORM_ITEM_WIDTH = 100;
const COMMON_LONG_FORM_ITEM_WIDTH = 310;

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

    if (nextInitialValue && !_.isEqual(nowInitialValue, nextInitialValue)) {
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
    const { form } = this.props;
    const { getFieldDecorator } = form;

    const config = getOrganizationConfigFromLocalStorage();
    const maxSubscribeLevel =
      config && config[ORGANIZATION_CONFIG.maxSubscribeLevel]
        ? config[ORGANIZATION_CONFIG.maxSubscribeLevel].configValue
        : 3;

    return (
      <Form>
        <FormItem label={'用户／用户组'} style={formItemStyle}>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                message: '用户／用户组必填',
              },
              {
                validator: checkStringLength(20),
              },
            ],
          })(<SearchSelect extraSearch={externalSearch} style={{ width: COMMON_LONG_FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'报告等级'} style={formItemStyle}>
          {getFieldDecorator('sendLevel', {
            rules: [
              {
                required: true,
                message: '报告等级必填',
              },
              {
                validator: amountValidator(Number(maxSubscribeLevel), 1, null, null, '报告等级'),
              },
            ],
          })(<InputNumber style={{ width: COMMON_SHORT_FORM_ITEM_WIDTH }} placeholder={'请填写'} />)}
        </FormItem>
        <FormItem label={'订阅等级'} style={formItemStyle}>
          {getFieldDecorator('subscribeLevel', {
            rules: [
              {
                required: true,
                message: '订阅等级必填',
              },
              {
                validator: (rule, value, cb) => {
                  if (value === '不订阅') cb();
                  amountValidator(Number(maxSubscribeLevel), 0, null, null, '订阅等级')(rule, value, cb);
                },
              },
            ],
            normalize: value => {
              if (value === '0') return '不订阅';
              return value;
            },
          })(<Input style={{ width: COMMON_SHORT_FORM_ITEM_WIDTH }} />)}
        </FormItem>
        <FormItem label={'订阅事件类型'} style={formItemStyle}>
          {getFieldDecorator('subscribeCategoryIds')(
            <Select style={{ width: COMMON_LONG_FORM_ITEM_WIDTH }} mode={'multiple'} placeholder={'请选择'}>
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
        <FormItem label={'订阅设施范围'} style={formItemStyle}>
          {getFieldDecorator('subscribeScope')(
            <WorkstationSelect multiple style={{ width: COMMON_LONG_FORM_ITEM_WIDTH }} placeholder={'请选择'} />,
          )}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({}, BaseForm);
