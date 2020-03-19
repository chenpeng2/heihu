/**
 * @description: 排程创建转移申请的物料列表
 *
 * @date: 2019/4/3 上午10:08
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { openModal, DatePicker, FormItem, Input, Table, SingleStorageSelect, Select } from 'components/index';
import SearchSelect from 'components/select/searchSelect';
import { replaceSign } from 'constants';
import { lengthValidate, requiredRule } from 'components/form/index';
import { getAvailableAmount } from 'services/cooperate/materialRequest';
import { primary } from 'styles/color';
import moment from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { ORGANIZATION_CONFIG, includeOrganizationConfig } from 'utils/organizationConfig';

import SelectForSourceWarehouse from './selectForSourceWarehouse';
import SelectForTargetStorage from './selectForTargetStorage';
import SelectForRequireTime from './seletForRequireTime';
import InputForCode from './inputForCode';

import { codeFormatValidate } from '../util';
import { renderTooltip } from './utils';

let KEY = 0;

const Option = Select.Option;

class MaterialListForm extends Component {
  state = {
    data: [],
  };
  tableInst = React.createRef();

  componentDidMount() {
    this.setInitialData(this.props);
  }

  componentDidUpdate(preProps) {
    const { tableData, isMergeStepTwo } = preProps || {};
    if (!_.isEqual(tableData, this.props.tableData) || !_.isEqual(isMergeStepTwo, this.props.isMergeStepTwo)) {
      this.setInitialData(this.props);
    }
  }

  setInitialData = props => {
    const { tableData, form } = props || {};

    KEY = 0;
    const nextData = Array.isArray(tableData)
      ? tableData.map(i => {
          const { tasks, ...rest } = i || {};
          const res = {
            ...rest,
            tasks,
            taskCodes: Array.isArray(tasks) ? tasks.map(i => i && i.taskCode).filter(i => i) : undefined,
            key: KEY,
          };
          KEY += 1;
          return res;
        })
      : [{ kye: KEY }];
    this.setState({ data: nextData }, () => {
      form.setFieldsValue({ materialList: nextData });
    });
  };

  setAllForCode = () => {
    return (
      <div>
        <span>编号</span>
        <span
          onClick={() => {
            openModal({
              title: '选择全部',
              children: (
                <InputForCode
                  cbForEnsure={value => {
                    if (!value) return;

                    const { data } = this.state;
                    const { form } = this.props;
                    const nextData = data.map(i => {
                      i.code = value;
                      return i;
                    });
                    this.setState(
                      {
                        data: nextData,
                      },
                      () => {
                        const { materialList } = form.getFieldsValue() || {};
                        const _data = materialList.map(j => {
                          j.code = value;
                          return j;
                        });
                        form.setFieldsValue({ materialList: _data });
                      },
                    );
                  }}
                />
              ),
              footer: null,
            });
          }}
          style={{ marginLeft: 5, color: primary, cursor: 'pointer' }}
        >
          选择全部
        </span>
      </div>
    );
  };

  setAllForSourceWareHouse = () => {
    return (
      <div>
        <span>发出仓库</span>
        <span
          onClick={() => {
            openModal({
              title: '选择全部',
              children: (
                <SelectForSourceWarehouse
                  cbForEnsure={value => {
                    if (!value) return;

                    const { key: sourceWarehouseCode, label: sourceWarehouseName } = value || {};
                    const { data } = this.state;
                    const { form } = this.props;
                    const nextData = data.map(i => {
                      i.sourceWarehouseCode = sourceWarehouseCode || null;
                      i.sourceWarehouseName = sourceWarehouseName || null;
                      return i;
                    });
                    this.setState(
                      {
                        data: nextData,
                      },
                      () => {
                        const { materialList } = form.getFieldsValue() || {};
                        const _data = materialList.map(j => {
                          j.sourceWarehouse = sourceWarehouseCode
                            ? { key: sourceWarehouseCode, label: sourceWarehouseName }
                            : undefined;
                          return j;
                        });
                        form.setFieldsValue({ materialList: _data });
                      },
                    );
                  }}
                />
              ),
              footer: null,
            });
          }}
          style={{ marginLeft: 5, color: primary, cursor: 'pointer' }}
        >
          选择全部
        </span>
      </div>
    );
  };

  setAllForTargetStorage = () => {
    return (
      <div>
        <span>目标仓位</span>
        <span
          onClick={() => {
            openModal({
              title: '选择全部',
              children: (
                <SelectForTargetStorage
                  cbForEnsure={value => {
                    if (!value) return;

                    const targetStorageId = value ? value.split(',')[0] : null;
                    const targetStorageName = value ? value.split(',')[3] : null;
                    const targetStorageCode = value ? value.split(',')[1] : null;
                    const targetStorage = targetStorageId ? `${targetStorageId},${targetStorageCode},3` : null;

                    const { data } = this.state;
                    const { form } = this.props;
                    const nextData = data.map(i => {
                      i.targetStorageId = targetStorageId;
                      i.targetStorageName = targetStorageName;
                      i.targetStorageCode = targetStorageCode;
                      i.targetStorage = `${targetStorageId},${targetStorageCode},3`;
                      return i;
                    });

                    this.setState(
                      {
                        data: nextData,
                      },
                      () => {
                        const { materialList } = form.getFieldsValue() || {};
                        const _data = materialList.map(j => {
                          j.targetStorage = targetStorage || undefined;
                          return j;
                        });
                        form.setFieldsValue({ materialList: _data });
                      },
                    );
                  }}
                />
              ),
              footer: null,
            });
          }}
          style={{ marginLeft: 5, color: primary, cursor: 'pointer' }}
        >
          选择全部
        </span>
      </div>
    );
  };

  setAllForRequireTime = () => {
    return (
      <div>
        <span>需求时间</span>
        <span
          onClick={() => {
            openModal({
              title: '选择全部',
              children: (
                <SelectForRequireTime
                  cbForEnsure={value => {
                    if (!value) return;

                    const time = value ? moment(value) : null;
                    const { data } = this.state;
                    const { form } = this.props;
                    const nextData = data.map(i => {
                      i.requireTime = time;
                      return i;
                    });
                    this.setState(
                      {
                        data: nextData,
                      },
                      () => {
                        const { materialList } = form.getFieldsValue() || {};
                        const _data = materialList.map(j => {
                          j.requireTime = time || undefined;
                          return j;
                        });
                        form.setFieldsValue({ materialList: _data });
                      },
                    );
                  }}
                />
              ),
              footer: null,
            });
          }}
          style={{ marginLeft: 5, color: primary, cursor: 'pointer' }}
        >
          选择全部
        </span>
      </div>
    );
  };

  getColumns = () => {
    const { form, notMerge, isMergeStepOne, isMergeStepTwo } = this.props;
    const { getFieldDecorator } = form || {};

    let columns = [
      {
        title: '物料编号/名称',
        width: 150,
        key: 'material',
        render: (__, record) => {
          const { key, material } = record;
          const { code, name } = material || {};
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].material`, {
                rules: [
                  {
                    required: true,
                    message: '物料必填',
                  },
                ],
                initialValue: material,
              })(<span>{`${code || replaceSign}/${name || replaceSign}`}</span>)}
            </FormItem>
          );
        },
      },

      {
        title: '数量',
        width: 130,
        key: 'planAmount',
        render: (__, record) => {
          const { key, material, amount } = record;
          const { unitName } = material || {};

          return (
            <div style={{ whiteSpace: 'nowrap' }}>
              <FormItem style={{ display: 'inline-block', marginRight: 10 }}>
                {getFieldDecorator(`materialList[${key}].amount`, {
                  rules: [
                    {
                      required: true,
                      message: '计划数必填',
                    },
                  ],
                  initialValue: amount,
                })(<span>{amount || replaceSign}</span>)}
                <span style={{ marginLeft: 10 }}>{unitName || replaceSign}</span>
              </FormItem>
            </div>
          );
        },
      },
      {
        title: isMergeStepTwo ? '目标仓位' : <span>{this.setAllForTargetStorage()}</span>,
        width: 180,
        key: 'targetStorage',
        render: (__, record) => {
          const { key, targetStorageId, targetStorageName, targetStorageCode } = record || {};

          if (isMergeStepTwo) {
            return (
              <div>
                {getFieldDecorator(`materialList[${key}].targetStorage`, {
                  initialValue: `${targetStorageId},${targetStorageCode},3`,
                })(<span>{`${targetStorageName || replaceSign}`}</span>)}
              </div>
            );
          }

          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].targetStorage`, {
                rules: [
                  {
                    required: true,
                    message: '目标仓位必填',
                  },
                ],
                initialValue: targetStorageId ? `${targetStorageId},${targetStorageCode},3` : undefined,
              })(<SingleStorageSelect cascaderStyle={{ height: '100%', display: 'block' }} style={{ width: 150 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: isMergeStepTwo ? '发出仓库' : <span>{this.setAllForSourceWareHouse()}</span>,
        width: 180,
        key: 'sourceWareHouse',
        render: (__, record) => {
          const { key, sourceWarehouseName, sourceWarehouseCode } = record || {};

          if (isMergeStepTwo) {
            return (
              <div>
                {getFieldDecorator(`materialList[${key}].sourceWarehouse`, {
                  initialValue: sourceWarehouseCode
                    ? { label: sourceWarehouseName, key: sourceWarehouseCode }
                    : undefined,
                })(<span>{`${sourceWarehouseName || replaceSign}`}</span>)}
              </div>
            );
          }

          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].sourceWarehouse`, {
                rules: [
                  {
                    required: true,
                    message: '发出仓库必填',
                  },
                ],
                onChange: value => {
                  this.setState(({ data }) => {
                    const nextData = data.map(i => {
                      if (i && i.key === key) {
                        i.sourceWarehouseCode = value ? value.key : null;
                      }
                      return i;
                    });
                    return {
                      data: nextData,
                    };
                  });
                },
                initialValue: sourceWarehouseCode
                  ? { label: sourceWarehouseName, key: sourceWarehouseCode }
                  : undefined,
              })(<SearchSelect style={{ width: 150 }} params={{ status: 1 }} type={'wareHouseWithCode'} />)}
            </FormItem>
          );
        },
      },
      {
        title: isMergeStepOne ? (
          renderTooltip('需求时间', '符合合并规则的物料需求时间会统一为最早的时候')
        ) : (
          <span>{this.setAllForRequireTime()}</span>
        ),
        width: 180,
        key: 'requireTime',
        render: (__, record) => {
          const { key, requireTime } = record;
          return (
            <FormItem>
              {getFieldDecorator(`materialList[${key}].requireTime`, {
                rules: [
                  {
                    required: true,
                    message: '需求时间必填',
                  },
                ],
                initialValue: requireTime || undefined,
              })(<DatePicker format={'YYYY-MM-DD HH:mm'} showTime={{ format: 'HH:mm' }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '可用库存',
        width: 100,
        key: 'storageAmount',
        render: (__, record) => {
          const { key, availableAmount, material, sourceWarehouseCode } = record || {};
          const { code, unitId } = material || {};

          this.setAvailableAmount(key, code, unitId, sourceWarehouseCode);

          return <span>{typeof availableAmount === 'number' ? availableAmount : replaceSign}</span>;
        },
      },
    ];
    if (includeOrganizationConfig(ORGANIZATION_CONFIG.configMaterialTransferDisplayUnit)) {
      columns.push({
        title: 'BOM配比',
        key: 'bom',
        dataIndex: 'ratio',
        width: 150,
        render: (ratio, record) => {
          const { key, ratioList } = record;
          const { amount, unitName, unitId } = ratio || {};
          getFieldDecorator(`materialList[${key}].ratio.amount`, {
            initialValue: amount,
          });
          getFieldDecorator(`materialList[${key}].ratio.unitId`, {
            initialValue: unitId,
          });
          if (isMergeStepTwo) {
            if (arrayIsEmpty(ratioList)) {
              return replaceSign;
            }
            return (
              <Select
                style={{ width: 150 }}
                defaultValue={ratio ? `${amount}-${unitId}` : undefined}
                onChange={value => {
                  if (!value) {
                    form.setFieldsValue({ ratio: undefined });
                    return;
                  }
                  const [amount, unitId] = value.split('-');
                  form.setFieldsValue({ ratio: { amount, unitId } });
                }}
              >
                {ratioList.map(({ amount, unitId, unitName }) => (
                  <Option value={`${amount}-${unitId}`}>
                    {amount}
                    {unitName}
                  </Option>
                ))}
              </Select>
            );
          } else if (!ratio) {
            return replaceSign;
          }
          return `${amount}${unitName}`;
        },
      });
    }
    columns = columns.concat([
      {
        title: '任务编号',
        key: 'taskCode',
        width: 120,
        render: (__, record) => {
          const { tasks, key } = record || {};
          const taskCodes = Array.isArray(tasks)
            ? tasks
                .map(i => {
                  const { taskCode } = i;
                  return taskCode;
                })
                .filter(i => i)
            : [];
          return (
            <div>
              {getFieldDecorator(`materialList[${key}].taskCodes`, {
                initialValue: taskCodes,
              })(<span>{Array.isArray(taskCodes) && taskCodes.length ? taskCodes.join(',') : replaceSign}</span>)}
            </div>
          );
        },
      },
    ]);

    // 不合并的时候显示工单号和工序
    if (notMerge) {
      const _Columns = [
        {
          title: '工单号',
          key: 'workOrder',
          width: 120,
          render: (__, record) => {
            const { tasks } = record || {};
            const { workOrderCode } = Array.isArray(tasks) ? tasks[0] : {};
            return <span>{workOrderCode || replaceSign}</span>;
          },
        },
        {
          title: '工序',
          key: 'process',
          width: 120,
          render: (__, record) => {
            const { tasks } = record || {};
            const { processCode, processName } = Array.isArray(tasks) ? tasks[0] : {};
            return <span>{`${processCode}/${processName}` || replaceSign}</span>;
          },
        },
      ];
      columns = [...columns, ..._Columns];
    }

    // 不合并和合并第二步显示编号, 行备注
    if (notMerge || isMergeStepTwo) {
      columns.unshift({
        title: this.setAllForCode(),
        width: 180,
        key: 'seq',
        render: (__, record, index) => {
          const { key, code } = record || {};

          return (
            <div style={{ paddingBottom: 10 }}>
              {getFieldDecorator(`materialList[${key}].code`, {
                rules: [
                  requiredRule('编号'),
                  {
                    validator: codeFormatValidate,
                  },
                  {
                    validator: lengthValidate(null, 20),
                  },
                ],
                initialValue: code,
              })(<Input style={{ width: 150 }} />)}
            </div>
          );
        },
      });
      columns.push({
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
      });
    }
    return columns;
  };

  // 设置可用库存值
  setAvailableAmount = (key, materialCode, unitId, sourceWarehouseCode) => {
    if (!materialCode || !unitId || !sourceWarehouseCode) return;

    getAvailableAmount({
      unitId,
      materialCode,
      warehouseCode: sourceWarehouseCode,
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

  render() {
    const { data } = this.state;
    const columns = this.getColumns();

    return (
      <div ref={this.tableInst}>
        <Table
          style={{ margin: 0, width: window.outerWidth - 340 }}
          scroll={{ y: 280, x: 1700 }}
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
  tableData: PropTypes.any,
  isMergeStepOne: PropTypes.bool, // 合并第一步
  isMergeStepTwo: PropTypes.bool, // 合并第二步
  notMerge: PropTypes.bool, // 不合并
};

export default MaterialListForm;
