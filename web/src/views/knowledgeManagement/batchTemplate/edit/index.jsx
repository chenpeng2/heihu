import React from 'react';
import { withForm } from 'components';
import { getBatchTemplateDetail, editBatchTemplates } from 'services/process';
import BaseForm from '../base/BaseForm';

class Edit extends React.PureComponent {
  state = {};
  componentDidMount = async () => {
    const {
      data: { data },
    } = await getBatchTemplateDetail(this.props.match.params.id);
    this.props.form.setFieldsValue(data);
  };

  render() {
    const submitApi = data => editBatchTemplates(this.props.match.params.id, data);
    return <BaseForm {...this.props} disabledFields={['templateName']} submitApi={submitApi} />;
  }
}

export default withForm({}, Edit);
