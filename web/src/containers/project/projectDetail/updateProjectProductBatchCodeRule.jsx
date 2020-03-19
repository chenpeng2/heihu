// 更新项目的生成批次规则
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { message, Button, withForm, Form, FormItem } from 'src/components';
import ProductBatchCodeRuleSelect from 'src/containers/productBatchCodeRule/base/productBatchCodeRuleSelect';
import { updateProjectProductBatchCodeRule } from 'src/services/cooperate/project';

class UpdateProjectBatchCodeRule extends Component {
  state = {};

  renderFooter = () => {
    const { onCancel, onClose, form, projectCode, cbForUpdateSuccess } = this.props;
    const buttonStyle = {
      width: 180,
      display: 'inline-block',
    };

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <Button
          type="default"
          onClick={() => {
            if (typeof onCancel === 'function') {
              onCancel();
            }
          }}
          style={{ ...buttonStyle, marginRight: 20 }}
        >
          {'取消'}
        </Button>
        <Button
          onClick={() => {
            form.validateFieldsAndScroll((err, value) => {
              if (err) return null;
              if (!projectCode) return null;

              const ruleId = _.get(value, 'rule.key');

              updateProjectProductBatchCodeRule(projectCode, ruleId).then(() => {
                message.success('更新项目的批次号规则成功');
                if (typeof cbForUpdateSuccess === 'function') {
                  cbForUpdateSuccess();
                }
                if (typeof onClose === 'function') {
                  onClose();
                }
              });
            });
          }}
          style={buttonStyle}
        >
          {'确定'}
        </Button>
      </div>
    );
  };

  render() {
    const { form, initialData } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div style={{ width: '100%' }}>
        <Form>
          <FormItem label={'规则'}>
            {getFieldDecorator('rule', {
              initialValue: initialData ? { key: initialData.ruleId, label: initialData.ruleName } : undefined,
              rules: [
                {
                  required: true,
                  message: '规则必选',
                },
              ],
            })(<ProductBatchCodeRuleSelect style={{ margin: 'auto', width: 300 }} />)}
          </FormItem>
        </Form>
        <div>{this.renderFooter()}</div>
      </div>
    );
  }
}

UpdateProjectBatchCodeRule.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  onCancel: PropTypes.any,
  onClose: PropTypes.any,
  projectCode: PropTypes.string,
  cbForUpdateSuccess: PropTypes.any,
  initialData: PropTypes.any,
};

export default withForm({ showFooter: false }, UpdateProjectBatchCodeRule);
