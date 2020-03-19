import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from 'antd';
import _ from 'lodash';

import { openModal, Input, FormItem, RestPagingTable, Icon } from 'src/components/index';
import { red, primary } from 'src/styles/color/index';
import SearchSelect from 'src/components/select/searchSelect';
import MaterialUnitSelect from 'src/components/select/materialUnitSelect';
import { replaceSign } from 'src/constants';
import { lengthValidate, amountValidator } from 'src/components/form/index';
import { queryMaterialDetail } from 'src/services/bom/material';
import log from 'src/utils/log';
import moment from 'src/utils/time';
import { getUsefulStorage, transformAmount } from 'src/containers/deliveryRequest/util';
import { Big } from 'src/utils/number';
import { changeTextLanguage } from 'src/utils/locale/utils';

import PurchaseOrderList from './purchaseOrderList';
import styles from './styles.scss';

let KEY = 0;

class MaterialListForm extends Component {
  state = {
    hideScroll: false,
    data: [
      {
        key: KEY,
      },
    ],
  };

  componentDidMount() {
    const { isEdit } = this.props;
    if (isEdit) {
      this.setInitialData(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialData, this.props.initialData) && nextProps.isEdit) {
      this.setInitialData(nextProps);
    }
    if (!_.isEqual(nextProps.wareHouseId, this.props.wareHouseId)) {
      const { wareHouseId } = nextProps;
      const { data } = this.state;
      this.changeDataUsefulStorage(data, wareHouseId);
    }
  }

  setInitialData = props => {
    const { initialData, wareHouseId } = props || this.props;
    if (Array.isArray(initialData) && initialData.length) {
      const data = initialData.map(i => {
        const { requestItem } = i || {};
        const {
          materialCode,
          materialName,
          materialUnit,
          unitId,
          purchaseOrderCode,
          purchaseLineNo,
          remark,
          deliveryTime,
          customerName,
          customerId,
          amountPlan,
          productionBatch,
        } = requestItem || {};
        return {
          key: (KEY += 1),
          materialName,
          materialCode,
          materialUnit: materialUnit && unitId ? { label: materialUnit, key: unitId } : null,
          purchaseOrderCode,
          purchaseLineNo,
          remark,
          deliveryTime: deliveryTime ? moment(deliveryTime) : null,
          customer: customerName && customerId ? { key: customerId, label: customerName } : null,
          amountPlan,
          productionBatch,
        };
      });
      this.changeDataUsefulStorage(data, wareHouseId);
    }
  };

  onChangeForMaterial = async (value, key) => {
    const code = _.get(value, 'key');
    const { wareHouseId } = this.props;
    try {
      const res = await queryMaterialDetail(code);
      const usefulStorage = await getUsefulStorage(code, wareHouseId);
      const { unitId, unitName } = _.get(res, 'data.data') || {};
      const { data } = this.state;
      this.setState({
        data: data.map(i => {
          if (i && i.key === key) {
            i.materialUnit = { key: unitId, label: unitName };
            i.materialCode = code;
            i.materialAmountInWareHouse = usefulStorage;
          }
          return i;
        }),
      });
    } catch (e) {
      log.error(e);
    }
  };

  // 改变state中data的可用库存
  changeDataUsefulStorage = async (data, wareHouseId) => {
    if (Array.isArray(data) && data.length) {
      Promise.all(
        data.map(async i => {
          const { materialCode, ...rest } = i || {};
          const usefulStorage = await getUsefulStorage(materialCode, wareHouseId);
          return {
            materialCode,
            ...rest,
            materialAmountInWareHouse: usefulStorage,
          };
        }),
      ).then(data => {
        this.setState({ data });
      });
    }
  };

  onChangeForMaterialUnit = (value, key) => {
    const { data } = this.state;
    this.setState({
      data: data.map(i => {
        if (i && i.key === key) {
          i.materialUnit = value;
        }
        return i;
      }),
    });
  };

  getColumns = () => {
    const { form, isEdit } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;

    return [
      {
        title: '编号',
        intlId: 'key3005',
        width: 100,
        key: 'seq',
        render: (__, record, index) => {
          const key = _.get(record, 'key');
          return (
            <div>
              {getFieldDecorator(`materialList[${key}].sequence`, { initialValue: index + 1 })(
                <div>
                  <Icon
                    onClick={() => {
                      this.deleteMaterial(key);
                    }}
                    type={'minus-circle'}
                    style={{ color: red }}
                  />
                  <span style={{ marginLeft: 5 }}>{index + 1}</span>
                </div>,
              )}
            </div>
          );
        },
      },
      {
        title: '物料编号/名称',
        width: 250,
        key: 'material',
        intlId: 'key1669',
        render: (__, record) => {
          const { key, materialCode, materialName, purchaseOrderCode } = record || {};

          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialList[${key}].materialCode`, {
                  rules: [
                    {
                      required: true,
                      message: changeChineseToLocale('物料必选'),
                    },
                  ],
                  onChange: async value => {
                    await this.onChangeForMaterial(value, key);
                  },
                  initialValue:
                    materialName && materialCode
                      ? { label: `${materialCode}/${materialName}`, key: materialCode }
                      : undefined,
                })(
                  <SearchSelect
                    style={{ width: 200 }}
                    disabled={purchaseOrderCode}
                    params={{ status: 1 }}
                    type={'materialBySearch'}
                  />,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '本次执行次数',
        width: 150,
        key: 'amount',
        intlId: 'key212',
        render: (__, record) => {
          const { key, amountPlan } = record || {};
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialList[${key}].amountPlan`, {
                  initialValue: typeof amountPlan === 'number' ? amountPlan : undefined,
                  rules: [
                    {
                      validator: amountValidator(null, {
                        value: '0',
                        message: changeChineseToLocale('执行次数必须大于0'),
                        equal: false,
                      }),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '物料单位',
        width: 150,
        intlId: 'key879',
        key: 'unit',
        render: (__, record) => {
          const { key, materialUnit, materialCode, purchaseOrderCode } = record;
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialList[${key}].materialUnit`, {
                  initialValue: materialUnit || undefined,
                  onChange: value => {
                    this.onChangeForMaterialUnit(value, key);
                  },
                })(<MaterialUnitSelect params={{ materialCode }} disabled={!!purchaseOrderCode} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '可用库存',
        width: 150,
        key: 'storage',
        intlId: 'key3173',
        render: (__, record) => {
          const { materialAmountInWareHouse: material, materialUnit } = record || {};
          const materialUnitId = _.get(materialUnit, 'key');

          return <div>{transformAmount(material, materialUnitId) || replaceSign}</div>;
        },
      },
      {
        title: '可用库存单位',
        width: 150,
        key: 'unit2',
        intlId: 'key339',
        render: (__, record) => {
          const { materialUnit } = record;
          return <div>{materialUnit ? materialUnit.label : replaceSign}</div>;
        },
      },
      isEdit
        ? {
            title: '生产批次',
            width: 150,
            key: 'productBatch',
            render: (__, record) => {
              const { key, productionBatch } = record || {};
              return (
                <FormItem>
                  {getFieldDecorator(`materialList[${key}].productionBatch`, {
                    initialValue: productionBatch || undefined,
                  })(<Input />)}
                </FormItem>
              );
            },
          }
        : null,
      {
        title: '销售订单',
        width: 150,
        intlId: 'key828',
        key: 'purchaseOrder',
        render: (__, record) => {
          const { purchaseOrderCode, key, purchaseLineNo } = record || {};
          return (
            <div>
              {getFieldDecorator(`materialList[${key}].purchaseLineNo`, { initialValue: purchaseLineNo || undefined })(
                <div />,
              )}
              {getFieldDecorator(`materialList[${key}].purchaseOrderCode`, {
                initialValue: purchaseOrderCode || undefined,
              })(<div>{purchaseOrderCode || replaceSign}</div>)}
            </div>
          );
        },
      },
      {
        title: '客户',
        width: 150,
        key: 'customer',
        intlId: 'key781',
        render: (__, record) => {
          const { key, customer, purchaseOrderCode } = record || {};
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialList[${key}].customer`, {
                  initialValue: customer || undefined,
                })(<SearchSelect type={'customer'} params={{ status: 1 }} disabled={!!purchaseOrderCode} />)}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '交货时间',
        width: 150,
        key: 'time',
        intlId: 'key2335',
        render: (__, record) => {
          const { key, deliveryTime } = record || {};
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialList[${key}].deliveryTime`, { initialValue: deliveryTime || moment() })(
                  <DatePicker />,
                )}
              </FormItem>
            </div>
          );
        },
      },
      {
        title: '备注',
        width: 150,
        key: 'remark',
        intlId: 'key1079',
        render: (__, record) => {
          const { remark, key } = record || {};
          return (
            <div>
              <FormItem>
                {getFieldDecorator(`materialList[${key}].remark`, {
                  rules: [
                    {
                      validator: lengthValidate(0, 50),
                    },
                  ],
                  initialValue: remark || undefined,
                })(<Input />)}
              </FormItem>
            </div>
          );
        },
      },
    ].filter(i => i);
  };

  renderFooter = () => {
    const { wareHouseId } = this.props;
    const { intl } = this.context;
    const { data: stateData } = this.state;

    return (
      <div>
        <div
          style={{ display: 'inline-block', color: primary, cursor: 'pointer' }}
          onClick={() => {
            this.setState({ hideScroll: true }, () => {
              openModal({
                context: this.context,
                title: changeTextLanguage(intl, { id: 'key1890', defaultMessage: '按销售订单添加物料' }),
                footer: null,
                children: (
                  <PurchaseOrderList
                    cbForSure={data => {
                      const _data = data.map(i => {
                        const { customer, materialInfo, purchaseOrderCode } = i || {};
                        const {
                          amount,
                          amountDone,
                          amountRetrieve,
                          materialCode,
                          materialName,
                          unitName,
                          unitId,
                          id: lineId,
                          targetDate,
                        } = materialInfo || {};
                        const { id, name, code } = customer || {};

                        return {
                          key: (KEY += 1),
                          materialCode,
                          materialName,
                          materialUnit: unitId && unitName ? { key: unitId, label: unitName } : undefined,
                          purchaseOrderCode,
                          purchaseLineNo: lineId,
                          customer: id && name ? { key: id, label: `${name}/${code || '无编号'}` } : undefined,
                          deliveryTime: targetDate ? moment(targetDate) : undefined,
                          amountPlan: Big(amount)
                            .minus(amountDone)
                            .plus(amountRetrieve)
                            .valueOf(),
                        };
                      });

                      let nextStateData = stateData;

                      if (Array.isArray(stateData) && stateData.length === 1 && !stateData[0].materialCode) {
                        nextStateData = _data;
                      } else {
                        nextStateData = stateData.concat(_data);
                      }

                      this.changeDataUsefulStorage(nextStateData, wareHouseId);
                    }}
                    showScroll={() => {
                      this.setState({ hideScroll: false });
                    }}
                  />
                ),
              });
            });
          }}
        >
          <Icon type={'plus-circle-o'} />
          <span style={{ marginLeft: 5 }}>
            {changeTextLanguage(intl, { id: 'key1890', defaultMessage: '按销售订单添加物料' })}
          </span>
        </div>
        <div
          style={{ display: 'inline-block', color: primary, cursor: 'pointer', marginLeft: 20 }}
          onClick={() => {
            this.addMaterial();
          }}
        >
          <Icon type={'plus-circle-o'} />
          <span style={{ marginLeft: 5 }}>
            {changeTextLanguage(intl, { id: 'key472', defaultMessage: '手动添加物料' })}
          </span>
        </div>
      </div>
    );
  };

  addMaterial = () => {
    this.setState(({ data }) => {
      return {
        data: data.concat({ key: (KEY += 1) }),
      };
    });
  };

  deleteMaterial = key => {
    this.setState(({ data }) => {
      return {
        data: data.filter(i => i && i.key !== key),
      };
    });
  };

  render() {
    const { data, hideScroll } = this.state;
    const columns = this.getColumns();

    if (hideScroll) {
      return (
        <div key={'1'} className={styles.materialListForm}>
          <RestPagingTable
            scroll={{ x: true, y: 400 }}
            style={{ width: 840, margin: 0 }}
            columns={columns}
            dataSource={data}
            pagination={false}
            footer={this.renderFooter}
          />
        </div>
      );
    }
    return (
      <div key={'2'}>
        <RestPagingTable
          scroll={{ x: true, y: 400 }}
          style={{ width: 840, margin: 0 }}
          columns={columns}
          dataSource={data}
          pagination={false}
          footer={this.renderFooter}
        />
      </div>
    );
  }
}

MaterialListForm.propTypes = {
  style: PropTypes.object,
  isEdit: PropTypes.bool,
  initialData: PropTypes.array,
  wareHouseId: PropTypes.number,
};

MaterialListForm.contextTypes = {
  intl: PropTypes.any,
  changeChineseToLocale: PropTypes.any,
};

export default MaterialListForm;
