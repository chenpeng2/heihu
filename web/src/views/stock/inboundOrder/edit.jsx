import React, { Component } from 'react';
import _ from 'lodash';
import { withForm, message, Spin } from 'src/components';
import { updateInboundOrder } from 'src/services/stock/inboundOrder';
import moment from 'utils/time';
import { getFormatParams } from './utils';
import { STORAGE } from './constants';
import Base from './base';

type Props = {
  form: any,
  match: any,
  history: any,
};

class Edit extends Component {
  props: Props;
  state = {};

  getInitialMaterialList = data => {
    return data.materialList.map((n, index) => {
      const { material, inboundBatch, unitName, amountPlanned } = n;
      const { unit, unitConversions, validTime } = material;
      let materialUnit = [unit];
      if (unitConversions && unitConversions.length) {
        materialUnit = materialUnit.concat(unitConversions.map(n => n.slaveUnitName));
      }
      return {
        seq: index,
        inboundBatch,
        material,
        validTime,
        materialUnit,
        currentAmount: amountPlanned,
        currentUnitName: unitName,
        isCreated: true,
      };
    });
  };

  getFormatFormValue = data => {
    const { inboundOrderCode, remark, materialList } = data || {};
    const value = {
      inboundOrderCode,
      remark,
      id: [],
      amountPlanned: [],
      unitName: [],
      originPlaceTxt: [],
      supplier: [],
      supplierBatch: [],
      specification: [],
      storage: [],
      inboundBatch: [],
      productionDate: [],
      validPeriod: [],
      specifications: [],
    };
    materialList.forEach(n => {
      const {
        id,
        originPlaceTxt,
        amountPlanned,
        batchNo,
        firstStorage,
        inboundBatch,
        specification,
        storage,
        supplier,
        unitName,
        validPeriod,
        productionDate,
        warehouse,
      } = n;
      const { denominator, numerator, unitName: specificationUnitName } = specification || {};
      const inboundPlace = warehouse || firstStorage || storage;
      const { code: inboundPlaceCode, id: inboundPlacId } = inboundPlace || {};
      const level = warehouse ? STORAGE.warehouse : firstStorage ? STORAGE.firstStorage : STORAGE.storage;
      value.id.push(id);
      value.amountPlanned.push(amountPlanned);
      value.unitName.push(unitName);
      value.originPlaceTxt.push(originPlaceTxt);
      value.supplier.push(supplier ? { key: supplier.code, label: `${supplier.code}/${supplier.name}` } : undefined);
      value.supplierBatch.push(batchNo);
      value.specifications.push(
        specification
          ? {
              key: `${denominator}|${numerator}|${specificationUnitName}`,
              label: `${numerator}${specificationUnitName}`,
            }
          : undefined,
      );
      value.storage.push([`${inboundPlacId},${inboundPlaceCode},${level}`]);
      value.inboundBatch.push(inboundBatch);
      value.validPeriod.push(validPeriod && moment(Number(validPeriod)));
      value.productionDate.push(productionDate && moment(Number(productionDate)));
    });
    return value;
  };

  handleSubmit = materialList => {
    const { form, match, history } = this.props;
    const inboundOrderCode = _.get(match, 'location.query.inboundOrderCode');
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, value) => {
      if (!err) {
        const params = getFormatParams(value, materialList, 'edit');
        updateInboundOrder(params).then(() => {
          message.success('编辑入库单成功');
          history.push(`/stock/inboundOrder/detail?inboundOrderCode=${inboundOrderCode}`);
        });
      }
    });
  };

  render() {
    const { form, match } = this.props;
    const inboundOrderCode = _.get(match, 'location.query.inboundOrderCode');

    return (
      <Base
        type="edit"
        form={form}
        inboundOrderCode={inboundOrderCode}
        getFormatFormValue={this.getFormatFormValue}
        getInitialMaterialList={this.getInitialMaterialList}
        handleSubmit={this.handleSubmit}
      />
    );
  }
}

export default withForm({}, Edit);
