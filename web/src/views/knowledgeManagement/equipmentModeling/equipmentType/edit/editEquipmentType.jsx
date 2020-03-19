import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import withForm from 'components/form';
import {
  queryEquipmentCategoryDetail,
  updateEquipmentCategory,
} from 'src/services/knowledgeBase/equipment';
import { Form, FormItem, Button } from 'components';
import { formatParams, formatValue } from '../base/formatValue';
import { EquipmentTypeBase } from '../index';

type Props = {
  match: {
    params: {},
  },
  location: {
    query: {},
  },
  form: any,
};

class EditEquipmentType extends Component {
  props: Props;
  state = {
    data: {},
    taskStrategies: [],
  };

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    this.fetchData(id);
  }

  fetchData = async (id) => {
    const { data } = await queryEquipmentCategoryDetail(id);
    const _data = data.data || {};
    this.setState({
      data: _data,
      taskStrategies: _data.taskStrategies || [],
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
    _submit.taskStrategies = taskStrategies.map(n => {
      if (n.orgId) {
        return formatParams(formatValue(n));
      }
      return formatParams(n);
    });
    if (data.deviceProp) {
      const deviceProp = _.compact(Object.values(data.deviceProp));
      _submit.deviceMetricIds = _.compact(deviceProp.map(n => n.metric.key));
    }
    return { ..._submit, ...rest };
  }

  submit = async () => {
    const { form, match: { params: { id } }, location: { query } } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const _format = this.formatFormData(values);
        updateEquipmentCategory(id, _format).then(res => {
          if (res.data.statusCode === 200) {
            const { match: { params: { id } } } = this.props;
            this.context.router.history.push(`/knowledgeManagement/equipmentType/${id}/detail/?resourceCategory=${query.resourceCategory}`);
          }
        }).catch(console.log);
        return;
      }
      return null;
    });
  }

  render() {
    const { data, taskStrategies } = this.state;
    const { form } = this.props;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Form>
          <EquipmentTypeBase
            handleStrategySubmit={this.handleStrategySubmit}
            deviceMetrics={data.deviceMetrics}
            taskStrategies={taskStrategies || data.taskStrategies}
            formData={data}
            submit={this.submit}
            form={form}
            title="编辑设备类型信息"
          />
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

EditEquipmentType.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, EditEquipmentType));
