import React, { Component } from 'react';
import _ from 'lodash';

import { message, Badge, InputNumber, Textarea, withForm, Form, FormItem } from 'src/components';
import SearchSelect from 'src/components/select/searchSelect';
import { findQcStatus } from 'src/containers/storageAdjustRecord/util';
import { updateInventory } from 'src/services/inventory';
import TransactionsSelect from 'src/containers/storageAdjustRecord/list/transactionsSelect';
import { Big } from 'src/utils/number';
import { amountValidator } from 'src/components/form';
import { replaceSign } from 'src/constants';
import { getStorage } from 'src/services/knowledgeBase/storage';
import { getStoreHouse } from 'src/services/knowledgeBase/storeHouse';

const MyBadge = Badge.MyBadge;
const INPUT_WIDTH = 320;
const FORMITEM_STYLE = { padding: '0px 0px 0px 25px' };

type Props = {
  style: {},
  form: any,
  data: any,
  cbForSuccess: () => {},
};

class StorageAdjust extends Component {
  props: Props;
  state = {};

  componentDidMount() {
    const storageCode = _.get(this.props, 'data.storage.code');
    this.getStorageInfo(storageCode);
  }

  getChangeAmount = (amountAfterChange, amountTotal) => {
    if (!amountAfterChange) return 0;

    if (!Number.isNaN(Number(amountAfterChange)) && typeof amountTotal === 'number') {
      return Big(amountAfterChange).minus(amountTotal);
    }

    return 0;
  };

  submit = () => {
    const { form, data, cbForSuccess } = this.props;
    const { validateFieldsAndScroll } = form || {};

    let res = null;
    validateFieldsAndScroll((err, val) => {
      if (!err) {
        const { amount, material, remark, transactionCode } = val || {};

        res = updateInventory({
          storageId: _.get(data, 'storage.id'),
          materialCode: material ? material.key : null,
          remark,
          amountAfter: amount,
          amountBefore: _.get(data, 'amountTotal'),
          transactionCode: transactionCode ? transactionCode.key : null,
          qcStatus: _.get(data, 'qcStatus'),
        });
      }
    });

    return res.then(response => {
      const recordCode = _.get(response, 'data.data.recordCode');

      if (typeof cbForSuccess === 'function') cbForSuccess();
      message.success(`调整记录已过账后生效，记录号：${recordCode || replaceSign}`);
    });
  };

  getStorageInfo = storageCode => {
    getStorage(storageCode).then(res => {
      const firstStorageCode = _.get(res, 'data.data.parentCode');
      const warehouseCode = _.get(res, 'data.data.warehouseCode');

      getStorage(firstStorageCode).then(res => {
        const firstStorageName = _.get(res, 'data.data.name');
        this.setState({ firstStorageName });
      });
      getStoreHouse(warehouseCode).then(res => {
        const warehouseName = _.get(res, 'data.data.name');
        this.setState({ warehouseName });
      });
    });
  };

  render() {
    const { form, data } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { firstStorageName, warehouseName } = this.state;

    const { material, amountTotal, qcStatus, storage } = data || {};
    const { code: materialCode, unitName, name: materialName } = material || {};
    const qcStatusData = findQcStatus(qcStatus) || {};

    const storageName = _.get(storage, 'name');
    const storageInfo = `${warehouseName || replaceSign}-${firstStorageName || replaceSign}-${storageName || replaceSign}`;

    return (
      <Form>
        <FormItem label={'物料名称/编码'} style={FORMITEM_STYLE}>
          {getFieldDecorator('material', {
            initialValue: { label: `${materialCode}/${materialName}`, key: materialCode },
          })(<SearchSelect type={'materialBySearch'} style={{ width: INPUT_WIDTH }} disabled />)}
        </FormItem>
        <FormItem label={'区域位置'} style={FORMITEM_STYLE}>
          <span>{storageInfo}</span>
        </FormItem>
        <FormItem label={'当前数量'} style={FORMITEM_STYLE}>
          <span>{`${amountTotal} ${unitName || replaceSign}`}</span>
        </FormItem>
        <FormItem label={'修改后数量'} style={FORMITEM_STYLE}>
          {getFieldDecorator('amount', {
            rules: [
              {
                required: true,
                message: '修改后数量必填',
              },
              {
                validator: amountValidator(null, 0, null, 6),
              },
            ],
          })(<InputNumber />)}
          <span style={{ marginLeft: 10 }}>{unitName || replaceSign}</span>
        </FormItem>
        <FormItem label={'修改数量'} style={FORMITEM_STYLE}>
          <span> {`${this.getChangeAmount(getFieldValue('amount'), amountTotal)} ${unitName || replaceSign}`}</span>
        </FormItem>
        <FormItem label={'质量状态'} style={FORMITEM_STYLE}>
          <span>
            <MyBadge color={qcStatusData.color} text={qcStatusData.name} />
          </span>
        </FormItem>
        <FormItem label={'调整原因'} style={FORMITEM_STYLE}>
          {getFieldDecorator('transactionCode', {
            rules: [
              {
                required: true,
                message: '修改后数量必填',
              },
            ],
          })(<TransactionsSelect params={{ enable: true }} mode={null} style={{ width: INPUT_WIDTH }} />)}
        </FormItem>
        <FormItem label={'备注'} style={FORMITEM_STYLE}>
          {getFieldDecorator('remark')(<Textarea maxLength={50} style={{ height: 120, width: INPUT_WIDTH }} />)}
        </FormItem>
      </Form>
    );
  }
}

export default withForm({ showFooter: true, text: '过账' }, StorageAdjust);
