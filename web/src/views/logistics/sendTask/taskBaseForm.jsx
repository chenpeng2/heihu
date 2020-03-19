import React from 'react';
import { Button, DatePicker, FormItem, Icon, Input, Link, SimpleTable, Textarea, message } from 'components';
import SearchSelect from 'components/select/searchSelect';
import _ from 'lodash';
import { checkPositiveInteger } from 'components/form';
import { createSendTaskDetail, editSendTaskDetail, getEditSendTaskDetail } from 'services/shipment/sendTask';
import { round } from 'utils/number';
import Colors from 'styles/color';
import { formatToUnix, formatUnixMoment } from 'utils/time';
import { revertRules } from '../receiptTask/taskBaseForm';
import CarSelect, { validatorSelectLabelLength } from '../component/CarSelect';
import checkItemStyles from '../receiptConfig/checkItem.scss';
import WorkStorageSelect from '../component/WorkStorageSelect';
import commonStyles from '../index.scss';

const formItemStyle = {
  width: 300,
};

const initialState = {
  dataSource: [{ key: 0 }],
  packageDataSource: [],
  unit: null,
  warehouseCode: '',
  warehouseId: '',
  needWarnWhenEditMaterial: false,
  onSubmit: false,
};

class TaskBaseForm extends React.PureComponent<any> {
  state = initialState;

  componentDidMount() {
    this.setInitialData();
  }

  setInitialData = async () => {
    const { edit, match: { params: { id } }, form: { setFieldsValue } } = this.props;
    if (edit) {
      const { data: { data } } = await getEditSendTaskDetail(id);
      const {
        categoryId,
        categoryName,
        no,
        reservedTime,
        carrier,
        plateNo,
        driver,
        driverTelephone,
        parkingSpace,
        materials,
        needWarnWhenEditMaterial,
        warehouse,
        customer,
        saleCustomer,
        saleCustomerList,
        packageMaterials,
        customerList,
        ...rest
      } = data;
      this.setState(
        {
          warehouseCode: warehouse.code,
          warehouseId: warehouse.id,
          needWarnWhenEditMaterial,
          unit: {
            name: materials[0].materialInfo.unit,
          },
          dataSource: materials.map(
            ({ materialInfo: { code, name, unit, unitCount, masterUnit, masterUnitCount } }, index) => ({
              key: index,
              material: {
                unitName: masterUnit,
                unitConversions: [{ masterUnitCount, slaveUnitCount: unitCount, slaveUnitName: unit }],
              },
            }),
          ),
          packageDataSource:
            packageMaterials &&
            packageMaterials.map(({ materialInfo: { code, masterUnit, name } }, index) => ({
              key: index,
              material: {
                unitName: masterUnit,
              },
            })),
        },
        () => {
          setFieldsValue({
            ...rest,
            categoryId: { key: categoryId, label: categoryName },
            no,
            reservedTime: formatUnixMoment(reservedTime),
            carrier: { key: 'user-defined', label: carrier },
            plateNo: { key: 'user-defined', label: plateNo },
            driver: { key: 'user-defined', label: driver },
            driverTelephone,
            parkingSpace: { key: 'user-defined', label: parkingSpace },
            customerIdList: customerList && customerList.map(({ id, name }) => ({ key: id, label: name })),
            saleCustomerIdList: saleCustomerList && saleCustomerList.map(({ id, name }) => ({ key: id, label: name })),
            materials: materials.map(({ materialInfo: { code, name }, planAmount, storages }) => ({
              materialCode: {
                key: code,
                label: name,
              },
              amount: planAmount,
              storageIds: storages && storages.map(({ id, name }) => ({ label: name, value: id })),
            })),
            packageMaterials: packageMaterials.map(({ materialInfo: { code, name }, planAmount, storages }) => ({
              materialCode: {
                key: code,
                label: name,
              },
              amount: planAmount,
              storageIds: storages && storages.map(({ id, name }) => ({ label: name, value: id })),
            })),
          });
        },
      );
    }
  };

  resetData = () => {
    this.setState({ ...initialState }, () => {
      this.props.form.resetFields();
    });
  };

  getColumns = () => {
    const { form: { getFieldDecorator, getFieldValue }, edit } = this.props;
    const { packageDataSource, dataSource, unit, warehouseCode } = this.state;
    const selectedMaterial = packageDataSource.concat(dataSource).map(({ material }) => {
      return material && material.code;
    });
    const columns = [
      {
        title: '物料编号|物料名称',
        render: (text, { key }) => (
          <div>
            <Icon
              style={{ display: dataSource.length <= 1 ? 'none' : 'flex' }}
              type="minus-circle"
              className={checkItemStyles.removeIcon}
              onClick={() => {
                this.setState(
                  {
                    dataSource: dataSource.filter(({ key: mapKey }) => mapKey !== key),
                  },
                  () => {
                    this.forceUpdate();
                  },
                );
              }}
            />
            <FormItem>
              {getFieldDecorator(`materials[${key}].materialCode`, {
                rules: [{ required: true, message: '不能为空' }],
              })(
                <SearchSelect
                  loadOnFocus
                  type="materialBySearch"
                  style={{ width: 250 }}
                  params={{ status: 1 }}
                  handleData={data => {
                    return data.map(node => ({
                      ...node,
                      disabled: selectedMaterial.indexOf(node.key) !== -1,
                    }));
                  }}
                  onSelect={(value, option) => {
                    this.setState({
                      dataSource: dataSource.map(record => {
                        if (record.key === key) {
                          return { ...record, material: option.props.data };
                        }
                        return record;
                      }),
                    });
                  }}
                />,
              )}
            </FormItem>
          </div>
        ),
      },
      {
        title: '数量',
        render: (text, { key }) => (
          <div style={{ display: 'flex' }}>
            <FormItem>
              {getFieldDecorator(`materials[${key}].amount`, {
                rules: [{ validator: checkPositiveInteger() }],
              })(<Input />)}
            </FormItem>
            <span style={{ lineHeight: '40px', marginLeft: 20 }}>{unit && unit.name}</span>
          </div>
        ),
      },
      {
        title: '转换数量',
        dataIndex: 'material',
        key: 'convert',
        render: (material, { key }) => {
          let text = '-';
          if (unit) {
            if (unit.name === (material && material.unitName)) {
              text = `${getFieldValue(`materials[${key}].amount`) || ''} ${unit.name}`;
            } else {
              const unitIndex = _.findIndex(material && material.unitConversions, o => o.slaveUnitName === unit.name);
              if (unitIndex !== -1) {
                const convertUnit = material.unitConversions[unitIndex];
                text = `${convertUnit.masterUnitCount} ${material.unitName} = ${convertUnit.slaveUnitCount} ${
                  convertUnit.slaveUnitName
                }`;
              } else {
                text = <span style={{ color: Colors.error }}>未配比</span>;
              }
            }
          }
          return <span className={commonStyles.itemLineHeight}>{text}</span>;
        },
      },
      {
        title: '总数量',
        dataIndex: 'material',
        key: 'amount',
        render: (material, { key }) => {
          let text = '-';
          if (unit) {
            if (unit.name === (material && material.unitName)) {
              text = `${getFieldValue(`materials[${key}].amount`) || ''}${unit.name}`;
            } else {
              const unitIndex = _.findIndex(material && material.unitConversions, o => o.slaveUnitName === unit.name);
              if (unitIndex !== -1) {
                const convertUnit = material.unitConversions[unitIndex];
                const value =
                  parseInt(getFieldValue(`materials[${key}].amount`) || 0, 10) *
                  (convertUnit.masterUnitCount / convertUnit.slaveUnitCount);
                text = (
                  <span style={{ color: Number.isInteger(value) ? 'inherit' : Colors.error }}>
                    {`${round(value, 6)} ${material.unitName}`}
                  </span>
                );
              } else {
                text = <span style={{ color: Colors.error }}>未配比</span>;
              }
            }
          }
          return <span className={commonStyles.itemLineHeight}>{text}</span>;
        },
      },
    ];
    if (edit) {
      columns.push({
        title: '发运货位',
        render: (text, { key }) => (
          <FormItem>
            {getFieldDecorator(`materials[${key}].storageIds`)(<WorkStorageSelect code={warehouseCode} />)}
          </FormItem>
        ),
      });
    }
    return columns;
  };
  getPackageMaterialColumns = () => {
    const { form: { getFieldDecorator }, edit } = this.props;
    const { packageDataSource, dataSource, warehouseCode } = this.state;
    const selectedMaterial = dataSource.concat(packageDataSource).map(({ material }) => {
      return material && material.code;
    });
    const columns = [
      {
        title: '载具物料',
        key: 'materialCode',
        render: (materialCode, { key }) => (
          <div>
            <Icon
              style={{ display: 'flex' }}
              type="minus-circle"
              className={checkItemStyles.removeIcon}
              onClick={() => {
                this.setState(
                  {
                    packageDataSource: packageDataSource.filter(({ key: mapKey }) => mapKey !== key),
                  },
                  () => {
                    this.forceUpdate();
                  },
                );
              }}
            />
            <FormItem>
              {getFieldDecorator(`packageMaterials[${key}].materialCode`, {
                rules: [{ required: true, message: '物料必填' }],
              })(
                <SearchSelect
                  style={{ width: 250 }}
                  type="materialBySearch"
                  loadOnFocus
                  params={{ status: 1 }}
                  handleData={data => {
                    return data.map(node => ({
                      ...node,
                      disabled: selectedMaterial.indexOf(node.key) !== -1,
                    }));
                  }}
                  onSelect={(value, option) => {
                    this.setState({
                      packageDataSource: packageDataSource.map(record => {
                        if (record.key === key) {
                          return { ...record, material: option.props.data };
                        }
                        return record;
                      }),
                    });
                  }}
                />,
              )}
            </FormItem>
          </div>
        ),
      },
      {
        title: '数量',
        key: 'amount',
        render: (text, { key }, index) => {
          return (
            <div style={{ display: 'flex' }}>
              <FormItem>
                {getFieldDecorator(`packageMaterials[${key}].amount`, {
                  rules: [{ validator: checkPositiveInteger() }],
                })(<Input />)}
              </FormItem>
              <span style={{ lineHeight: '40px', marginLeft: 20 }}>
                {_.get(packageDataSource, `[${index}].material.unitName`)}
              </span>
            </div>
          );
        },
      },
    ];
    if (edit) {
      columns.push({
        title: '发运货位',
        render: (text, { key }) => (
          <FormItem>
            {getFieldDecorator(`packageMaterials[${key}].storageIds`)(<WorkStorageSelect code={warehouseCode} />)}
          </FormItem>
        ),
      });
    }
    return columns;
  };

  submit = callback => {
    this.setState({ onSubmit: true });
    const { form, edit, match: { params: { id } }, history: { push } } = this.props;
    form.validateFieldsAndScroll(async (err, values) => {
      if (err) {
        this.setState({ onSubmit: false });
        return;
      }
      const {
        categoryId,
        no,
        reservedTime,
        carrier,
        driver,
        driverTelephone,
        plateNo,
        parkingSpace,
        materials,
        customerIdList,
        saleCustomerIdList,
        packageMaterials,
        ...rest
      } = values;
      const submitValue = {
        ...rest,
        categoryId: categoryId.key,
        no,
        reservedTime: formatToUnix(reservedTime),
        carrier: carrier.label,
        driver: driver.key === 'user-defined' ? driver.label : JSON.parse(driver.key).name,
        driverTelephone,
        plateNo: plateNo.key === 'user-defined' ? plateNo.label : JSON.parse(plateNo.key).code,
        parkingSpace: parkingSpace && (parkingSpace.key === 'user-defined' ? parkingSpace.label : parkingSpace.label),
        customerIdList: customerIdList && customerIdList.map(({ key }) => ({ id: key })),
        saleCustomerIdList: saleCustomerIdList && saleCustomerIdList.map(({ key }) => ({ id: key })),
        materials:
          materials &&
          materials.filter(o => o).map(({ materialCode, amount, storageIds }) => ({
            materialCode: materialCode.key,
            amount,
            storageIds: storageIds ? storageIds.map(({ value }) => value) : [],
          })),
        packageMaterials:
          packageMaterials &&
          packageMaterials.filter(o => o).map(({ materialCode, amount, storageIds }) => ({
            materialCode: materialCode.key,
            amount,
            storageIds: storageIds ? storageIds.map(({ value }) => value) : [],
          })),
      };
      if (edit) {
        await editSendTaskDetail(id, submitValue);
        push(`/logistics/send-task/detail/${id}`);
      } else {
        const { data: { data } } = await createSendTaskDetail(submitValue);
        if (typeof callback === 'function') {
          callback();
        } else {
          push(`/logistics/send-task/detail/${data}`);
        }
      }
      message.success('操作成功!');
    });
  };

  render() {
    const {
      breadcrumbName,
      form: { getFieldDecorator, setFieldsValue, resetFields, getFieldValue },
      edit,
    } = this.props;
    const { dataSource, needWarnWhenEditMaterial, warehouseId, packageDataSource, onSubmit } = this.state;
    const selectedCarrierId = getFieldValue('carrier') && getFieldValue('carrier').key;
    const items = [
      {
        label: '发运类型',
        name: 'categoryId',
        rules: { required: true },
        component: (
          <SearchSelect
            style={formItemStyle}
            type="sendCategory"
            onSelect={(value, option) => {
              const { unit, warehouse: { code } } = option.props.data;
              this.setState({ unit, warehouseCode: code });
            }}
          />
        ),
      },
      {
        label: '负载号',
        name: 'no',
        rules: { required: true, max: 30 },
        component: <Input style={formItemStyle} />,
      },
      {
        label: '交货单号',
        name: 'deliveringCode',
        rules: { required: true, max: 30 },
        component: <Input style={formItemStyle} />,
      },
      {
        label: '销售订单',
        name: 'purchaseCode',
        rules: { required: true, max: 30 },
        component: <Input style={formItemStyle} />,
      },
      {
        label: '预约时间',
        name: 'reservedTime',
        component: <DatePicker style={formItemStyle} format="YYYY-MM-DD HH:mm" showTime />,
      },
      {
        label: '车牌号',
        name: 'plateNo',
        rules: { required: true, validator: validatorSelectLabelLength(30) },
        component: (
          <CarSelect
            defaultActiveFirstOption={false}
            filterOption={false}
            type="plateNumber"
            style={formItemStyle}
            onChange={value => {
              if (value.key !== 'user-defined') {
                const { carrierName, carrierId } = JSON.parse(value.key);
                if (carrierId !== selectedCarrierId) {
                  setFieldsValue({
                    carrier: {
                      label: carrierName,
                      key: carrierId,
                    },
                  });
                  resetFields(['driver', 'driverTelephone']);
                }
              }
            }}
          />
        ),
      },
      {
        label: '承运商',
        name: 'carrier',
        rules: { required: true, validator: validatorSelectLabelLength(30) },
        component: (
          <CarSelect
            type="carrier"
            style={formItemStyle}
            onChange={value => {
              if (value.key !== 'user-defined') {
                resetFields(['plateNo']);
              }
              if (value.key === 'user-defined' && getFieldValue('plateNo').key !== 'user-defined') {
                resetFields(['plateNo']);
              }
              resetFields(['driver']);
            }}
          />
        ),
      },
      {
        label: '司机',
        name: 'driver',
        rules: { required: true, validator: validatorSelectLabelLength(50) },
        component: (
          <CarSelect
            filterOption={false}
            type="driver"
            style={formItemStyle}
            carrierId={_.get(getFieldValue('carrier'), 'key')}
            onChange={value => {
              if (value.key !== 'user-defined') {
                const { carrierName, carrierId, phone } = JSON.parse(value.key);
                setFieldsValue({ driverTelephone: phone });
                if (!_.get(getFieldValue('carrier'), 'key')) {
                  setFieldsValue({
                    carrier: {
                      label: carrierName,
                      key: carrierId,
                    },
                  });
                }
              }
            }}
          />
        ),
      },
      {
        label: '司机手机',
        name: 'driverTelephone',
        rules: { required: true, pattern: /^1+\d{10}$/ },
        component: <Input style={formItemStyle} />,
      },
    ];
    if (edit) {
      items.push({
        label: '车位',
        name: 'parkingSpace',
        rules: { validator: validatorSelectLabelLength(15) },
        component: <CarSelect style={formItemStyle} type="parking" warehouseId={warehouseId} allowClear />,
      });
    }
    const items1 = [
      {
        label: '备注',
        name: 'remark',
        rules: { max: 500 },
        component: <Textarea style={{ height: 80, ...formItemStyle }} maxLength={500} />,
      },
      {
        label: '售达客户',
        name: 'saleCustomerIdList',
        component: (
          <SearchSelect
            type="customer"
            mode="multiple"
            style={formItemStyle}
            onChange={value => {
              console.log(value);
              setFieldsValue({
                customerIdList: value,
              });
            }}
          />
        ),
      },
      {
        label: '送达客户',
        name: 'customerIdList',
        component: <SearchSelect type="customer" style={formItemStyle} mode="multiple" />,
      },
    ];
    return (
      <div style={{ margin: 20 }}>
        <h3>{breadcrumbName}</h3>
        <div>
          {items.map(({ label, name, rules, component }) => (
            <FormItem label={label} key={label}>
              {getFieldDecorator(name, {
                rules: revertRules(rules, label),
              })(component)}
            </FormItem>
          ))}
          <FormItem label="发运物料">
            <div>
              {needWarnWhenEditMaterial && (
                <p style={{ color: Colors.alertYellow }}>
                  提醒：任务已经过“确认收货种类和数量”流程，编辑车位、物料、数量、货位时请与现场确认
                </p>
              )}
              <SimpleTable
                dataSource={dataSource}
                columns={this.getColumns()}
                style={{ margin: 0, width: 900 }}
                pagination={false}
                footer={() => (
                  <Link
                    icon="plus-circle-o"
                    onClick={() => {
                      this.setState({
                        dataSource: [...dataSource, { key: dataSource[dataSource.length - 1].key + 1 }],
                      });
                    }}
                  >
                    添加一行
                  </Link>
                )}
              />
            </div>
          </FormItem>
          <FormItem label="载具物料">
            <div>
              <SimpleTable
                dataSource={packageDataSource}
                columns={this.getPackageMaterialColumns()}
                style={{ margin: 0, width: 900 }}
                pagination={false}
                footer={() => (
                  <Link
                    icon="plus-circle-o"
                    onClick={() => {
                      this.setState({
                        packageDataSource: [
                          ...packageDataSource,
                          {
                            key: packageDataSource.length && packageDataSource[packageDataSource.length - 1].key + 1,
                          },
                        ],
                      });
                    }}
                  >
                    添加一行
                  </Link>
                )}
              />
            </div>
          </FormItem>
          {items1.map(({ label, name, rules, component }) => (
            <FormItem label={label} key={label}>
              {getFieldDecorator(name, {
                rules: revertRules(rules, label),
              })(component)}
            </FormItem>
          ))}
          <div className={commonStyles.footer}>
            <Button
              className={commonStyles.cancel}
              type="default"
              disabled={edit ? false : onSubmit}
              onClick={() => {
                if (edit) {
                  this.setInitialData();
                } else {
                  this.submit(() => {
                    this.resetData();
                    this.setState({ onSubmit: false });
                  });
                }
              }}
            >
              {edit ? '重置' : '继续创建'}
            </Button>
            <Button className={commonStyles.ok} onClick={this.submit} disabled={onSubmit} loading={onSubmit}>
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default TaskBaseForm;
