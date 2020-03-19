import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { RestPagingTable, Input, FormItem } from 'src/components';
import { queryMaterialCustomField } from 'src/services/bom/material';
import { lengthValidate } from 'src/components/form';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';

class CustomMaterialFields extends Component {
  state = {
    data: [],
  };

  componentDidMount() {
    this.setInitialValue(this.props);
  }

  componentWillReceiveProps(nextProps) {
    // 编辑的时候需要填入默认值
    if (!_.isEqual(this.props.initialData, nextProps.initialData)) {
      this.setInitialValue(nextProps);
    }
  }

  // 填入默认值
  setInitialValue = async (props) => {
    this.setState({ loading: true });

    const { edit, initialData } = props;

    try {
      const res = await queryMaterialCustomField();
      const allCustomFields = _.get(res, 'data.data');

      const _data = [];
      if (edit) {
        // 编辑的时候需要将initialValue merge allCustomFields
        allCustomFields.forEach(i => {
          const { keyName, length, keyValue } = i || {};

          let initialValue = false;
          if (Array.isArray(initialData)) {
            initialData.forEach(j => {
              if (j && j.keyName === keyName) {
                const { keyName, keyValue } = j;
                initialValue = { keyValue, keyName, length };
              }
            });
          }

          if (initialValue) {
            _data.push(initialValue);
          } else {
            _data.push({ keyValue, keyName, length });
          }
        });

        this.setState({ data: _data });
      } else {
        // 创建的时候只需要将所有值放在里面
        this.setState({ data: allCustomFields });
      }
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;

    return [
      {
        title: '字段名',
        dataIndex: 'keyName',
        width: 200,
        render: (data, record, index) => {
          return (
            <div>
              {getFieldDecorator(`materialCustomFields[${index}].keyName`, { initialValue: data })(
                <span>{data || replaceSign}</span>,
              )}
            </div>
          );
        },
      },
      {
        title: '字段值',
        key: 'value',
        width: 200,
        render: (__, record, index) => {
          const { length, keyValue } = record;
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialCustomFields[${index}].keyValue`, {
                  rules: [
                    {
                      validator: lengthValidate(null, length),
                    },
                  ],
                  initialValue: keyValue || null,
                })(<Input />)}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  renderTable = () => {
    const { data } = this.state;

    return (
      <RestPagingTable
        style={{ width: 500, margin: 0 }}
        scroll={{ y: 400 }}
        dataSource={data}
        columns={this.getColumns()}
        pagination={false}
      />
    );
  };

  render() {
    return <div>{this.renderTable()}</div>;
  }
}

CustomMaterialFields.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  edit: PropTypes.bool,
  initialData: PropTypes.any,
};

export default CustomMaterialFields;
