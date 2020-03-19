import React from 'react';
import { withForm, Form, Select, FormItem } from 'components';
import { getPurchaseOrderFinishReasons } from 'services/cooperate/purchaseOrder';

const Option = Select.Option;

class FinishReasonForm extends React.PureComponent<any> {
  state = {
    reasons: [],
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async params => {
    const { data: { data } } = await getPurchaseOrderFinishReasons({ ...params, status: 1 });
    this.setState({ reasons: data });
  };

  submit = () => {
    return this.props.form.getFieldsValue();
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;
    const { reasons } = this.state;

    return (
      <div>
        <FormItem label="原因">
          {getFieldDecorator('finishReasonId')(<Select
            showSearch
            onSearch={value => this.fetchData({ name: value })}
            style={{ width: 530 }}
          >
          {reasons && reasons.map(({ id, name }) =>
            (<Option key={id} value={id}>{name}</Option>))
          }
          </Select>)}
        </FormItem>
      </div>
    );
  }
}

export default withForm({}, FinishReasonForm);
