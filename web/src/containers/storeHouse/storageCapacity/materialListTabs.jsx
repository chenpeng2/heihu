import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { FormattedMessage, openModal, Link, message, InputNumber, Icon, Tabs, Table, FormItem } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { arrayIsEmpty } from 'src/utils/array';
import MaterialUnitSelect from 'src/containers/unit/materialUnitSelect';
import { primary } from 'src/styles/color';
import { amountValidator } from 'src/components/form';

import UserOrUserGroupSelect, { TYPES } from './userOrUserGroupSelect';
import SelectAllForUser from './selectForUser';
import { getTitleByType, STORAGE_CAPACITY } from './utils';

const TabPane = Tabs.TabPane;
let KEY = 0;

// 获取新的data
const getNextData = (key, extraData, data) => {
  if (arrayIsEmpty(data)) return;

  return data.map(i => {
    if (i && i.key === key) {
      i = { ...i, ...extraData };
    }
    return i;
  });
};

// 获取不同前缀的初始数据
const getUniqueType = (valueType, index, data) => {
  const { maxMaterialList, minMaterialList, safeMaterialList } = data || {};
  return {
    [`${STORAGE_CAPACITY.max.value}-${valueType}`]: _.get(maxMaterialList[index], valueType),
    [`${STORAGE_CAPACITY.min.value}-${valueType}`]: _.get(minMaterialList[index], valueType),
    [`${STORAGE_CAPACITY.safe.value}-${valueType}`]: _.get(safeMaterialList[index], valueType),
  };
};

class MaterialListTabs extends Component {
  state = {
    data: [{ key: KEY }],
  };

  componentDidMount() {
    this.setInitialValue();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps.initialValue, this.props.initialValue)) {
      this.setInitialValue(nextProps);
    }
  }

  setInitialValue = props => {
    const { initialValue } = props || this.props;
    if (!initialValue) return;

    const {
      [`${STORAGE_CAPACITY.max.value}-materialList`]: maxMaterialList,
      [`${STORAGE_CAPACITY.min.value}-materialList`]: minMaterialList,
      [`${STORAGE_CAPACITY.safe.value}-materialList`]: safeMaterialList,
    } = initialValue;
    const _data = { maxMaterialList, minMaterialList, safeMaterialList };

    KEY = 0;
    const res = [];

    if (!arrayIsEmpty(maxMaterialList)) {
      maxMaterialList.forEach((i, index) => {
        const { material, unit } = i || {};
        const { key: materialCode, label } = material || {};
        res.push({
          key: KEY,
          material: { code: materialCode, name: typeof label === 'string' ? label.split('/')[1] : null },
          unit,
          ...(getUniqueType('amount', index, _data) || {}),
          ...(getUniqueType('operatorType', index, _data) || {}),
          ...(getUniqueType('operatorIds', index, _data) || {}),
          ...(getUniqueType('operatorGroupId', index, _data) || {}),
        });
        KEY += 1;
      });
    }

    this.setState({ data: res });
  };

  tableInst = React.createRef();

  delete = key => {
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

  add = cb => {
    this.setState(({ data }) => {
      return {
        data: data.concat({ key: (KEY += 1) }),
      };
    }, cb);
  };

  // 自动将table滚动到底部
  // tab下有多个table无法使用
  scrollTableIntoView = () => {
    const tableInst = this.tableInst;
    if (tableInst && tableInst.current) {
      const tableContainer = tableInst.current.querySelector('.ant-table-body');
      if (tableContainer) tableContainer.scrollBy({ top: tableContainer.scrollHeight, behavior: 'smooth' });
    }
  };

  getTitleForUser = type => {
    const { changeChineseToLocale } = this.context;
    return (
      <div>
        <span>{changeChineseToLocale('通知用户')}</span>
        <span
          onClick={() => {
            openModal({
              title: '选择全部',
              children: (
                <SelectAllForUser
                  cbForEnsure={value => {
                    if (!value) return;

                    const { allUseroperatorGroupId, allUseroperatorIds, allUseroperatorType } = value || {};
                    const { data } = this.state;
                    const { form } = this.props;
                    const nextData = data.map(i => {
                      i[`${type}-operatorType`] = allUseroperatorType;
                      if (allUseroperatorType === TYPES.user.value) {
                        i[`${type}-operatorIds`] = allUseroperatorIds;
                      }
                      if (allUseroperatorType === TYPES.userGroup.value) {
                        i[`${type}-operatorGroupId`] = allUseroperatorGroupId;
                      }
                      return i;
                    });
                    this.setState(
                      {
                        data: nextData, // data可以利用initialValue
                      },
                      () => {
                        const materialList = form.getFieldValue(`${type}-materialList`) || {};
                        const _data = !arrayIsEmpty(materialList)
                          ? materialList.map(j => {
                              return {
                                ...j,
                                operatorGroupId: allUseroperatorGroupId,
                                operatorIds: allUseroperatorIds,
                                operatorType: allUseroperatorType,
                              };
                            })
                          : undefined;
                        // 当initialValue改了需要用setFieldsValue
                        form.setFieldsValue({ [`${type}-materialList`]: _data });
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
          {changeChineseToLocale('选择全部')}
        </span>
      </div>
    );
  };

  getColumns = type => {
    const { form, storageCapacitys } = this.props;
    const { getFieldDecorator } = form || {};

    return [
      {
        key: 'operation',
        // fixed: 'left', 暂时无法实现，因为有显示上的bug
        width: 50,
        render: (__, record) => {
          const { key } = record || {};
          return (
            <div>
              <Icon
                onClick={() => {
                  this.delete(key);
                }}
                style={{ marginRight: '10px', cursor: 'pointer' }}
                type="minus-circle"
              />
            </div>
          );
        },
      },
      {
        title: '物料',
        width: 230,
        key: 'material',
        render: (__, record) => {
          const { key, material } = record || {};
          const { code, name } = material || {};
          const materialValue = code && name ? { label: `${code}/${name}`, key: code } : undefined;

          return (
            <FormItem style={{ width: 220 }}>
              {getFieldDecorator(`${type}-materialList[${key}].material`, {
                rules: [{ required: true, message: '物料必填' }],
                onChange: (value, options) => {
                  const materialData = _.get(options, 'props.data');
                  const { unitId, unitName, code, name } = materialData || {};

                  this.setState(
                    ({ data }) => ({
                      data:
                        getNextData(
                          key,
                          {
                            material: materialData,
                            unit: unitId && unitName ? { key: unitId, label: unitName } : undefined,
                          },
                          data,
                        ) || data,
                    }),
                    () => {
                      // 改变值后需要将所有type的material改变
                      if (!arrayIsEmpty(storageCapacitys)) {
                        storageCapacitys.filter(i => i && !(i.value === type)).forEach(i => {
                          const { value } = i || {};
                          const typeData = form.getFieldValue(`${value}-materialList`);
                          if (!arrayIsEmpty(typeData)) {
                            typeData.forEach((i, index) => {
                              if (index === key) {
                                i.material = code && name ? { label: `${code}/${name}`, key: code } : undefined;
                                i.unit = unitName && unitId ? { label: unitName, key: unitId } : undefined;
                              }
                            });
                          }
                          form.setFieldsValue({ [`${value}-materialList`]: typeData });
                        });
                      }
                    },
                  );
                },
                initialValue: materialValue, // 第一次添加的时候需要将已经有的material添加
              })(<SearchSelect params={{ status: 1 }} style={{ width: 200 }} type={'materialBySearch'} />)}
            </FormItem>
          );
        },
      },
      {
        title: getTitleByType(type),
        key: 'amount',
        width: 140,
        render: (__, record) => {
          const { key, [`${type}-amount`]: amount } = record;
          return (
            <FormItem style={{ width: 110 }}>
              {getFieldDecorator(`${type}-materialList[${key}].amount`, {
                rules: [
                  { required: true, message: '数量必填' },
                  { validator: amountValidator(null, null, null, 6, getTitleByType(type)) },
                ],
                initialValue: amount,
              })(<InputNumber style={{ width: 100 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: '单位',
        width: 230,
        key: 'unit',
        render: (__, record) => {
          const { key, unit, material } = record || {};
          const { code } = material || {};

          return (
            <FormItem style={{ width: 230 }}>
              {getFieldDecorator(`${type}-materialList[${key}].unit`, {
                rules: [{ required: true, message: '物料必填' }],
                onChange: value => {
                  const unitValue = value;
                  this.setState(
                    ({ data }) => ({ data: getNextData(key, { unit: unitValue }, data) || data }),
                    () => {
                      // 改变值后需要将所有type的material改变
                      if (!arrayIsEmpty(storageCapacitys)) {
                        storageCapacitys.filter(i => i && !(i.value === type)).forEach(i => {
                          const { value } = i || {};
                          const typeData = form.getFieldValue(`${value}-materialList`);
                          if (!arrayIsEmpty(typeData)) {
                            typeData.forEach((i, index) => {
                              if (index === key) i.unit = unitValue;
                            });
                          }
                          form.setFieldsValue({ [`${value}-materialList`]: typeData });
                        });
                      }
                    },
                  );
                },
                initialValue: unit, // 第一次添加的时候需要将已经有的material添加
              })(<MaterialUnitSelect materialCode={code} params={{ status: 1 }} style={{ width: 200 }} />)}
            </FormItem>
          );
        },
      },
      {
        title: this.getTitleForUser(type),
        key: 'user',
        render: (__, record) => {
          const { key } = record || {};
          const {
            [`${type}-operatorType`]: operatorType,
            [`${type}-operatorIds`]: operatorIds,
            [`${type}-operatorGroupId`]: operatorGroupId,
          } = record;
          return (
            <FormItem>
              <UserOrUserGroupSelect
                initialValue={{ operatorType, operatorIds, operatorGroupId }}
                form={form}
                prefix={`${type}-materialList[${key}].`}
              />
            </FormItem>
          );
        },
      },
    ];
  };

  renderFooter = () => {
    return (
      <Link
        icon="plus-circle-o"
        onClick={() => {
          this.add();
        }}
      >
        添加一行
      </Link>
    );
  };

  renderTables = typeNow => {
    return (
      <Table
        style={{ margin: 0 }}
        scroll={{ x: 1200 }}
        footer={this.renderFooter}
        columns={this.getColumns(typeNow)}
        dataSource={this.state.data}
        pagination={false}
      />
    );
  };

  render() {
    const { storageCapacitys } = this.props;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        {!arrayIsEmpty(storageCapacitys) ? (
          <Tabs style={{ width: 800 }} type="card">
            {storageCapacitys
              .map(i => {
                const { name, value } = i || {};
                if (!name) return null;

                return (
                  <TabPane forceRender tab={changeChineseToLocale(name)} key={value}>
                    <div ref={this.tableInst}>{this.renderTables(value)}</div>
                  </TabPane>
                );
              })
              .filter(i => i)}
          </Tabs>
        ) : (
          <FormattedMessage defaultMessage={'请先选择库容检查项'} />
        )}
      </div>
    );
  }
}

MaterialListTabs.propTypes = {
  style: PropTypes.object,
  form: PropTypes.any,
  storageCapacitys: PropTypes.any,
  initialValue: PropTypes.any,
};

MaterialListTabs.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default MaterialListTabs;
