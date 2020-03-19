import * as React from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, Form, FormItem, Button } from 'components';
import {
  queryReportTemplateList,
  addEquipmentCategory,
 } from 'src/services/knowledgeBase/equipment';
import authorityWrapper from 'src/components/authorityWrapper';
import { formatParams } from '../base/formatValue';
import { EquipmentTypeBase } from '../index';

type propsType = {
  router: any,
  form: any,
  params: {},
};

class CreateEquipmentType extends React.Component<propsType> {
  state = {
    reportTemplates: [],
    taskStrategies: [],
  };

  componentDidMount = () => {
    this.fetchReportTemplates();
  }

  fetchReportTemplates = async () => {
    const { data: { total } } = await queryReportTemplateList({ page: 1, size: 10 });
    const { data: { data } } = await queryReportTemplateList({ page: 1, size: total });
    this.setState({
      reportTemplates: data,
    });
  }

  handleStrategySubmit = (taskStrategies) => {
    this.setState({ taskStrategies });
  }

  formatFormData = (data) => {
    const { taskStrategies } = this.state;
    const _submit = {
      repairTaskConfig: {},
    };
    const {
      repairWarnConfig,
      repairReportTemplate,
      repairScan,
      repairStop,
      acceptanceCheck,
      ...rest
    } = data;
    _submit.name = data.name;
    _submit.repairTaskConfig.scan = data.repairScan;
    _submit.repairTaskConfig.stop = data.repairStop;
    _submit.repairTaskConfig.acceptanceCheck = data.acceptanceCheck;
    _submit.repairTaskConfig.warnConfig = data.repairWarnConfig.key;
    _submit.repairTaskConfig.reportTemplateId = data.repairReportTemplate.key;
    if (data.cleanValidPeriod) {
      _submit.cleanConfig = {
        ...data.cleanValidPeriod,
        open: data.cleanOpen,
      };
    }
    _submit.taskStrategies = taskStrategies.map(n => formatParams(n));
    if (data.deviceProp) {
      const deviceProp = _.compact(Object.values(data.deviceProp));
      _submit.deviceMetricIds = _.compact(deviceProp.map(n => n.metric.key));
    }
    return { ..._submit, ...rest };
  }

  submit = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const _format = this.formatFormData(values);
        addEquipmentCategory(_format).then(res => {
          if (res.data.statusCode === 200) {
            const { data: { id } } = res.data;
            this.context.router.history.push(`/knowledgeManagement/equipmentType/${id}/detail`);
          }
        }).catch(console.log);
        return;
      }
      return null;
    });
  }

  render() {
    const { form } = this.props;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Form>
          <EquipmentTypeBase handleStrategySubmit={this.handleStrategySubmit} form={form} title="创建设备类型" />
          <FormItem>
            <Button
              style={{ width: 114, height: 32, marginLeft: 120 }}
              type="primary"
              onClick={this.submit}
            >
              保存
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

CreateEquipmentType.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, CreateEquipmentType));
