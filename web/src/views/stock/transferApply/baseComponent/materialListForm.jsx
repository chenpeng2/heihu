import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { message, Link, Icon, FormItem, Input, InputNumber, SimpleTable } from 'src/components/index';
import SearchSelect from 'src/components/select/searchSelect';
import { replaceSign } from 'src/constants';
import MaterialUnitSelect from 'src/containers/unit/materialUnitSelect';
import { lengthValidate, amountValidator } from 'src/components/form/index';
import { getAvailableAmount } from 'src/services/cooperate/materialRequest';

let KEY = 0;

class MaterialListForm extends Component {
  state = {
    data: [
      {
        key: KEY,
      },
    ],
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData) && this.props.type === 'edit') {
      this.setInitialData(nextProps);
    }
    // 改变发出仓库需要改变可用数量
    if (!_.isEqual(nextProps.sourceWarehouse, this.props.sourceWarehouse)) {
      this.state.data.forEach(i => {
        this.setAvailableAmount(i, nextProps.sourceWarehouse);
      });
    }
  }

  // 将表格重置为原始状态
  resetForm = () => {
    KEY = 0;
    this.setState(
      {
        data: [{ key: KEY }],
      },
      () => {
        this.props.form.resetFields(['materialList']);
      },
    );
  };

  // 编辑的时候需要将state中的data改为合适的数据。然后重新设置默认值
  setInitialData = props => {
    const { form, type, initialData } = props || this.props;
    if (type === 'edit' && initialData) {
      this.setState(
        {
          data: Array.isArray(initialData)
            ? initialData.map(i => {
                const { id, unit, material, lineId } = i || {};
                KEY = lineId - 1;
                return {
                  key: KEY,
                  unit: { id: unit && unit.key, name: unit && unit.label },
                  material: {
                    code: material && material.key,
                  },
                  disabled: true, // 编辑的时候不可以处理已经被选中的值
                  id,
                };
              })
            : [{ key: KEY }],
        },
        () => {
          form.setFieldsValue({ materialList: initialData });
        },
      );
    }
  };

  tableInst = React.createRef();

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        title: '行号',
        width: 60,
        key: 'seq',
        render: (__, record, index) => {
          const { key, disabled, id } = record || {};
          if (id) {
            // 对于编辑的数据需要有id
            getFieldDecorator(`materialList[${key}].id`, { initialValue: id });
          }
          return (
            <div style={{ paddingBottom: 10 }}>
              {disabled ? null : (
                <Icon
                  onClick={() => {
                    this.deleteLine(key);
                  }}
                  style={{ marginRight: '10px', cursor: 'pointer' }}
                  type="minus-circle"
                />
              )}
              {getFieldDecorator(`materialList[${key}].lineId`, { initialValue: index + 1 })(<span>{index + 1}</span>)}
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        width: 300,
        key: 'material',
        render: (__, record) => {
          const { key, disabled } = record;
          const { sourceWarehouse } = this.props;

          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].material`, {
                rules: [
                  {
                    required: true,
                    message: '物料必填',
                  },
                ],
                onChange: (value, options) => {
                  const materialData = _.get(options, 'props.data');
                  const { unitId, unitName } = materialData || {};
                  this.setState(
                    ({ data }) => {
                      const nextData = data.map(i => {
                        if (i && i.key === key) {
                          i.material = materialData;
                          i.unit = { id: unitId, name: unitName };
                        }
                        return i;
                      });
                      return {
                        data: nextData,
                      };
                    },
                    () => {
                      const data = form.getFieldValue('materialList');
                      data[key].unit = { key: unitId, label: unitName };
                      form.setFieldsValue({
                        materialList: data,
                      });
                      // 物料改变需要改变可用数量
                      this.setAvailableAmount(record, sourceWarehouse);
                    },
                  );
                },
              })(
                <SearchSelect
                  disabled={disabled}
                  params={{ status: 1 }}
                  style={{ width: 250 }}
                  type={'materialBySearch'}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '计划数与单位',
        width: 330,
        key: 'planAmount',
        render: (__, record) => {
          const { key, unit, material } = record;
          const { code } = material || {};
          const { id: unitId, name: unitName } = unit || {};

          return (
            <div style={{ whiteSpace: 'nowrap', width: 300 }}>
              <FormItem style={{ display: 'inline-block', marginRight: 10 }}>
                {getFieldDecorator(`materialList[${key}].amount`, {
                  rules: [
                    {
                      required: true,
                      message: '计划数必填',
                    },
                    {
                      validator: amountValidator(null, 0),
                    },
                  ],
                })(<InputNumber />)}
              </FormItem>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`materialList[${key}].unit`, {
                  rules: [
                    {
                      required: true,
                      message: '计划数单位必填',
                    },
                  ],
                  initialValue: unitId && unitName ? { key: unitId, label: unitName } : undefined,
                  onChange: value => {
                    const { key: unitKey, label } = value || {};
                    this.setState(({ data }) => {
                      const nextData = data.map(i => {
                        if (i && i.key === key) {
                          i.unit = { id: unitKey, name: label };
                        }
                        return i;
                      });
                      return {
                        data: nextData,
                      };
                    });
                  },
                })(<MaterialUnitSelect style={{ width: 100 }} materialCode={code} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '可用库存',
        width: 100,
        key: 'storageAmount',
        render: (__, record) => {
          const { availableAmount } = record || {};
          return <span>{typeof availableAmount === 'number' ? availableAmount : replaceSign}</span>;
        },
      },
      {
        title: '行备注',
        width: 230,
        key: 'lineAttachment',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].remark`, {
                rules: [
                  {
                    validator: lengthValidate(null, 20),
                  },
                ],
              })(<Input style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
    ];
  };

  addLine = cb => {
    this.setState(({ data }) => {
      return {
        data: data.concat({ key: (KEY += 1) }),
      };
    }, cb);
  };

  setAvailableAmount = (record, sourceWarehouse) => {
    const { material, unit, key } = record || {};
    if (!material || !unit || !sourceWarehouse) return;

    getAvailableAmount({
      unitId: unit && unit.id,
      materialCode: material && material.code,
      warehouseCode: sourceWarehouse && sourceWarehouse.key,
    }).then(res => {
      const nextAvailableAmount = _.get(res, 'data.data');

      // 如果下一个值和这一个值不同那么就重新设置。相同就不需要重新设置
      let needChange = false;
      const { data } = this.state;
      data.forEach(i => {
        if (i && i.key === key && i.availableAmount !== nextAvailableAmount) {
          needChange = true;
        }
      });

      if (!needChange) return;

      this.setState(({ data }) => {
        const nextData = data.map(i => {
          if (i && i.key === key) {
            i.availableAmount = _.get(res, 'data.data');
          }
          return i;
        });
        return {
          data: nextData,
        };
      });
    });
  };

  deleteLine = key => {
    if (typeof key !== 'number') return;
    this.setState(({ data }) => {
      // 如果只有一行，不可以删除
      if (Array.isArray(data) && data.length === 1) {
        message.warn('物料必填');
        return { data };
      }
      return {
        data: data.filter(i => i && i.key !== key),
      };
    });
  };

  renderAddLine = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <Link
        icon="plus-circle-o"
        onClick={() => {
          this.addLine(() => {
            this.scrollTableIntoView();
          });
        }}
      >
        {changeChineseToLocale('添加')}
      </Link>
    );
  };

  // 自动将table滚动到底部
  scrollTableIntoView = () => {
    const tableInst = this.tableInst;
    if (tableInst && tableInst.current) {
      const tableContainer = tableInst.current.querySelector('.ant-table-body');
      if (tableContainer) {
        tableContainer.scrollBy({ top: tableContainer.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  render() {
    const { data } = this.state;
    const columns = this.getColumns();

    return (
      <div ref={this.tableInst}>
        <SimpleTable
          footer={this.renderAddLine}
          style={{ margin: 0, width: 800 }}
          scroll={{ y: 280, x: 1500 }}
          dataSource={data}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

MaterialListForm.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  sourceWarehouse: PropTypes.any,
  type: PropTypes.string,
  initialData: PropTypes.any,
};

MaterialListForm.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default MaterialListForm;
