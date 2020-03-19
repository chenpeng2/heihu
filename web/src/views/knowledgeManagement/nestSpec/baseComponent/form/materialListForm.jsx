import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Select, Tooltip, Table, message, Link, Icon, FormItem, InputNumber } from 'src/components/index';
import SearchSelect from 'src/components/select/searchSelect';
import { replaceSign } from 'src/constants';
import MaterialUnitSelect from 'src/containers/unit/materialUnitSelect';
import { amountValidator } from 'src/components/form/index';
import { arrayIsEmpty } from 'src/utils/array';

let KEY = 0;
const Option = Select.Option;

export const FORM_TYPE = {
  edit: 'edit',
  create: 'create',
};

class MaterialListForm extends Component {
  state = {
    data: [
      {
        key: KEY,
      },
    ],
  };

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData) && this.props.type === FORM_TYPE.edit) {
      this.setInitialData(nextProps);
    }
  }

  // 将表格重置为原始状态
  backToInitialState = () => {
    KEY = 0;
    const { form } = this.props;
    form.resetFields();
    this.setState({ data: [{ key: KEY }] });
  };

  // 编辑的时候需要将state中的data改为合适的数据。然后重新设置默认值
  setInitialData = props => {
    const { form, type, initialData } = props || this.props;
    if (type === FORM_TYPE.edit && initialData) {
      this.setState(
        {
          data: Array.isArray(initialData)
            ? initialData.map((i, index) => {
                const { remark, unitId, unitName, materialCode } = i || {};
                KEY = index;
                return {
                  key: KEY,
                  unit: { id: unitId, name: unitName },
                  material: {
                    code: materialCode,
                  },
                  desc: remark,
                  // disabled: true, // 编辑的时候不可以处理已经被选中的值
                };
              })
            : [{ key: KEY }],
        },
        () => {
          const valueAfterFormat = !arrayIsEmpty(initialData)
            ? initialData.map(i => {
                const { seq, unitId, unitName, materialCode, materialName, remark, amount } = i || {};
                return {
                  nestAmount: amount,
                  lineId: seq,
                  unit: { key: unitId, label: unitName },
                  material: { key: materialCode, label: `${materialCode}/${materialName}` },
                  desc: remark,
                };
              })
            : [];
          form.setFieldsValue({
            materialList: valueAfterFormat,
          });
        },
      );
    }
  };

  tableInst = React.createRef();

  isMaterialSelected = materialCode => {
    const { data } = this.state;
    const selectedMaterialCodes = arrayIsEmpty(data) ? [] : data.map(i => _.get(i, 'material.code')).filter(i => i);
    return selectedMaterialCodes.includes(materialCode);
  };

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        title: '行号',
        width: 60,
        key: 'seq',
        render: (__, record, index) => {
          const { key } = record || {};

          return (
            <div style={{ paddingBottom: 10 }}>
              <Icon
                onClick={() => {
                  this.deleteLine(key);
                }}
                style={{ marginRight: '10px', cursor: 'pointer' }}
                type="minus-circle"
              />
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
                  const { unitId, unitName, desc } = materialData || {};
                  this.setState(
                    ({ data }) => {
                      const nextData = data.map(i => {
                        if (i && i.key === key) {
                          i.material = materialData;
                          i.unit = { id: unitId, name: unitName };
                          i.desc = desc;
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
                    },
                  );
                },
              })(
                <SearchSelect
                  disabled={disabled}
                  params={{ status: 1 }}
                  style={{ width: 250 }}
                  type={'materialBySearch'}
                  renderOption={optionData => {
                    const { key, label, ...rest } = optionData || {};
                    return (
                      <Option
                        disabled={this.isMaterialSelected(key)} // 如果物料已经被选中那么不可以再次选中
                        key={`key-${key}`}
                        value={key}
                        title={label}
                        {...rest}
                      >
                        {label}
                      </Option>
                    );
                  }}
                />,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '规格描述',
        width: 230,
        key: 'desc',
        render: (__, record) => {
          const { desc, key } = record || {};
          const text = desc || replaceSign;
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].remark`, {
                initialValue: desc,
              })(<Tooltip text={text} length={16} />)}
            </FormItem>
          );
        },
      },
      {
        title: '嵌套数',
        width: 230,
        key: 'lineAttachment',
        render: (__, record) => {
          const { key } = record || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].nestAmount`, {
                rules: [
                  {
                    required: true,
                    message: '嵌套数必填',
                  },
                  {
                    validator: amountValidator(),
                  },
                ],
              })(<InputNumber style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '单位',
        width: 330,
        key: 'unit',
        render: (__, record) => {
          const { key, unit, material } = record;
          const { code } = material || {};
          const { id: unitId, name: unitName } = unit || {};

          return (
            <div style={{ whiteSpace: 'nowrap', width: 300 }}>
              <FormItem style={{ display: 'inline-block' }}>
                {getFieldDecorator(`materialList[${key}].unit`, {
                  rules: [
                    {
                      required: true,
                      message: '单位必填',
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
    ];
  };

  addLine = cb => {
    this.setState(({ data }) => {
      return {
        data: data.concat({ key: (KEY += 1) }),
      };
    }, cb);
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
    return (
      <Link
        icon="plus-circle-o"
        onClick={() => {
          this.addLine(() => {
            this.scrollTableIntoView();
          });
        }}
      >
        添加物料
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
        <Table
          footer={this.renderAddLine}
          style={{ margin: 0, width: 800 }}
          scroll={{ x: true, y: 280 }}
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

export default MaterialListForm;
