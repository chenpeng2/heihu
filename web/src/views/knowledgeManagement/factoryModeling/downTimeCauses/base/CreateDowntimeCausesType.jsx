import * as React from 'react';
import { FormItem, Input } from 'components';
import withForm, { requiredRule, lengthValidate, checkTwoSidesTrim } from 'components/form';
import { addDowntimeCauseType } from 'services/knowledgeBase/downtimeCause';

class CreateDowntimeCausesType extends React.Component {
  state = {};

  submit = async value => {
    const { onClose } = this.props;
    await addDowntimeCauseType(value);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  render() {
    console.log('this.props', this.props);
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div>
        <FormItem label="名称">
          {getFieldDecorator('name', {
            rules: [
              requiredRule('名称'),
              { validator: lengthValidate(0, 10) },
              { validator: checkTwoSidesTrim('名称') },
            ],
          })(<Input />)}
        </FormItem>
      </div>
    );
  }
}

export default withForm({ showFooter: true }, CreateDowntimeCausesType);
