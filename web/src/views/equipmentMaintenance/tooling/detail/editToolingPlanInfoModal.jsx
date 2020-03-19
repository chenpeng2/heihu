import React, { Component } from 'react';
import { Input, Form, FormItem, withForm, Button, message } from 'src/components';
import { amountValidator } from 'src/components/form';
import log from 'src/utils/log';
import { updateToolingPlanInfo } from 'src/services/equipmentMaintenance/base';
import { TOOLING_PLAN_INFO } from '../constants';

type Props = {
  data: any,
  form: any,
  onCancel: () => {},
  updatePlanInfo: () => {},
};

class EditToolingPlanInfoModal extends Component {
  props: Props;

  componentDidMount() {
    const {
      data,
      form: { setFieldsValue },
    } = this.props;
    if (data) {
      console.log(data);
      setFieldsValue(data);
    }
  }

  submit = () => {
    const {
      data,
      form: { validateFieldsAndScroll },
      updatePlanInfo,
    } = this.props;
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { upTime, downTime, prepareTime } = values;
        const params = [
          { type: TOOLING_PLAN_INFO.TURN_ON_TIME.value, value: upTime },
          { type: TOOLING_PLAN_INFO.TURN_OFF_TIME.value, value: downTime },
          { type: TOOLING_PLAN_INFO.TUNE_TIME.value, value: prepareTime },
        ];
        updatePlanInfo(true);
        updateToolingPlanInfo(data.id, params)
          .then(() => {
            data.upTime = upTime && Number(upTime);
            data.downTime = downTime && Number(downTime);
            data.prepareTime = prepareTime && Number(prepareTime);
            message.success('编辑计划信息成功');
          })
          .catch(e => {
            log.error(e);
          })
          .finally(() => {
            updatePlanInfo(false);
          });
      }
    });
  };

  renderItem = (label, filedName) => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <FormItem label={label}>
        <div style={{ display: 'flex' }}>
          {getFieldDecorator(`${filedName}`, {
            rules: [{ validator: amountValidator(99999, 0, 'integer') }],
          })(<Input style={{ width: 200 }} placeholder={'请输入'} />)}
          <Input style={{ width: 90, marginLeft: 10 }} disabled placeholder={'分钟'} />
        </div>
      </FormItem>
    );
  };

  render() {
    return (
      <div style={{ marginLeft: 30 }}>
        <Form>
          {this.renderItem('上模时间', 'upTime')}
          {this.renderItem('下模时间', 'downTime')}
          {this.renderItem('调机时间', 'prepareTime')}
        </Form>
      </div>
    );
  }
}

export default withForm({ showFooter: true }, EditToolingPlanInfoModal);
