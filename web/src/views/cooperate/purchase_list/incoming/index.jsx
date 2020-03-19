import React, { Component } from 'react';
import _ from 'lodash';
import log from 'utils/log';
import { formatUnixMoment, formatToUnix, genMilliseconds, setDayEnd, format } from 'utils/time';
import { setLocation } from 'utils/url';
import { arrayIsEmpty } from 'utils/array';
import { withForm, Modal, message } from 'components';
import { getQuery } from 'src/routes/getRouteParams';
import PurchaseIncomingViewModel from 'models/cooperate/purchaseOrder/viewModels/PurchaseIncomingViewModel';
import { purchaseMaterialBulkIncoming, filterProcureOrderDetail } from 'src/services/cooperate/purchase_list';
import { ALL_INCOMING_DEFAULT, PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD, viewTypeChineseMap } from '../constants';
import Header from './Header';
import Content from './Content';
import Footer from './Footer';
import styles from './styles.scss';
import { topurchaseOrderDetail } from '../navigation';
import { getSpecificationParams } from './Content/BaseComponents/IncomingSpecificationSelect';
import { FIELDNAME } from './utils';

const AntModal = Modal.AntModal;

type PurchaseMaterialIncomingProps = {
  form: any,
  history: any,
};

type PurchaseMaterialIncomingStateTypes = {
  viewType: Number,
  materialList: Array,
  purchaseOrderData: Object,
};

class PurchaseMaterialIncoming extends Component<PurchaseMaterialIncomingProps, PurchaseMaterialIncomingStateTypes> {
  state = {
    viewType: PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD,
    materialList: [],
    purchaseOrderData: {},
  };

  componentDidMount() {
    const { match, form } = this.props;
    const { setFieldsValue } = form || {};
    const query = getQuery(match);
    const { filter } = query || {};
    setFieldsValue(filter || {});
    this.fetchData({ filter });
  }

  filterPayloads = payloads => {
    console.log(payloads);
    const _payloads = arrayIsEmpty(payloads) ? null : payloads.filter(x => x && x.checked);
    if (arrayIsEmpty(_payloads)) {
      message.error('请至少选择一个物料进行入厂');
      return null;
    }
    console.log(_payloads);
    return _payloads;
  };

  validateFunc = () => {
    const formRef = _.get(this.formRef, 'props.form');
    let result = false;
    formRef.validateFieldsAndScroll(async (err, values) => {
      if (err) {
        result = false;
      } else {
        result = !arrayIsEmpty(this.filterPayloads(values[`${FIELDNAME}`]));
      }
    });
    return result;
  };

  fetchData = params => {
    const { filter, ...restParams } = params || {};
    const id = _.get(this.props, 'match.params.id');
    const query = getQuery(this.props.match);
    const variables = Object.assign(query, { filter: { isAllInFactory: ALL_INCOMING_DEFAULT, ...filter } }, restParams);
    setLocation(this.props, p => ({ ...p, ...variables }));
    if (id) {
      filterProcureOrderDetail({ id, ...variables })
        .then(res => {
          const data = _.get(res, 'data.data');
          const { materials, procureOrder } = data || {};
          this.setState({ materialList: materials, purchaseOrderData: procureOrder });
        })
        .catch(err => log.error(err));
    }
  };

  onCancel = () => {
    const id = _.get(this.props, 'match.params.id');
    const code = _.get(this.props, 'match.params.code');
    this.props.history.push(topurchaseOrderDetail({ code, id }));
  };

  formatSumbitData = data => {
    return data.map(payloads => {
      const {
        validDateMoment,
        productionDateMoment,
        incomingSpecification,
        qrCodeAndAmount,
        amount,
        storage,
        incomingBatch,
        incomingNote,
        supplierBatch,
        productionPlace,
        materialCode,
        materialLineId,
        useUnit,
      } = payloads;
      return {
        validPeriod: validDateMoment ? formatToUnix(validDateMoment) : null,
        productionDate: validDateMoment ? formatToUnix(productionDateMoment) : null,
        codeAndAmounts: qrCodeAndAmount,
        totalAmount: amount,
        storageId: storage ? _.get(storage.split(','), '0') : null,
        inboundBatch: incomingBatch,
        supplierBatch,
        note: incomingNote,
        province: productionPlace && productionPlace[0],
        city: productionPlace && productionPlace[1],
        specification: getSpecificationParams(incomingSpecification),
        materialCode,
        id: materialLineId,
        unitName: useUnit,
      };
    });
  };

  bulkIncomingResponseCheck = (statusCode: Number) => {
    const id = _.get(this.props, 'match.params.id');
    const code = _.get(this.props, 'match.params.code');
    if (statusCode === 200) {
      message.success('入厂成功');
      this.props.history.push(`/cooperate/purchaseLists/${code}/detail/${id}/admitRecord`);
    }
  };

  onSubmit = (eSignPayloads: Object) => {
    const formRef = _.get(this.formRef, 'props.form');
    formRef.validateFieldsAndScroll(async (err, values) => {
      console.log(values);
      if (!err) {
        this.setState({ submitLoading: true });
        const payloads = values[`${FIELDNAME}`];
        const _payloads = await this.filterPayloads(payloads);
        if (!arrayIsEmpty(_payloads)) {
          const materials = this.formatSumbitData(_payloads);
          const id = _.get(this.props, 'match.params.id');
          const code = _.get(this.props, 'match.params.code');
          const params = { materials, procureOrderId: id, ...eSignPayloads };
          console.log({ materials });
          purchaseMaterialBulkIncoming(params)
            .then(res => {
              const { data, statusCode } = _.get(res, 'data');
              if (statusCode === 302) {
                AntModal.confirm({
                  iconType: 'exclamation-circle',
                  title: '',
                  content: `${data}`,
                  okText: '确定入厂',
                  cancelText: '暂不入厂',
                  onOk: () => {
                    purchaseMaterialBulkIncoming({
                      ...params,
                      force: true,
                    })
                      .then(res => {
                        const { data, statusCode } = _.get(res, 'data');
                        const { viewType } = this.state;
                        if (sensors) {
                          sensors.track('web_cooperate_purchaseListss_admit_create', {
                            FillWay: viewTypeChineseMap[viewType],
                            PlatformType: 'Web',
                          });
                        }
                        this.bulkIncomingResponseCheck(statusCode);
                      })
                      .catch(err => log.error(err));
                  },
                });
              }
              this.bulkIncomingResponseCheck(statusCode);
            })
            .catch(err => log.error(err))
            .finally(() => this.setState({ submitLoading: false }));
        }
      }
    });
  };

  handleViewToggleChange = e => {
    this.setState({ viewType: _.get(e, 'target.value', PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD) }, () => {
      const formRef = _.get(this.formRef, 'props.form');
      formRef.resetFields();
    });
  };

  render() {
    const { form } = this.props;
    const { materialList, purchaseOrderData, viewType, submitLoading } = this.state;

    return (
      <div className={styles['purchase-material-incoming-container']}>
        <Header form={form} filterFn={this.fetchData} />
        <Content
          handleViewToggleChange={this.handleViewToggleChange}
          viewType={viewType}
          wrappedComponentRef={inst => (this.formRef = inst)}
          fetchData={this.fetchData}
          materialList={materialList}
          purchaseOrderData={purchaseOrderData}
        />
        <Footer
          disabled={arrayIsEmpty(materialList)}
          submitLoading={submitLoading}
          validateFunc={this.validateFunc}
          submitFn={this.onSubmit}
          cancelFn={this.onCancel}
        />
      </div>
    );
  }
}

PurchaseMaterialIncoming.propTypes = {};

export default withForm({}, PurchaseMaterialIncoming);
