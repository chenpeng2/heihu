import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Table, FormItem, InputNumber, FormattedMessage } from 'src/components';
import { amountValidator } from 'src/components/form';

const INPUT_WIDTH = 150;
const FORM_ITEM_WIDTH = 200;

class MaterialPercentage extends Component {
  state = {};

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return [
      {
        title: '待修改的物料数量',
        key: '1',
        render: () => {
          return (
            <FormItem style={{ width: FORM_ITEM_WIDTH, paddingRight: 0 }}>
              {getFieldDecorator('amountNeedChange', {
                rules: [
                  {
                    required: true,
                    message: <FormattedMessage defaultMessage={'必填'} />,
                  },
                  {
                    validator: amountValidator(),
                  },
                ],
              })(<InputNumber style={{ width: INPUT_WIDTH }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '修改后的物料数量',
        key: '2',
        render: () => {
          return (
            <FormItem style={{ width: FORM_ITEM_WIDTH, paddingRight: 0 }}>
              {getFieldDecorator('amountAfterChange', {
                rules: [
                  {
                    required: true,
                    message: <FormattedMessage defaultMessage={'必填'} />,
                  },
                  {
                    validator: amountValidator(),
                  },
                ],
              })(<InputNumber style={{ width: INPUT_WIDTH }} />)}
            </FormItem>
          );
        },
      },
    ];
  };

  render() {
    return (
      <div>
        <Table style={{ margin: 0 }} columns={this.getColumns()} dataSource={[1]} pagination={false} />
      </div>
    );
  }
}

MaterialPercentage.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
};

export default MaterialPercentage;
