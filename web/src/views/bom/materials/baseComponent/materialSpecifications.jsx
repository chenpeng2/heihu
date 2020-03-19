import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select, FormItem, Icon, Link, Input, Table } from 'src/components';
import { amountValidator } from 'src/components/form';
import { getFractionString } from 'src/utils/number';

const Option = Select.Option;
let KEY = 1;

class MaterialSpecification extends Component {
  state = {
    data: [],
  };

  componentDidMount() {
    this.setInitialValue();
  }

  componentWillReceiveProps(nextProps) {
    // 如果unitsForSelect改变。将选择了这个单位的数据删除
    if (!_.isEqual(nextProps.unitsForSelect, this.props.unitsForSelect)) {
      const nextData = [];

      const getData = unitId => {
        const { data } = this.state;
        let res = null;
        if (Array.isArray(data)) {
          data.forEach(i => {
            if (i && i.unit && i.unit.id === unitId) res = i;
          });
        }

        return res;
      };

      const { unitsForSelect } = nextProps || {};
      if (Array.isArray(unitsForSelect)) {
        unitsForSelect.forEach(i => {
          const res = getData(i && i.unit && i.unit.id);
          if (res) nextData.push(res);
        });
      }

      this.setState({ data: nextData });
    }
    if (!_.isEqual(nextProps.specifications, this.props.specifications) && this.props.edit) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { form, specifications, edit } = props || this.props;

    const nextData = [];
    const nextFormValue = [];
    if (edit && Array.isArray(specifications) && specifications.length) {
      specifications.forEach((i, index) => {
        const { unitId } = i || {};
        nextData.push({ key: index, unit: { id: unitId, name: 'ss' } });
        nextFormValue.push({ amount: getFractionString(i), unit: unitId });
        KEY = index;
      });
      this.setState({ data: nextData }, () => {
        form.setFieldsValue({ specifications: nextFormValue });
      });
    } else if (!edit) {
      // 创建的时候开始要有一行
      this.setState({ data: [{ key: KEY }] });
    }
  };

  getColumns = () => {
    const { form, unitsForSelect } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        key: 'operation',
        width: 10,
        render: (__, record) => {
          const { key } = record || {};
          return (
            <div style={{ height: 40, paddingTop: 6 }}>
              <Icon
                onClick={() => this.delete(key)}
                style={{ margin: '0 10px', cursor: 'pointer' }}
                type="minus-circle"
              />
            </div>
          );
        },
      },
      {
        title: '数量',
        width: 200,
        key: 'amount',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <div>
              <FormItem style={{ width: 200 }}>
                {getFieldDecorator(`specifications[${key}].amount`, {
                  rules: [
                    {
                      validator: amountValidator(null, null, 'fraction', 6),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '单位',
        key: 'unit',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <div>
              <FormItem style={{ width: 200 }}>
                {getFieldDecorator(`specifications[${key}].unit`, {
                  onChange: (value, option) => {
                    const unit = _.get(option, 'props.unit');
                    this.setState(({ data }) => {
                      return {
                        data: data.map(i => {
                          if (i && i.key === key) i.unit = unit;
                          return i;
                        }),
                      };
                    });
                  },
                })(
                  <Select style={{ width: 200 }}>
                    {Array.isArray(unitsForSelect) && unitsForSelect.length
                      ? unitsForSelect
                          .map(i => {
                            const { unit } = i || {};
                            const { name, id } = unit || {};
                            if (!id || !name) return null;
                            return (
                              <Option unit={unit} value={id}>
                                {name}
                              </Option>
                            );
                          })
                          .filter(i => i)
                      : null}
                  </Select>,
                )}
              </FormItem>
            </div>
          );
        },
      },
    ];
  };

  add = () => {
    this.setState(({ data }) => {
      return {
        data: data.concat([{ key: (KEY += 1) }]),
      };
    });
  };

  delete = key => {
    this.setState(({ data }) => {
      return {
        data: data.filter(i => i && i.key !== key),
      };
    });
  };

  renderFooter = () => {
    return (
      <div>
        <Link icon="plus-circle-o" onClick={() => this.add()}>
          添加一行
        </Link>
      </div>
    );
  };

  render() {
    return (
      <div>
        <Table
          style={{ marginLeft: 0, minWidth: 475 }}
          columns={this.getColumns()}
          footer={this.renderFooter}
          dataSource={this.state.data}
          pagination={false}
        />
      </div>
    );
  }
}

MaterialSpecification.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  unitsForSelect: PropTypes.any,
  edit: PropTypes.bool,
  specifications: PropTypes.array,
};

export default MaterialSpecification;
