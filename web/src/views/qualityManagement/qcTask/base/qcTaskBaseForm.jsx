import React, { Component } from 'react';
import _ from 'lodash';
import { Modal } from 'antd';
import auth from 'utils/auth';
import LocalStorage from 'utils/localStorage';
import { arrayIsEmpty } from 'src/utils/array';
import { thousandBitSeparator } from 'utils/number';
import { Searchselect } from 'src/components';
import { queryMaterialDetail } from 'src/services/bom/material';
import QcConfigDetailBase from 'src/containers/qcConfig/detail/base';
import { FIELDS, replaceSign } from 'constants';
import { QUALITY_STATUS, INPUT_FACTORY_QC } from 'src/views/qualityManagement/constants';
import {
  Icon,
  Form,
  Link,
  Badge,
  Table,
  Select,
  message,
  Tooltip,
  FormItem,
  DatePicker,
  InputNumber,
  haveAuthority,
  Text,
} from 'components';
import PropTypes from 'prop-types';
import SecondStorageSelect from '../page/secondStorageSelect';
import SelectQrCodeMaterial from './selectQrCodeMaterial';

type Props = {
  form: {
    getFieldValue: () => {},
    resetFields: () => {},
  },
};

const Option = Select.Option;
const width = 300;
const CHECK_TYPE = {
  0: '入厂检',
  1: '出厂检',
};

class QcTaskBaseForm extends Component {
  props: Props;
  state = {
    checkMaterials: [],
    modalVisible: false,
    qcConfigs: [],
    materialCode: null,
    checkType: null,
    qcConfigId: null,
    checkCountType: null,
    selectedRowKeys: [],
    selectedRows: [],
    storageId: null,
    maxSampleAmount: null, // 自定义抽样数最大值
  };

  showModal = () => {
    this.setState({
      modalVisible: true,
      selectedRowKeys: [],
    });
  };

  hideModal = () => {
    this.setState({
      modalVisible: false,
    });
  };

  saveSelected = () => {
    const { checkMaterials, selectedRows } = this.state;
    const {
      form: { setFieldsValue },
    } = this.props;
    const selected = _.differenceWith(selectedRows, checkMaterials, _.isEqual);
    const now = Array.isArray(selected) && selected.length ? checkMaterials.concat(selected) : checkMaterials;
    const maxSampleAmount = _.sum(now && now.map(x => x && x.amount));
    setFieldsValue({ checkMaterials: now });
    this.setState({ checkMaterials: now, maxSampleAmount });
    this.hideModal();
  };

  deleteQrCodeMaterial = index => {
    const { checkMaterials } = this.state;
    const _checkMaterials = _.differenceWith(checkMaterials, [checkMaterials[index]], _.isEqual);
    this.setState(
      {
        checkMaterials: _checkMaterials,
        selectedRows: _checkMaterials,
      },
      () => {
        this.saveSelected();
      },
    );
  };

  getQrCodeMaterialColumns = () => {
    const { checkType } = this.state;

    const columns = [
      {
        title: '',
        dataIndex: 'id',
        width: 30,
        render: (text, record, index) => {
          return (
            <Icon
              onClick={() => this.deleteQrCodeMaterial(index)}
              style={{ height: 40, lineHeight: '40px', cursor: 'pointer' }}
              type="minus-circle"
            />
          );
        },
      },
      {
        title: '二维码',
        dataIndex: 'code',
        width: 130,
      },
      {
        title: '数量',
        dataIndex: 'amount',
        width: 100,
        render: amount => (typeof amount === 'number' ? thousandBitSeparator(amount) : replaceSign),
      },
      {
        title: '质量状态',
        dataIndex: 'qcStatus',
        width: 100,
        render: qcStatus => {
          const { name, color } = QUALITY_STATUS[qcStatus] || {};

          return name ? <Badge.MyBadge text={name || replaceSign} color={color} /> : replaceSign;
        },
      },
    ];

    if (checkType === INPUT_FACTORY_QC) {
      columns.push(
        {
          title: '供应商编号/名称',
          dataIndex: 'supplier',
          width: 200,
          render: supplier => {
            const { code, name } = supplier || {};
            return code ? `${code}/${name}` : replaceSign;
          },
        },
        {
          title: '供应商批次号',
          dataIndex: 'mfgBatches',
          width: 200,
          render: data => {
            const mfgBatchNos = [];
            if (Array.isArray(data)) {
              data.forEach(({ mfgBatchNo }) => mfgBatchNos.push(mfgBatchNo));
            }

            return (
              <Tooltip
                text={Array.isArray(mfgBatchNos) && mfgBatchNos.length ? mfgBatchNos.join(',') : replaceSign}
                length={20}
              />
            );
          },
        },
      );
    }

    columns.push({
      title: '仓位',
      width: 180,
      dataIndex: 'storageInfo.name',
    });

    return columns;
  };

  handleCheckTypeChange = value => {
    this.setState({ checkMaterials: [], checkType: Number(value), qcConfigId: null }, () => {
      this.props.form.resetFields(['qcConfigId']);
      if (value) this.fetchMaterialQcConfigs();
    });
  };

  handleMaterialChange = value => {
    const { key } = value || {};
    this.setState({ checkMaterials: [], materialCode: key, qcConfigId: null }, () => {
      this.props.form.resetFields(['qcConfigId']);
      if (key) this.fetchMaterialQcConfigs();
    });
  };

  handleStorageChange = value => {
    this.setState({ checkMaterials: [], storageId: value ? value.value.split('-')[1] : undefined });
  };

  fetchMaterialQcConfigs = async () => {
    const {
      form: { setFieldsValue },
    } = this.props;
    const { materialCode, checkType } = this.state;
    if (!materialCode) return null;
    const {
      data: { data },
    } = await queryMaterialDetail(materialCode);
    const { qcOperator } = data;
    if (qcOperator && qcOperator.name) {
      const { active, roles, name, id } = qcOperator;
      // roleid值11为QC人员
      const isQc = !arrayIsEmpty(roles) && roles.some(n => n.id === 11);
      if (active && isQc) {
        setFieldsValue({ operatorId: [{ key: `user:${id}`, label: name }] });
      }
    }
    let qcConfigs;

    if (checkType === 0) {
      qcConfigs = _.get(data, 'inputFactoryQcConfigDetails');
    } else if (checkType === 1) {
      qcConfigs = _.get(data, 'outputFactoryQcConfigDetails');
    }
    this.setState({ qcConfigs: !arrayIsEmpty(qcConfigs) ? qcConfigs.filter(n => n.state) : [] });
  };

  renderQcConfigsSelect = () => {
    const { qcConfigs } = this.state;

    return (
      <Select
        style={{ width }}
        placeholder="请选择质检方案"
        onFocus={() => {
          const {
            form: { getFieldValue },
          } = this.props;
          if (!getFieldValue('materialCode') || !getFieldValue('checkType')) {
            message.error('请先选择质检类型和物料');
          }
        }}
      >
        {Array.isArray(qcConfigs) &&
          qcConfigs.map(({ name, id }) => (
            <Option key={id} value={id}>
              {name}
            </Option>
          ))}
      </Select>
    );
  };

  renderOperatorSelect = () => {
    // 执行人必填，有派发质检任务权限时支持选择全部 QA 和 QC 人员，否则只能选择当前用户。
    if (haveAuthority(auth.WEB_ASSIGN_QUALITY_TESTING_TASK)) {
      return (
        <Searchselect
          allowClear={false}
          style={{ width }}
          placeholder="请选择执行人"
          type={'userAndWorkgroup'}
          params={{ active: true, authorities: auth.APP_CLAIM_QUALITY_TESTING_TASK }}
          secondParams={{
            authorities: `${auth.APP_CLAIM_QUALITY_TESTING_TASK},${auth.APP_PERFORM_QUALITY_TESTING_TASK}`,
          }}
          mode={'multiple'}
          key="operator"
        />
      );
    }

    // 当前用户 { id, name }
    const { id, name } = LocalStorage.get(FIELDS.USER_INFO);
    return (
      <Select style={{ width }}>
        <Option key={id} value={id}>
          {name}
        </Option>
      </Select>
    );
  };

  addQrCodeMaterial = () => {
    const { materialCode, checkType } = this.state;
    if (!materialCode || [0, 1].indexOf(checkType) === -1) {
      message.error('请先选择物料和质检类型');
    } else {
      this.showModal();
    }
  };

  renderSelectedQcConfig = () => {
    const { qcConfigId, qcConfigs } = this.state;
    if (!qcConfigId) return null;
    const qcConfig = qcConfigs.filter(n => n.id === qcConfigId);

    return (
      <div
        style={{
          width: 707,
          border: '1px solid rgba(0, 20, 14, 0.1)',
          backgroundColor: '#FAFAFA',
          marginLeft: 140,
          padding: '10px 0',
          marginBottom: 15,
        }}
      >
        <QcConfigDetailBase qcConfig={(qcConfig && qcConfig[0]) || {}} />
      </div>
    );
  };

  getFooter = () => {
    return (
      <Link icon="plus-circle-o" onClick={this.addQrCodeMaterial}>
        添加物料二维码
      </Link>
    );
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows });
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const {
      checkMaterials,
      storageId,
      selectedRows,
      modalVisible,
      checkCountType,
      checkType,
      materialCode,
      selectedRowKeys,
    } = this.state;
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Form>
          <FormItem label="计划开始时间">
            {getFieldDecorator('plannedStartTime', {
              rules: [{ required: true, message: changeChineseToLocale('计划开始时间不能为空') }],
            })(<DatePicker style={{ width }} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" />)}
          </FormItem>
          <FormItem label="质检类型">
            {getFieldDecorator('checkType', {
              rules: [{ required: true, message: changeChineseToLocale('质检类型不能为空') }],
              onChange: this.handleCheckTypeChange,
            })(
              <Select style={{ width }}>
                {Object.keys(CHECK_TYPE).map(k => (
                  <Option key={k} value={k}>
                    <Text>{CHECK_TYPE[k]}</Text>
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          <FormItem label="物料">
            {getFieldDecorator('materialCode', {
              rules: [
                {
                  required: true,
                  message: changeChineseToLocale('物料不能为空'),
                },
              ],
              onChange: this.handleMaterialChange,
            })(<Searchselect style={{ width }} type="materialBySearch" />)}
          </FormItem>
          <FormItem label="仓位">
            {getFieldDecorator('storageId', {
              onChange: this.handleStorageChange,
            })(<SecondStorageSelect style={{ width }} />)}
          </FormItem>
          <FormItem label="执行人">
            {getFieldDecorator('operatorId', {
              rules: [{ required: true, message: changeChineseToLocale('执行人不能为空') }],
            })(this.renderOperatorSelect())}
          </FormItem>
          <FormItem label="物料二维码" required>
            {getFieldDecorator('checkMaterials', {
              rules: [
                {
                  validator: (rule, value, cb) => {
                    const { checkMaterials } = this.state;
                    if (checkMaterials && checkMaterials.length <= 0) {
                      cb(changeChineseToLocale('物料二维码不能为空'));
                    }
                    cb();
                  },
                },
              ],
            })(
              <Table
                size="middle"
                style={{ minWidth: 707, maxWidth: 900, margin: 0 }}
                footer={() => this.getFooter()}
                columns={this.getQrCodeMaterialColumns()}
                rowKey={record => record.id}
                dataSource={checkMaterials}
                pagination={false}
                scroll={checkType ? { y: 200 } : { y: 200, x: 1000 }}
              />,
            )}
          </FormItem>
          <FormItem label="质检方案">
            {getFieldDecorator('qcConfigId', {
              rules: [{ required: true, message: changeChineseToLocale('质检方案不能为空') }],
              onChange: val => {
                const { checkCountType } = _.find(this.state.qcConfigs, x => x.id === val) || {};
                this.setState({ qcConfigId: Number(val), checkCountType });
              },
            })(this.renderQcConfigsSelect())}
          </FormItem>
          {this.renderSelectedQcConfig()}
          {checkCountType === 3 ? (
            <FormItem label="抽样数">
              {getFieldDecorator('checkCount', {
                rules: [
                  {
                    required: true,
                    message: changeChineseToLocale('抽样数不能为空'),
                  },
                  {
                    validator: (rule, value, cb) => {
                      const { maxSampleAmount } = this.state;
                      if (value <= 0 && maxSampleAmount) {
                        cb('抽样数必须为大于0的整数');
                      } else if (value > maxSampleAmount && maxSampleAmount) {
                        cb(`抽样数不能超过最大值${maxSampleAmount}`);
                      } else if (!maxSampleAmount) {
                        cb('请先添加物料二维码');
                      }
                      cb();
                    },
                  },
                ],
              })(<InputNumber step={1} placeholder="请输入抽样数" style={{ width }} />)}
            </FormItem>
          ) : null}
        </Form>
        <Modal
          title={changeChineseToLocale('选择二维码')}
          visible={modalVisible}
          onOk={this.saveSelected}
          onCancel={this.hideModal}
          destroyOnClose
          width={868}
          okText={changeChineseToLocale('确认')}
          cancelText={changeChineseToLocale('取消')}
        >
          <SelectQrCodeMaterial
            storageId={storageId}
            onSelectChange={this.onSelectChange}
            selectedRowKeys={selectedRowKeys}
            selectedRows={selectedRows}
            checkMaterials={checkMaterials} // 已经保存过的已选数据
            materialCode={materialCode}
            checkType={checkType}
          />
        </Modal>
      </div>
    );
  }
}

QcTaskBaseForm.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default QcTaskBaseForm;
