import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withForm, Form, FormItem, Button } from 'components';
import {
  queryReportTemplateList,
  addMoldCategory,
 } from 'src/services/knowledgeBase/equipment';
import { MoldTypeBase } from '../index';
import styles from './styles.scss';

type propsType = {
  router: any,
  form: any,
  params: {},
};

class CreateMoldType extends React.Component<propsType> {
  state = {
    reportTemplates: [],
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

  formatFormData = (data) => {
    const _submit = {
      repairTaskConfig: {},
      maintainTaskConfig: {},
      checkTaskConfig: {},
    };
    _submit.name = data.name;
    _submit.resourceCategory = data.resourceCategory;
    _submit.repairTaskConfig.scan = data.repairScan;
    _submit.repairTaskConfig.stop = data.repairStop;
    _submit.repairTaskConfig.acceptanceCheck = data.acceptanceCheck;
    _submit.repairTaskConfig.warnConfig = data.repairWarnConfig.key;
    _submit.repairTaskConfig.reportTemplateId = data.repairReportTemplate.key;
    _submit.maintainTaskConfig.scan = data.maintainScan;
    _submit.maintainTaskConfig.stop = data.maintainStop;
    _submit.maintainTaskConfig.acceptanceCheck = data.maintainAcceptanceCheck;
    _submit.maintainTaskConfig.warnConfig = data.maintainWarnConfig.key;
    _submit.maintainTaskConfig.reportTemplateId = data.maintainReportTemplate.key;
    return _submit;
  }

  submit = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const _format = this.formatFormData(values);
        addMoldCategory(_format).then(res => {
          if (res.data.statusCode === 200) {
            const { data: { id } } = res.data;
            this.context.router.history.push(`/knowledgeManagement/moldType/${id}/detail`);
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
          <MoldTypeBase form={form} title="创建模具类型" />
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

CreateMoldType.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, CreateMoldType));
