import React, { Component } from 'react';
import { createPreparationTime } from 'src/services/knowledgeBase/preparationTime';
import { withForm, message } from 'components';
import BaseForm, { formatValue } from '../baseComponent/baseForm';
import { knowledgeItem } from '../utils';

type Props = {
  viewer: {
    organization: {},
  },
  onClose: any,
  onCompeleted: any,
  relay: {},
  match: {},
  form: {
    getFieldDecorator: () => {},
  },
};

class CreateUnit extends Component {
  props: Props;
  state = {};

  submit = async value => {
    await createPreparationTime(formatValue(value));
    message.success(`创建${knowledgeItem.display}成功`);
    this.props.onClose();
    this.props.onCompeleted();
  };

  render() {
    const { form } = this.props;
    return <BaseForm form={form} />;
  }
}

const CreateUnitForm = withForm({ showFooter: true }, CreateUnit);

export default CreateUnitForm;
