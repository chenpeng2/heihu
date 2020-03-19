import React, { useState, useEffect, useRef, Fragment, useCallback } from 'react';
import _ from 'lodash';

import log from 'utils/log';
import { arrayIsEmpty } from 'utils/array';
import { Checkbox, OpenModal, Button, Modal } from 'components';
import { genTransferRequest } from 'services/cooperate/plannedTicket';
import WorkOrderTransReqModel from 'models/cooperate/planWorkOrder/WorkOrderTransReqModel';
import { getAvailableAmount } from 'services/cooperate/materialRequest';

import TransferRequestTable from './TransferRequestTable';
import styles from '../styles.scss';
import { workOrderData, transferReqData } from './mock.json';
import { formatFormValueForSubmit } from '../util';

const AntModal = Modal.AntModal;

type FooterPropsType = {
  disabled: Boolean,
  workOrderData: Object,
  form: any,
  onSubmit: () => {},
  submiting: Boolean,
  setSubmiting: () => {},
  fieldsValue: {},
  collectData: () => {},
};

export async function queryAvailableInventory(materialCode, warehouseCode) {
  try {
    const res = await getAvailableAmount({
      materialCode,
      warehouseCode,
    });
    const availableInventory = _.get(res, 'data.data');
    return availableInventory;
  } catch (error) {
    log.error(error);
  }
}

export default function TransferReqCheckbox(props: FooterPropsType) {
  const { disabled, form, onSubmit, submiting, collectData, setSubmiting } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  let formRef = useRef(form);
  const fieldName = 'transferReq';

  function collectFormFields() {
    if (modalVisible) {
      const myForm = _.get(formRef, 'props.form', {});
      myForm.validateFieldsAndScroll([fieldName], (err, values) => {
        if (!err) {
          const fieldsValue = collectData();
          const submitValue = _.omit(fieldsValue, [fieldName]);
          const transfers = WorkOrderTransReqModel.formatToApi(values[fieldName]);
          if (typeof onSubmit === 'function') {
            onSubmit({ ...submitValue, transfers });
          }
        }
      });
    }
  }

  async function onChangeForSourceWarehouse(materialCode, warehouseCode, record) {
    const availableInventory = await queryAvailableInventory(materialCode, warehouseCode);
    record.updateItem(availableInventory, 'availableInventory');
    const newData = tableData.concat([]);
    setTableData(newData);
  }

  const formatToModel = useCallback(() => {
    if (!arrayIsEmpty(tableData)) {
      const tableData = arrayIsEmpty(transferReqData)
        ? []
        : transferReqData.map(d => WorkOrderTransReqModel.fromJson(d));
      return tableData;
    }
  }, [tableData]);

  useEffect(() => {
    if (modalVisible && submiting) {
      form.resetFields([fieldName]);
      const workOrderData = collectData();
      if (workOrderData) {
        setLoading(true);
        genTransferRequest(workOrderData)
          .then(res => {
            const transferReqData = _.get(res, 'data.data');
            const tableData = arrayIsEmpty(transferReqData)
              ? []
              : transferReqData.map(d => WorkOrderTransReqModel.fromJson(d));
            setTableData(tableData);
          })
          .catch(err => log.error(err))
          .finally(e => setLoading(false));
      }
    }
  }, [modalVisible, submiting]);

  function onModalVisibleChange() {
    form.setFieldsValue({ createTransReq: !modalVisible });
    setModalVisible(!modalVisible);
  }

  function cancelSubmit() {
    setModalVisible(false);
    setSubmiting(false);
    setTableData([]);
  }

  return (
    <Fragment>
      <Checkbox
        className={styles['inline-block']}
        checked={modalVisible && !disabled}
        disabled={disabled}
        onChange={onModalVisibleChange}
      >
        占用库存
      </Checkbox>
      <AntModal
        title="创建转移申请"
        width={1142}
        visible={modalVisible && submiting}
        onOk={collectFormFields}
        onCancel={onModalVisibleChange}
        maskClosable={false}
        afterClose={cancelSubmit}
      >
        <TransferRequestTable
          loading={loading}
          wrappedComponentRef={e => (formRef = e)}
          fieldName={fieldName}
          rowClassName={styles['work-order-form-table-tr']}
          onChangeForSourceWarehouse={onChangeForSourceWarehouse}
          dataSource={tableData}
        />
      </AntModal>
    </Fragment>
  );
}
