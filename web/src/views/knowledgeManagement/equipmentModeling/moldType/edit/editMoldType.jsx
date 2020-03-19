import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import withForm from 'components/form';
import {
  queryMoldCategoryDetail,
  updateMoldCategory }
from 'src/services/knowledgeBase/equipment';
import { Form, FormItem, Button } from 'components';
import { MoldTypeBase } from '../index';
import styles from './styles.scss';

type Props = {
  match: {
    params: {},
  },
  form: any,
};

class EditMoldType extends Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount() {
    const { match: { params: { id } } } = this.props;
    console.log(this.props);
    console.log({ id });
    this.fetchData(id);
  }

  fetchData = async (id) => {
    const { data } = await queryMoldCategoryDetail(id);
    this.setState({
      data: data.data,
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

  submit = async () => {
    const { form, match: { params: { id } } } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log({ values });
        const _format = this.formatFormData(values);
        console.log({ _format });
        updateMoldCategory(id, _format).then(res => {
          console.log({ res });
          if (res.data.statusCode === 200) {
            const { match: { params: { id } } } = this.props;
            console.log({ id });
            this.context.router.history.push(`/knowledgeManagement/moldType/${id}/detail`);
          }
        }).catch(console.log);
        return;
      }
      return null;
    });
  }

  render() {
    const { data } = this.state;
    const { form } = this.props;

    return (
      <div style={{ padding: '20px 20px' }}>
        <Form>
          <MoldTypeBase formData={data} submit={this.submit} form={form} title="修改模具类型信息" />
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

EditMoldType.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, EditMoldType));
