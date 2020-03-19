import React, { Component } from 'react';
import { updatePreparationTime, getPreparationTimeDetail } from 'src/services/knowledgeBase/preparationTime';
import { withForm, message, Spin } from 'components';
import { convertTimeAndUnit } from 'utils/string';
import BaseForm, { formatValue } from '../baseComponent/baseForm';
import { knowledgeItem } from '../utils';

type Props = {
  viewer: {
    organization: {},
  },
  id: String,
  onClose: any,
  onCompeleted: any,
  relay: {},
  match: {},
  form: any,
};

class EditUnit extends Component {
  props: Props;
  state = {
    loading: true,
  };

  async componentDidMount() {
    const { id } = this.props;
    const {
      data: { data },
    } = await getPreparationTimeDetail({ id }).finally(e => {
      this.setState({ loading: false });
    });
    console.log(data);
    const values = {
      ...data,
      ...convertTimeAndUnit({ time: data.time, targetUnit: data.unit, raw: true }),
    };
    values.workstationId = {
      value: `WORKSTATION-${data.workstationId}`,
      label: data.workstationName,
    };

    this.props.form.setFieldsValue(values);
  }

  submit = async value => {
    await updatePreparationTime(formatValue(value));
    message.success(`编辑${knowledgeItem.display}成功`);
    this.props.onClose();
    this.props.onCompeleted();
  };

  render() {
    const { form, id } = this.props;
    form.getFieldDecorator('id', { initialValue: id });
    return (
      <Spin spinning={this.state.loading}>
        <BaseForm edit form={form} />
      </Spin>
    );
  }
}

const EditUnitForm = withForm({ showFooter: true }, EditUnit);

export default EditUnitForm;
