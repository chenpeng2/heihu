import React, { Component } from 'react';
import _ from 'lodash';
import { message, withForm, Form, FormItem, DatePicker, InputNumber, Input, Button } from 'components';
import { amountValidator } from 'components/form';
import { getProductivityStandardList } from 'src/services/knowledgeBase/productivityStandard';
import { getStandardMessage } from 'containers/productivityStandard/base/util';
import { addCapacityCoefficients } from 'src/services/schedule';

const { RangePicker } = DatePicker;

type Props = {
  form: {
    validateFields: () => {},
  },
  workstation: {},
  onSuccess: () => {},
  onCancel: () => {},
};

const getMbomMessage = (standards, standardMessage) => {
  if (!(Array.isArray(standards) && standards.length >= 1)) {
    return null;
  }
  const mbomStandard = standards[0];
  return `<${mbomStandard.mbomMaterialCode}/${mbomStandard.mbomMaterialName}/${mbomStandard.mbomVersion}>等${
    standards.length
  }个生产BOM为${standardMessage}`;
};

const getProcessRoutingMessage = (standards, standardMessage) => {
  if (!(Array.isArray(standards) && standards.length >= 1)) {
    return null;
  }
  const processRoutingStandard = standards[0];
  return `<${processRoutingStandard.processRouteCode}/${processRoutingStandard.processRouteName}>等${
    standards.length
  }个工艺路线为${standardMessage}`;
};

const getProcessMessage = (standards, standardMessage) => {
  if (!(Array.isArray(standards) && standards.length >= 1)) {
    return null;
  }
  const processStandard = standards[0];
  return `<${processStandard.processCode}/${processStandard.processName}>等${
    standards.length
  }个工序为${standardMessage}`;
};

class CapacityModal extends Component<Props> {
  state = {};

  async componentDidMount() {
    const { workstation } = this.props;
    const {
      data: { data },
    } = await getProductivityStandardList({ workstation_id: workstation.id, size: 100 });
    const dataGroupByStandard = _.groupBy(data, ({ timeInterval, timeUnit, amount, unit, standardType }) =>
      getStandardMessage(timeInterval, timeUnit, amount, unit, standardType),
    );
    this.setState({ dataGroupByStandard, data });
  }

  submit = () => {
    this.props.form.validateFields({ force: true }, async (err, values) => {
      if (err) {
        return;
      }
      const { workstation, onCancel, onSuccess } = this.props;
      const { range, ...rest } = values;
      const submitValues = {
        workstationId: workstation.id,
        ...rest,
      };
      if (Array.isArray(range) && range.length === 2) {
        const [startTime, endTime] = range;
        submitValues.startTime = startTime;
        submitValues.endTime = endTime;
      }
      this.setState({ submiting: true });
      const { data } = await addCapacityCoefficients(submitValues).finally(e => {
        this.setState({ submiting: false });
      });
      message.success('修改产能成功');
      if (onSuccess) {
        onSuccess();
      }
      onCancel();
    });
  };

  render() {
    const { form, workstation, onCancel } = this.props;
    const { getFieldDecorator } = form;
    const { dataGroupByStandard, data } = this.state;

    return (
      <React.Fragment>
        <Form>
          <FormItem label="工位">
            <div>{workstation.name}</div>
          </FormItem>
          <FormItem label="标准产能">
            {Array.isArray(data) && data.length
              ? _.map(dataGroupByStandard, (data, standardMessage) => {
                  const mbomStandards = data.filter(e => e.mbomId);
                  const processRoutingStandards = data.filter(e => e.processRouteCode);
                  const processStandards = data.filter(e => !e.mbomId && !e.processRouteCode);
                  return (
                    <React.Fragment>
                      {mbomStandards && mbomStandards.length ? (
                        <div>{getMbomMessage(mbomStandards, standardMessage)}</div>
                      ) : null}
                      {processRoutingStandards && processRoutingStandards.length ? (
                        <div>{getProcessRoutingMessage(processRoutingStandards, standardMessage)}</div>
                      ) : null}
                      {processStandards && processStandards.length ? (
                        <div>{getProcessMessage(processStandards, standardMessage)}</div>
                      ) : null}
                    </React.Fragment>
                  );
                })
              : '未维护标准产能'}
          </FormItem>
          <FormItem label="时间段">
            {getFieldDecorator('range', { rules: [{ required: true, message: '时间必填' }] })(<RangePicker />)}
          </FormItem>
          <FormItem label="产能">
            {getFieldDecorator('percentage', {
              rules: [
                {
                  required: true,
                  message: '产能必填',
                },
                amountValidator(1000, 0, 'integer'),
              ],
            })(<InputNumber />)}
            <Input style={{ marginLeft: 20, width: 60 }} disabled value={'%'} />
          </FormItem>
        </Form>
        <div style={{ marginLeft: 183, position: 'absolute', bottom: 30 }}>
          <Button type="default" style={{ width: 114 }} onClick={onCancel}>
            取消
          </Button>
          <Button disabled={this.state.submiting} style={{ width: 114, marginLeft: 60 }} onClick={this.submit}>
            保存
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default withForm({}, CapacityModal);
