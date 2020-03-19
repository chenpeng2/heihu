import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Modal } from 'antd';
import { Table, Icon, Select, openModal, Tooltip, Link } from 'src/components';
import { FormItem } from 'components/form';
import { isQcItemCodingManually } from 'utils/organizationConfig';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import {
  CHECKITEM_CHECK,
  AQL_CHECK,
  QCLOGIC_TYPE,
  TOLERANCE,
  YN,
  MANUAL,
  BETWEEN,
  LOGIC,
} from 'src/views/qualityManagement/constants';
import { ViewToggle } from 'src/views/cooperate/purchase_list/incoming/Content/Header';
import { black } from 'src/styles/color';
import { PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD } from 'src/views/cooperate/purchase_list/constants';
import AddQcCheckItemConfig from './addQcCheckItemConfig';
import BulkActionModal from './bulkActionModal';
import CheckItemStandardFormItem from './baseFormItem/checkItemStandardFormItem';
import DefectReasonFormItem from './baseFormItem/defectReasonFormItem';
import AqlFormItem from './baseFormItem/aqlFormItem';
import SamplingFormItem from './baseFormItem/samplingFormItem';
import {
  getStandardTitle,
  getQcDefectReasonTitle,
  getAqlTitle,
  getSamplingTitle,
  getInitialField,
  getStandardField,
} from './utils';
import styles from './styles.scss';

const Option = Select.Option;

type Props = {
  form: any,
  initialValue: [],
  type: string,
  initialKeys: [],
};

class QcCheckItemTable extends Component {
  props: Props;
  state = {
    lastKey: 0,
    keys: [],
    dataSource: [],
    expandedRowKeys: [],
    isCardModel: true,
  };

  componentWillReceiveProps(nextProps) {
    const { form, initialValue } = nextProps;
    if (!_.isEqual(this.props.initialValue, initialValue)) {
      this.setInitialData(initialValue, form);
    }
  }

  setInitialData = (initialValue, form) => {
    const _initialValue = _.cloneDeep(initialValue);
    const { setFieldsValue } = form;
    if (initialValue) {
      this.getField(initialValue, form);
      this.setState({ keys: _initialValue, dataSource: this.getDataSource(_initialValue) }, () => {
        initialValue.forEach(n => {
          const { group, children } = n;
          setFieldsValue({ [`qcCheckItemConfigs${group}`]: children });
        });
      });
    }
  };

  // 这里定义好所有根据情况可能显示或隐藏的的表单项
  getField = initialValue => {
    const { form } = this.props;
    initialValue.forEach(n => {
      n.children.forEach(qcCheckItemConfig => {
        const { index } = qcCheckItemConfig;
        getInitialField(form, qcCheckItemConfig, index);
      });
    });
  };

  getColumnsWidth = () => {
    const { dataSource, isCardModel } = this.state;
    const {
      form: { getFieldValue, getFieldsValue },
    } = this.props;
    const fields = _.flatten(dataSource.map(n => n.children)).map(n => `qcCheckItemConfigs${n.group}`);
    const qcCheckItemConfigs = _.flatten(Object.values(getFieldsValue(fields) || {}));
    let standardColumnWidth = 350;
    if (qcCheckItemConfigs.filter(n => n.logic === TOLERANCE || n.logic === BETWEEN).length) {
      standardColumnWidth = 650;
    } else if (
      qcCheckItemConfigs.filter(
        n => n.logic !== YN && n.logic !== MANUAL && n.logic !== TOLERANCE && n.logic !== BETWEEN && n.logic,
      ).length
    ) {
      standardColumnWidth = 500;
    }
    let scrollWidth = 500;
    if (getFieldValue('checkCountType') === AQL_CHECK) {
      scrollWidth = 1000;
    } else if (getFieldValue('checkCountType') === CHECKITEM_CHECK) {
      scrollWidth = 1100;
    }
    if (!dataSource.length) {
      standardColumnWidth -= 100;
      scrollWidth -= 100;
    }
    if (isCardModel) {
      standardColumnWidth -= 350;
      scrollWidth -= 350;
    }
    if (isQcItemCodingManually() && !isCardModel) {
      scrollWidth += 120;
    }
    return scrollWidth + standardColumnWidth;
  };

  getDataSource = keys => {
    const expandedRowKeys = [];
    const dataSource = _.compact(
      _.cloneDeep(keys).map(n => {
        expandedRowKeys.push(n.group);
        const _children = n.children.filter(n => !n.deleted);
        if (_children.length === 0) {
          return null;
        }
        n.children = _children;
        return n;
      }),
    );
    this.setState({ expandedRowKeys });
    return dataSource;
  };

  onMoveUp = (data, index) => {
    if (index === 0) {
      [data[0], data[data.length - 1]] = [data[data.length - 1], data[0]];
    } else {
      [data[index - 1], data[index]] = [data[index], data[index - 1]];
    }
  };

  onMoveDown = (data, index) => {
    if (index === data.length - 1) {
      [data[0], data[data.length - 1]] = [data[data.length - 1], data[0]];
    } else {
      [data[index + 1], data[index]] = [data[index], data[index + 1]];
    }
  };

  onSetBulkValue = (data, field, value, group, noCover, getCondition) => {
    const { setFieldsValue, getFieldValue } = this.props.form;
    const itemsValue = getFieldValue(`qcCheckItemConfigs${group}`);
    data.forEach(item => {
      const { index } = item;
      // 原表单中有值且选择不覆盖时跳过批量设值操作
      if (noCover && getCondition(index)) {
        return null;
      }
      // 标准手动输入时不允许设置不良原因
      if (itemsValue[index].logic === LOGIC.MANUAL && field === 'qcDefectConfigs') {
        return null;
      }
      // 标准手动输入时将不良原因设置为空
      if (field === 'logic' && value === LOGIC.MANUAL) {
        itemsValue[index].qcDefectConfigs = undefined;
        setFieldsValue({ [`qcCheckItemConfigs${group}`]: itemsValue });
        this.setState({ loading: true });
      }
      itemsValue[index][field] = value;
      setFieldsValue({ [`qcCheckItemConfigs${group}`]: itemsValue });
    });
  };

  onSetValues = (dataSource, bulkConfig, noCover) => {
    const { form } = this.props;
    const { getFieldValue } = form;
    dataSource.forEach(n => {
      const { group, children: data } = n;
      const itemsValue = getFieldValue(`qcCheckItemConfigs${group}`);
      const { qcCheckItemConfigs, standardBulk, defectReasonBulk, qcAqlBulk, samplingBulk } = bulkConfig;
      const { qcDefectConfigs } = qcCheckItemConfigs || {};
      if (standardBulk) {
        const standardField = ['logic', 'base', 'max', 'min', 'unitId', 'deltaPlus', 'deltaMinus'];
        data.forEach(n => {
          const { group, index } = n;
          getStandardField(form, group, index);
        });
        standardField.forEach(field => {
          const getCondition = index => itemsValue[index][field] || typeof itemsValue[index][field] === 'number';
          if (qcCheckItemConfigs[field] || typeof qcCheckItemConfigs[field] === 'number') {
            this.onSetBulkValue(data, field, qcCheckItemConfigs[field], group, noCover, getCondition);
          }
        });
      }
      if (defectReasonBulk) {
        const getCondition = index => !arrayIsEmpty(itemsValue[index].qcDefectConfigs);
        this.onSetBulkValue(data, 'qcDefectConfigs', qcDefectConfigs, group, noCover, getCondition);
      }
      if (qcAqlBulk) {
        const standardField = ['qcAqlInspectionLevelId', 'qcAqlId'];
        standardField.forEach(field => {
          const getCondition = index => itemsValue[index][field];
          this.onSetBulkValue(data, field, qcCheckItemConfigs[field], group, noCover, getCondition);
        });
      }
      if (samplingBulk) {
        const standardField = ['checkCountType', 'checkNums', 'qcAqlInspectionLevelId', 'qcAqlId'];
        standardField.forEach(field => {
          const getCondition = index => itemsValue[index][field];
          this.onSetBulkValue(data, field, qcCheckItemConfigs[field], group, noCover, getCondition);
        });
      }
    });
  };

  getNeedBulkCover = value => {
    const { dataSource } = this.state;
    const { getFieldValue } = this.props.form;
    const { standardBulk, defectReasonBulk, qcAqlBulk, samplingBulk } = value;
    let qcCheckItemConfigs = [];
    dataSource.forEach(n => {
      const { group } = n;
      const itemsValue = getFieldValue(`qcCheckItemConfigs${group}`);
      qcCheckItemConfigs = qcCheckItemConfigs.concat(itemsValue);
    });
    const isLogicBulk = standardBulk && qcCheckItemConfigs.filter(n => typeof n.logic === 'number').length > 0;
    const isQcDefectConfigsBulk =
      defectReasonBulk && qcCheckItemConfigs.filter(n => !arrayIsEmpty(n.qcDefectConfigs)).length > 0;
    const isQcAqlInspectionBulk = qcAqlBulk && qcCheckItemConfigs.filter(n => n.qcAqlInspectionLevelId).length > 0;
    const isSamplingBulk = samplingBulk && qcCheckItemConfigs.filter(n => n.checkCountType || n.checkNums).length > 0;
    return {
      isLogicBulk,
      isQcDefectConfigsBulk,
      isQcAqlInspectionBulk,
      isSamplingBulk,
    };
  };

  onModalSubmit = value => {
    const { changeChineseToLocale } = this.context;
    const { dataSource } = this.state;
    const { isLogicBulk, isQcDefectConfigsBulk, isQcAqlInspectionBulk, isSamplingBulk } = this.getNeedBulkCover(value);

    if (isLogicBulk || isQcDefectConfigsBulk || isQcAqlInspectionBulk || isSamplingBulk) {
      Modal.confirm({
        title: changeChineseToLocale('提示'),
        content: changeChineseToLocale('你批量的范围中已有部分栏位有值，是否进行覆盖？'),
        cancelText: changeChineseToLocale('保留原值'),
        okText: changeChineseToLocale('全部覆盖'),
        width: 320,
        iconType: 'exclamation-circle',
        cancelButtonProps: 'primary',
        maskClosable: true,
        onOk: () => {
          this.onSetValues(dataSource, value);
        },
        onCancel: () => {
          this.onSetValues(dataSource, value, true);
        },
      });
    } else {
      this.onSetValues(dataSource, value);
    }
  };

  getLogicFormItem = data => {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator, getFieldValue, setFieldsValue, validateFields } = form;
    const { group, index } = data;
    return (
      <FormItem>
        {getFieldDecorator(`qcCheckItemConfigs${data.group}[${data.index}].logic`, {
          rules: [{ required: true, message: changeChineseToLocale('逻辑判断必填') }],
          onChange: value => {
            this.setState({ updated: true }, () => {
              // 改变逻辑判断时 重置之前填过的所有逻辑判断数据
              const qcCheckItemConfigs = getFieldValue(`qcCheckItemConfigs${group}`);
              qcCheckItemConfigs[index] = {
                base: undefined,
                deltaPlus: undefined,
                deltaMinus: undefined,
                unitId: undefined,
                min: undefined,
                max: undefined,
              };
              setFieldsValue({ [`qcCheckItemConfigs${group}`]: qcCheckItemConfigs });
              if (value === 7) {
                const qcCheckItemConfigs = getFieldValue(`qcCheckItemConfigs${group}`);
                qcCheckItemConfigs[index].qcDefectConfigs = undefined;
                setFieldsValue({ [`qcCheckItemConfigs${group}`]: qcCheckItemConfigs });
              }
              validateFields([`qcCheckItemConfigs${data.group}[${data.index}].logic`], { force: true });
            });
          },
        })(
          <Select style={{ width: 140, marginRight: 20 }}>
            {_.map(QCLOGIC_TYPE, ({ display }, value) => (
              <Option key={value} value={Number(value)}>
                {changeChineseToLocale(display)}
              </Option>
            ))}
          </Select>,
        )}
      </FormItem>
    );
  };

  getSamplingFormItem = data => {
    const { form } = this.props;
    const { isCardModel } = this.state;
    const { getFieldValue } = form;
    const { group, index, name } = data;
    if (!name) return null;
    const checkCountType = getFieldValue(`qcCheckItemConfigs${group}[${index}].checkCountType`);
    let aqlColumns;
    if (checkCountType === AQL_CHECK) {
      aqlColumns = this.getAqlColumns().map(n => n.render(data));
    }

    return (
      <SamplingFormItem
        form={form}
        field={`${data.group}[${data.index}]`}
        checkCountType={checkCountType}
        aqlColumns={aqlColumns}
        isCardModel={isCardModel}
      />
    );
  };

  getAqlFormItem = data => {
    const { form } = this.props;
    const { isCardModel } = this.state;
    const { getFieldValue } = form;
    const checkCountType = getFieldValue('checkCountType');
    return (
      <AqlFormItem
        form={form}
        field={`${data.group}[${data.index}]`}
        isCardModel={isCardModel}
        checkCountType={checkCountType}
      />
    );
  };

  getAqlColumns = () => {
    const { dataSource } = this.state;
    return [
      {
        title: dataSource.length ? (
          <BulkActionModal title={'检验水平与接收质量限'} onSubmit={this.onModalSubmit} showAql />
        ) : (
          '检验水平与接收质量限'
        ),
        key: 'aql',
        width: 310,
        render: data => (data.name ? this.getAqlFormItem(data) : null),
      },
    ];
  };

  getSamplingColumns = () => {
    const { dataSource } = this.state;
    return [
      {
        title: dataSource.length ? (
          <BulkActionModal title={'抽检类型与数值'} onSubmit={this.onModalSubmit} showSampling />
        ) : (
          '抽检类型与数值'
        ),
        key: 'samplingNum',
        width: 270,
        render: data => this.getSamplingFormItem(data),
      },
    ];
  };

  getBaseColumns = () => {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const { keys, isCardModel } = this.state;
    return [
      {
        title: '质检项名称',
        width: !isCardModel && isQcItemCodingManually() ? 290 : 180,
        dataIndex: 'name',
        key: 'name',
        render: (name, record, key) =>
          record.name ? (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Icon
                key={`delete-${key}`}
                type="minus-circle"
                className={styles.removeIcon}
                onClick={() => {
                  keys.forEach(n => {
                    if (n.group === record.group) {
                      const itemsValue = getFieldValue(`qcCheckItemConfigs${n.group}`);
                      n.children.forEach(n => {
                        const { group, index } = n;
                        if (n.key === record.key) {
                          n.deleted = true;
                          itemsValue[index].deleted = true;
                          setFieldsValue({ [`qcCheckItemConfigs${group}`]: itemsValue });
                        }
                      });
                    }
                  });
                  this.setState({ keys, dataSource: this.getDataSource(keys) || [] });
                }}
              />
              <div
                className={isCardModel ? styles.tableFirstColumn_card : styles.tableFirstColumn}
                style={isQcItemCodingManually() ? { marginBottom: 0 } : {}}
              >
                <div style={{ marginRight: 5 }}>{isQcItemCodingManually() ? record.code : key + 1}</div>
                <Tooltip text={name} width={90} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{ color: black, marginRight: 10 }}>分类</span>
              <Tooltip width={120} text={record.group} />
            </div>
          ),
      },
    ];
  };

  getLastColumn = () => {
    const { keys } = this.state;
    return {
      title: '操作',
      key: 'action',
      width: 60,
      render: (data, key) => {
        const { group, name, index } = data;
        return (
          <div style={{ position: 'relative' }} key={`${group}${key}`}>
            <span
              className={styles.caret}
              style={{ bottom: 2, paddingTop: 14 }}
              onClick={() => {
                if (name) {
                  // 质检项换位
                  const groupItems = _.get(keys.filter(n => n.group === group)[0], 'children');
                  const itemIndex = groupItems.findIndex(n => n.index === index);
                  this.onMoveUp(groupItems, itemIndex);
                } else {
                  // 质检项分类换位
                  const groupIndex = keys.findIndex(n => n.group === group);
                  this.onMoveUp(keys, groupIndex);
                }
                this.setState({ keys, dataSource: this.getDataSource(keys) || [] });
              }}
            >
              <Icon size={10} type="caret-up" />
            </span>
            <span
              className={styles.caret}
              onClick={() => {
                if (name) {
                  // 质检项换位
                  const groupItems = _.get(keys.filter(n => n.group === group)[0], 'children');
                  const itemIndex = groupItems.findIndex(n => n.index === index);
                  this.onMoveDown(groupItems, itemIndex);
                } else {
                  // 质检项分类换位
                  const groupIndex = keys.findIndex(n => n.group === group);
                  this.onMoveDown(keys, groupIndex);
                }
                this.setState({ keys, dataSource: this.getDataSource(keys) || [] });
              }}
            >
              <Icon size={10} style={{ marginTop: -6 }} type="caret-down" />
            </span>
          </div>
        );
      },
    };
  };

  getCardModelColumns = () => {
    const { form } = this.props;
    const { getFieldValue } = form;
    const { dataSource } = this.state;
    const columns = this.getBaseColumns();
    columns.splice(2, 0, {
      title: (
        <Fragment>
          {getFieldValue('checkCountType') === AQL_CHECK ? (
            <div className={styles.cardModelTitle}>{getAqlTitle(dataSource, this.onModalSubmit)}</div>
          ) : null}
          {getFieldValue('checkCountType') === CHECKITEM_CHECK ? (
            <div className={styles.cardModelTitle}>{getSamplingTitle(dataSource, this.onModalSubmit)}</div>
          ) : null}
          <div className={styles.cardModelTitle}>{getStandardTitle(dataSource, this.onModalSubmit, form)}</div>
          <div className={styles.cardModelTitle}>{getQcDefectReasonTitle(dataSource, this.onModalSubmit, form)}</div>
        </Fragment>
      ),
      key: 'tableContent',
      render: (data, key) => {
        const { group, index, name } = data;
        if (!name) return null;
        const logic = getFieldValue(`qcCheckItemConfigs${group}[${index}].logic`);

        return (
          <Fragment>
            <div style={{ display: 'flex', marginBottom: 20 }}>
              {getFieldValue('checkCountType') === AQL_CHECK ? (
                <div style={{ marginRight: 30 }}>
                  <div style={{ color: black }}>检验水平与接收质量限</div>
                  {this.getAqlFormItem(data)}
                </div>
              ) : null}
              {getFieldValue('checkCountType') === CHECKITEM_CHECK ? (
                <div style={{ marginRight: 30 }}>
                  <div style={{ color: black }}>抽检类型与数值</div>
                  {this.getSamplingFormItem(data)}
                </div>
              ) : null}
              <div>
                <div style={{ color: black }}>标准</div>
                {this.getLogicFormItem(data)}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <CheckItemStandardFormItem form={form} field={`${group}[${index}]`} logic={logic} />
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ color: black, marginRight: 10 }}>不良原因细分</div>
              <DefectReasonFormItem form={form} field={`${group}[${index}]`} logic={logic} />
            </div>
            <div>
              <span style={{ color: black, marginRight: 10 }}>备注</span>
              <span>{getFieldValue(`qcCheckItemConfigs${group}[${index}].desc`) || replaceSign}</span>
            </div>
          </Fragment>
        );
      },
    });
    return columns;
  };

  getColumns = () => {
    const { dataSource } = this.state;
    const { form } = this.props;
    const { getFieldValue } = form;
    const columns = this.getBaseColumns();
    if (getFieldValue('checkCountType') === CHECKITEM_CHECK) {
      columns.splice(1, 0, ...this.getSamplingColumns());
    }
    if (getFieldValue('checkCountType') === AQL_CHECK) {
      columns.splice(1, 0, ...this.getAqlColumns());
    }
    columns.splice(
      2,
      0,
      ...[
        {
          title: dataSource.length ? (
            <BulkActionModal
              title={'标准'}
              onSubmit={this.onModalSubmit}
              showAql={getFieldValue('checkCountType') === AQL_CHECK}
              showSampling={getFieldValue('checkCountType') === CHECKITEM_CHECK}
            />
          ) : (
            '标准'
          ),
          key: 'logicDisplay',
          render: data => {
            const { name } = data;
            if (!name) return null;
            const logic = getFieldValue(`qcCheckItemConfigs${data.group}[${data.index}].logic`);

            return (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {this.getLogicFormItem(data)}
                <CheckItemStandardFormItem form={form} field={`${data.group}[${data.index}]`} logic={logic} />
              </div>
            );
          },
        },
        {
          title: dataSource.length ? (
            <BulkActionModal
              title={'不良原因细分'}
              onSubmit={this.onModalSubmit}
              showAql={getFieldValue('checkCountType') === AQL_CHECK}
              showSampling={getFieldValue('checkCountType') === CHECKITEM_CHECK}
            />
          ) : (
            '不良原因细分'
          ),
          key: 'qcDefectReason',
          width: 300,
          render: data => {
            const { group, index, name } = data;
            if (!name) return null;
            const logic = getFieldValue(`qcCheckItemConfigs${group}[${index}].logic`);
            // 手工输入不可设置不良原因
            return <DefectReasonFormItem form={form} field={`${group}[${index}]`} logic={logic} />;
          },
        },
        {
          title: '备注',
          key: 'desc',
          width: 140,
          render: data =>
            data.name ? (
              <Tooltip
                text={getFieldValue(`qcCheckItemConfigs${data.group}[${data.index}].desc`) || replaceSign}
                width={120}
              />
            ) : null,
        },
      ],
    );
    return columns;
  };

  render() {
    const { keys, dataSource, isCardModel, expandedRowKeys } = this.state;
    const { form } = this.props;
    let columns;
    if (isCardModel) {
      columns = _.compact(this.getCardModelColumns());
    } else {
      columns = _.compact(this.getColumns());
    }
    columns.push(this.getLastColumn());

    return (
      <div className={styles.qcCheckItemTableContainer}>
        <ViewToggle
          style={{ position: 'absolute', right: 0, top: -45 }}
          viewType={PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD}
          handleViewToggleChange={e => {
            this.setState({ isCardModel: e.target.value === PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD });
          }}
        />
        <Table
          className={styles.tableContainer}
          style={{ margin: 0 }}
          dataSource={dataSource}
          pagination={false}
          columns={columns}
          scroll={{ x: this.getColumnsWidth() }}
          rowKey={record => record.key || record.group}
          expandedRowKeys={expandedRowKeys}
          onExpand={(expanded, record) => {
            let _expandedRowKeys = expandedRowKeys;
            if (expanded) {
              expandedRowKeys.push(record.group);
            } else {
              _expandedRowKeys = expandedRowKeys.filter(n => n !== record.group);
            }
            this.setState({ expandedRowKeys: _expandedRowKeys });
          }}
          footer={() => (
            <Link
              icon="plus-circle-o"
              onClick={() => {
                openModal(
                  {
                    title: '增加质检项',
                    footer: null,
                    width: '60%',
                    innerContainerStyle: { border: 'none', background: 'white', maxHeight: 'auto' },
                    onOk: selectedRows => {
                      selectedRows.forEach(qcCheckItem => {
                        const {
                          group: { name: groupName },
                        } = qcCheckItem;
                        qcCheckItem.group = groupName;
                        const { group } = qcCheckItem;
                        let groupIndex = keys.findIndex(n => n.group === group);
                        if (groupIndex === -1) {
                          keys.push({
                            group,
                            children: [{ key: `${group}${0}`, index: 0, ...qcCheckItem }],
                          });
                          groupIndex = keys.length - 1;
                        } else {
                          const groupChildren = keys[groupIndex].children;
                          groupChildren.push({
                            key: `${group}${groupChildren.length}`,
                            index: groupChildren.length,
                            ...qcCheckItem,
                          });
                        }
                        const groupItemLastKey = keys[groupIndex].children.length - 1;
                        getInitialField(form, qcCheckItem, groupItemLastKey);
                      });
                      this.setState({ keys, dataSource: this.getDataSource(keys) || [] });
                    },
                    children: <AddQcCheckItemConfig initialQcCheckItemConfigs={_.flatten(keys.map(n => n.children))} />,
                  },
                  this.context,
                );
              }}
            >
              添加质检项
            </Link>
          )}
        />
      </div>
    );
  }
}

QcCheckItemTable.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default QcCheckItemTable;
