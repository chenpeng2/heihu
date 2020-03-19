// 批量修改物料
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withForm, Form, FormItem, InputNumber, Radio, FormattedMessage } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { amountValidator, requiredRule } from 'src/components/form';
import { fontSub } from 'src/styles/color';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

import MaterialPercentage from './materialPercentage';

const INPUT_WIDTH = 300;

class BatchUpdateMaterial extends Component {
  state = {};

  submit = value => {
    const { onOk } = this.props;
    if (typeof onOk === 'function') onOk(value);
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return (
      <Form>
        <FormItem label={'待修改物料'}>
          {getFieldDecorator('materialsNeedToChange', {
            rules: [
              {
                required: true,
                message: <FormattedMessage defaultMessage={'待修改物料必选'} />,
              },
            ],
            onChange: value => {
              this.setState({ materialsNeedToChange: value }, () => {
                if (this.state.materialsAfterToChange) {
                  form.validateFields(['materialsAfterChange'], { force: true });
                }
              });
            },
          })(<SearchSelect params={{ status: 1 }} type={'materialBySearch'} style={{ width: INPUT_WIDTH }} />)}
        </FormItem>
        <FormItem label={'修改后物料'}>
          {getFieldDecorator('materialsAfterChange', {
            onChange: value => {
              this.setState({ materialsAfterToChange: value });
            },
            rules: [
              {
                required: true,
                message: <FormattedMessage defaultMessage={'修改后物料必选'} />,
              },
              {
                validator: (rule, value, callback) => {
                  const { materialsNeedToChange } = this.state;
                  if (value && materialsNeedToChange && materialsNeedToChange.key === value.key) {
                    callback(changeChineseToLocaleWithoutIntl('待修改物料和修改后物料不可以是同一种物料'));
                  }
                  callback();
                },
              },
            ],
          })(<SearchSelect params={{ status: 1 }} type={'materialBySearch'} style={{ width: INPUT_WIDTH }} />)}
        </FormItem>
        <FormItem label={'修改后物料损耗率'}>
          {getFieldDecorator('rate', {
            rules: [
              requiredRule('修改后物料损耗率'),
              {
                validator: amountValidator(100, 0),
              },
            ],
          })(<InputNumber />)}
          <span style={{ marginLeft: 10 }}>%</span>
        </FormItem>
        <FormItem label={'物料比例'}>
          <MaterialPercentage form={form} />
        </FormItem>
        <FormItem label={'是否生成新版本'}>
          {getFieldDecorator('generateNewVersion', {
            rules: [
              {
                required: true,
                message: <FormattedMessage defaultMessage={'是否生成新版本必选'} />,
              },
            ],
          })(<Radio.TrueFalseRadio />)}
          <div style={{ color: fontSub }}>
            <FormattedMessage defaultMessage={'选择「是」后需要为修改的每一个物料清单和生产BOM填写新的版本号'} />
          </div>
        </FormItem>
      </Form>
    );
  }
}

BatchUpdateMaterial.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  onOk: PropTypes.func,
};

export default withForm({ showFooter: true }, BatchUpdateMaterial);
