import React, { Component } from 'react';
import _ from 'lodash';

import { primary, error } from 'src/styles/color';
import { Icon, FormItem, Popconfirm, Input, Table, Tooltip, withForm, Select } from 'src/components';
import { replaceSign } from 'src/constants';
import SearchSelect from 'src/components/select/searchSelect';
import { amountValidator } from 'src/components/form';
import { queryMaterialDetail } from 'src/services/bom/material';

import ColumnCopy from './columnCopy';
import SecondStorageSelect from './secondeStorageSelect';
import ReplaceContainer from './replaceContainer';
import { useLogic } from '../../constant';

const Option = Select.Option;
const FORM_KEY = 'formKey';

// 根据useLogic的value来找出
const getUseLogicNameByValue = value => {
  if (!value) return null;

  return Object.values(useLogic).find(v => {
    if (v.value === value) return true;
    return false;
  });
};

// 将form数据格式化提交出去
const formatFormValue = allValue => {
  const res = [];
  Object.entries(allValue).forEach(([key, value]) => {
    // 根据projectCode来找到有多少个值。同时将对应的keyIndex存起来用来匹配其他的值
    if (key.indexOf('projectCode') !== -1 && value) {
      const index = key.split('-')[1];
      res.push({
        [FORM_KEY]: index,
        projectCode: value,
      });
    }
  });

  Object.entries(allValue).forEach(([key, value]) => {
    // 获取purchaseOrder
    if (key.indexOf('purchaseOrderCode') !== -1) {
      const index = key.split('-')[1];

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.purchaseOrderCode = value;
        }
      });
    }

    // 获取createdByProcessRouting
    if (key.indexOf('createdByProcessRouting') !== -1) {
      const index = key.split('-')[1];

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.createdByProcessRouting = value;
        }
      });
    }

    // 获取materialCode
    if (key.indexOf('material') !== -1) {
      const index = key.split('-')[1];

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.material = value;
        }
      });
    }

    // unit
    if (key.indexOf('unit') !== -1) {
      const index = key.split('-')[1];

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.unit = value;
        }
      });
    }

    // amount
    if (key.indexOf('total') !== -1) {
      const index = key.split('-')[1];

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.amount = value;
        }
      });
    }

    // 获取目的地
    if (key.indexOf('destination') !== -1) {
      const index = key.split('-')[1];

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.destination = value;
        }
      });
    }

    // 获取占用逻辑的相关数据
    if (key.indexOf('useLogic') !== -1) {
      const index = key.split('-')[1];

      let useLogics = [];
      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          useLogics = value || [];
          a.useLogics = value || [];
        }
      });

      res.forEach(a => {
        if (a && a[FORM_KEY] === index) {
          a.occupyInfo = useLogics.map(v => {
            const num = allValue[`amount-${index}-${v}`];
            return {
              qcStatus: v,
              amount: num,
            };
          });
        }
      });
    }
  });

  return res;
};

const _amountValidator = v => {
  const reg = /^(-?\d+)(\.)?(\d+)?$/;
  if (!v) return '数量必填';
  if (!reg.test(v)) {
    return '必须是数字';
  }
  if (v <= 0) {
    return '数量必须大于0';
  }

  return null;
};

type Props = {
  style: {},
  form: any,
  value: any,
  onChange: () => {},
};

class MaterialList extends Component {
  props: Props;
  state = {
    data: [], // form的数据
  };

  tableInst = React.createRef();

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.value, this.props.value)) {
      this.setInitialData(nextProps.value);
    }
  }

  setInitialData = (data, cb) => {
    if (!Array.isArray(data)) return null;

    const { form } = this.props;

    const _data = data.map((a, index) => {
      a[FORM_KEY] = a[FORM_KEY] || index + 1;
      return a;
    });

    const setFormValue = (v, key) => {
      const {
        projectCode,
        destination,
        purchaseOrderCode,
        material,
        unit,
        amount,
        useLogics,
        occupyInfo,
        createdByProcessRouting,
      } = v || {};
      form.getFieldDecorator(`projectCode-${key}`);
      form.getFieldDecorator(`purchaseOrderCode-${key}`);
      form.getFieldDecorator(`material-${key}`);
      form.getFieldDecorator(`total-${key}`);
      form.getFieldDecorator(`unit-${key}`);
      form.getFieldDecorator(`useLogic-${key}`);
      form.getFieldDecorator(`destination-${key}`);
      if (Array.isArray(occupyInfo)) {
        occupyInfo.forEach(a => {
          const { qcStatus } = a || {};
          form.getFieldDecorator(`amount-${key}-${qcStatus}`);
        });
      }
      form.getFieldDecorator(`createdByProcessRouting-${key}`);

      const formValue = {};
      formValue[`projectCode-${key}`] = { value: projectCode };
      formValue[`purchaseOrderCode-${key}`] = { value: purchaseOrderCode };
      formValue[`material-${key}`] = { value: material };
      formValue[`unit-${key}`] = { value: unit };
      formValue[`total-${key}`] = { value: amount };
      formValue[`useLogic-${key}`] = { value: Array.isArray(useLogics) && useLogics.length ? useLogics : undefined };
      formValue[`destination-${key}`] = { value: destination };
      if (Array.isArray(occupyInfo)) {
        occupyInfo.forEach(a => {
          const { qcStatus, amount } = a || {};

          formValue[`amount-${key}-${qcStatus}`] = { value: amount || undefined };
          if (_amountValidator(amount)) {
            formValue[`amount-${key}-${qcStatus}`].errors = [new Error(_amountValidator(amount))];
          }
        });
      }
      formValue[`createdByProcessRouting-${key}`] = { value: createdByProcessRouting };

      form.setFields(formValue);
    };

    this.setState({ data: _data }, () => {
      _data.forEach(a => {
        const key = a[FORM_KEY];

        setFormValue(a, key);
      });
      if (typeof cb === 'function') cb();
    });
  };

  clearFields = key => {
    const { form } = this.props;
    const formValue = [];
    formValue.push(`projectCode-${key}`);
    formValue.push(`purchaseOrderCode-${key}`);
    formValue.push(`material-${key}`);
    formValue.push(`unit-${key}`);
    formValue.push(`total-${key}`);
    formValue.push(`useLogic-${key}`);
    formValue.push(`destination-${key}`);
    formValue.push(`amount-${key}-1`);
    formValue.push(`amount-${key}-2`);
    formValue.push(`amount-${key}-3`);
    formValue.push(`amount-${key}-4`);
    form.resetFields(formValue);
  };

  add = extraData => {
    const { data } = this.state;

    // 获取数据中最大的key
    const getMaxKey = data => {
      let res;
      data.forEach(i => {
        const key = Number(i[FORM_KEY]);
        if (!res) {
          res = key;
          return;
        }

        if (res && res < key) {
          res = key;
        }
      });

      return res;
    };
    const maxKey = getMaxKey(data);

    const nextKey = maxKey ? Number(maxKey) + 1 : -1;
    if (nextKey === -1) {
      return null;
    }

    const { projectCode, purchaseOrderCode } = extraData || {};
    const newData = {
      projectCode,
      purchaseOrderCode,
      [FORM_KEY]: nextKey,
      createdByProcessRouting: false, // 新添加的数据不需要添加物料按钮
    };
    data.push(newData);

    this.setInitialData(data, this.scrollTableIntoView);
  };

  // 项目是否是根据工艺路线创建的
  isProjectCreateByProcessRouting = record => {
    const res = _.get(record, 'createdByProcessRouting');

    return res;
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

  validateForm = () => {
    const { form } = this.props;
    let noError = false;

    form.validateFieldsAndScroll(err => {
      if (!err) {
        noError = true;
      }
    });

    return noError;
  };

  renderTargetTitle = () => {
    const { data } = this.state;
    const { form } = this.props;
    // form中目的地的id
    const keys = Array.isArray(data)
      ? data.map(i => {
          return `destination-${i[FORM_KEY]}`;
        })
      : [];

    // 确认后的回调
    const successCb = value => {
      if (!value) return;

      const _value = {};
      keys.forEach(i => {
        _value[i] = value;
      });
      form.setFieldsValue(_value);
    };

    return (
      <div>
        <span>目的地</span>
        <ColumnCopy successCb={successCb} style={{ display: 'inline-block', marginLeft: 5 }} />
      </div>
    );
  };

  getColumns = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        title: null,
        key: 'operation',
        fixed: 'left',
        width: 50,
        render: (_, record) => {
          const { projectCode, material } = record || {};
          const { materialName } = material || {};

          const deleteFn = () => {
            const key = record[FORM_KEY];
            const _data = this.state.data.filter(v => v[FORM_KEY] !== key);

            this.clearFields(key);
            this.setInitialData(_data);
          };

          const _text = `确定删除项目${projectCode}的物料${materialName || replaceSign}吗？`;
          return (
            <Popconfirm title={_text} onConfirm={deleteFn} okText={'删除'} cancelText={'取消'} okType={'danger'}>
              <Icon style={{ color: error }} type={'shanchu'} iconType={'gc'} />
            </Popconfirm>
          );
        },
      },
      {
        title: '订单编号',
        width: 100,
        dataIndex: 'purchaseOrderCode',
        render: data => {
          return <Tooltip text={data || replaceSign} length={20} />;
        },
      },
      {
        title: '项目编号',
        dataIndex: 'projectCode',
        width: 200,
        render: (data, record) => {
          const isCreatedByProcessRouting = this.isProjectCreateByProcessRouting(record);

          if (!isCreatedByProcessRouting) {
            return <Tooltip text={data || replaceSign} length={20} />;
          }

          const { projectCode, purchaseOrderCode } = record || {};

          return (
            <div>
              <Tooltip text={data || replaceSign} length={20} />
              <div
                onClick={() => this.add({ projectCode, purchaseOrderCode })}
                style={{ display: 'inline-block', color: primary, cursor: 'pointer', marginLeft: 10 }}
              >
                <Icon type={'plus-circle-o'} style={{ verticalAlign: 'text-bottom' }} />
                <span>增加物料</span>
              </div>
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        key: 'outputMaterial',
        width: 240,
        render: (data, record) => {
          const { projectCode, material } = record || {};
          const { materialName, materialCode } = material || {};

          const formKey = record[FORM_KEY];

          if (materialCode && materialName) {
            const _text = `${materialName}/${materialCode}`;

            return (
              <div>
                <Tooltip text={_text} length={20} />
                <ReplaceContainer
                  materialCode={materialCode}
                  projectCode={projectCode}
                  changeMaterial={value => {
                    const material = value ? value.material : null;

                    if (!material) return;
                    const { key, label } = material;

                    form.setFieldsValue({
                      [`material-${formKey}`]: { materialName: label ? label.split('/')[1] : null, materialCode: key },
                    });

                    const materialCode = material.key;
                    queryMaterialDetail(materialCode).then(res => {
                      const unitName = _.get(res, 'data.data.unitName');
                      form.setFieldsValue({ [`unit-${formKey}`]: unitName });
                    });
                  }}
                />
              </div>
            );
          }

          return (
            <FormItem>
              {getFieldDecorator(`material-${formKey}`, {
                rules: [{ required: true, message: '产出物料必填' }],
                onChange: v => {
                  const materialCode = _.get(v, 'key');
                  queryMaterialDetail(materialCode).then(res => {
                    const unitName = _.get(res, 'data.data.unitName');
                    form.setFieldsValue({ [`unit-${formKey}`]: unitName });
                  });
                },
              })(<SearchSelect style={{ width: 200 }} type={'materialBySearch'} />)}
            </FormItem>
          );
        },
      },
      {
        title: this.renderTargetTitle(),
        width: 240,
        key: 'destination',
        render: (_, record) => {
          const key = record[FORM_KEY];

          return (
            <FormItem>
              {getFieldDecorator(`destination-${key}`, {
                rules: [
                  {
                    required: true,
                    message: '目的地必填',
                  },
                ],
              })(<SecondStorageSelect style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '占用逻辑',
        dataIndex: 'useLogic',
        width: 250,
        render: (_, record) => {
          const key = record[FORM_KEY];

          return (
            <FormItem>
              {getFieldDecorator(`useLogic-${key}`, {
                rules: [
                  {
                    required: true,
                    message: '占用逻辑必填',
                  },
                ],
              })(
                <Select mode={'multiple'} style={{ width: 160 }}>
                  {Object.entries(useLogic).map(([key, data]) => {
                    const { name, value } = data;
                    return (
                      <Option value={value} key={value}>
                        {name}
                      </Option>
                    );
                  })}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '数量',
        key: 'amounts',
        render: (_, record) => {
          const key = record[FORM_KEY];
          const { unit, useLogics } = record || {};

          if (Array.isArray(useLogics)) {
            return useLogics.map((v, index) => {
              const useLogic = getUseLogicNameByValue(v);
              const { value, name } = useLogic || {};

              return (
                <div style={{ display: 'inline-block' }}>
                  <FormItem style={{ display: 'inline-block' }}>
                    <span style={{ verticalAlign: 'baseline', marginRight: 10 }}>{name}</span>
                    {getFieldDecorator(`amount-${key}-${value}`, {
                      rules: [
                        {
                          required: true,
                          message: '数量必填',
                        },
                        {
                          validator: amountValidator(),
                        },
                      ],
                    })(<Input style={{ width: 100 }} />)}
                    <span style={{ marginLeft: 10 }}>{unit || replaceSign}</span>
                    <span>{index !== useLogics.length - 1 ? ',' : null}</span>
                  </FormItem>
                </div>
              );
            });
          }
          return replaceSign;
        },
      },
    ];
  };

  render() {
    const columns = this.getColumns();
    const { data } = this.state;

    return (
      <div ref={this.tableInst}>
        <Table
          scroll={{ x: 1600, y: 400 }}
          style={{ margin: 0, width: 900 }}
          dataSource={data || []}
          columns={columns}
          pagination={false}
        />
      </div>
    );
  }
}

export default withForm(
  {
    onFieldsChange: (props, value, allValue) => {
      const res = {};
      Object.entries(allValue).forEach(([key, value]) => {
        res[key] = value.value;
      });

      props.onChange(formatFormValue(res));
    },
  },
  MaterialList,
);
