import React, { Component } from 'react';
import Proptypes from 'prop-types';
import _ from 'lodash';
import { arrayIsEmpty } from 'utils/array';
import { message, withForm, PlainText } from 'components';
import { formatToUnix, setDayEnd } from 'utils/time';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { getCustomLanguage } from 'src/utils/customLanguage';
import {
  create_purchase_list,
  get_purchase_list_unique_code,
  get_purchase_list_operator,
} from 'services/cooperate/purchase_list';
import Header from './Header';
import Footer from './Footer';
import NotificationModal from './NotificationModal';
import PurchaseOrderCreatedForm from './Form';

const customLanguage = getCustomLanguage();

type Props = {
  style: {},
  form: {},
};

type State = {
  show_notification_modal: Boolean,
  id: any,
  config: any,
};

/** 创建采购清单 */
class Create_Purchase_List extends Component {
  props: Props;
  state: State = {
    show_notification_modal: false,
    id: null,
    config: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentDidMount() {
    const { form } = this.props;
    const { setFieldsValue } = form;

    get_purchase_list_unique_code().then(res => {
      const { data } = res || {};
      const { data: unique_code } = data || {};

      setFieldsValue({ code: unique_code });
    });

    get_purchase_list_operator().then(res => {
      const { data } = res || {};
      const { data: operatorData } = data || {};
      const { id, name } = operatorData || {};
      setFieldsValue({ operator: { key: id, label: name } });
    });
  }

  onCancel = () => {
    const { router } = this.context;
    router.history.push('/cooperate/purchaseLists');
  };

  onConfirm = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      const materialListErrors = this.materialTableForm.wrappedInstance.validate_form_value();
      if (!error && !materialListErrors) {
        const { code: procureOrderCode, operator, materialList, remark, supplier } = values || {};
        const { key: operatorId } = operator || {};
        const { key: supplierCode } = supplier || {};
        const materials = materialList.map(item => {
          const { material, project, demandTime, concernedPersonIds, workOrder, note, warning, warningLine } =
            item || {};
          let materialCode = '';
          const { amount, unit, newMaterial } = material || {};
          if (material.materialCode) {
            materialCode = material.materialCode;
          } else {
            materialCode = newMaterial.key.split('≈')[0];
          }
          const { projectCode, purchaseOrderNumber } = project || {};
          const { workOrderCode, purchaseOrderCode } = workOrder || {};
          return {
            demandTime: demandTime ? formatToUnix(setDayEnd(demandTime)) : null,
            concernedPersonIds: !arrayIsEmpty(concernedPersonIds) ? concernedPersonIds.map(x => x.key) : null,
            warning,
            warningLine,
            materialCode,
            projectCode,
            planWorkOrderCode: workOrderCode,
            purchaseOrderCode: purchaseOrderNumber || purchaseOrderCode,
            amountPlanned: amount,
            unitName: unit && unit.label,
            note,
          };
        });

        const error_index = materials.findIndex(item => {
          const { amountPlanned } = item || {};
          if (amountPlanned === 0) {
            return true;
          }
          return false;
        });

        if (error_index === -1) {
          create_purchase_list({
            operatorId,
            supplierCode,
            materials,
            procureOrderCode,
            remark,
          }).then(res => {
            if (sensors) {
              sensors.track('web_cooperate_purchaseLists_create', {
                CreateMode: '手动创建',
                amount: 1,
              });
            }
            const { data } = res.data;
            this.setState({
              id: data,
              code: procureOrderCode,
              show_notification_modal: true,
            });
          });
        } else {
          message.error('计划采购数量为0的物料清单请删除');
        }
      } else if (materialListErrors) {
        const material_list_errors_array = [];
        Object.values(materialListErrors).forEach(({ errors }) => {
          if (Array.isArray(errors)) {
            errors.forEach(({ message }) => {
              material_list_errors_array.push(message);
            });
          }
        });
        message.error(_.uniq(material_list_errors_array).join(','));
      }
    });
  };

  onModalCancel = () => {
    this.setState({ show_notification_modal: false });
  };

  onModalDone = () => {
    const { router } = this.context;
    const { code, id } = this.state;
    this.setState({ show_notification_modal: false });
    router.history.push(`/cooperate/purchaseLists/${code}/detail/${id}`);
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { show_notification_modal, config } = this.state;
    const useQrCode = config && config.config_use_qrcode.configValue;
    return (
      <div>
        <Header
          title={
            <PlainText intlParams={{ customLanguage: `${customLanguage.procure_order}` }} text="创建{customLanguage}" />
          }
        />
        <PurchaseOrderCreatedForm
          form={form}
          useQrCode={useQrCode}
          customLanguage={customLanguage}
          materialTableRef={ref => (this.materialTableForm = ref)}
        />
        <Footer onCancel={this.onCancel} onConfirm={this.onConfirm} />
        <NotificationModal
          desc={
            <PlainText
              intlParams={{ customLanguage: `${customLanguage.procure_order}` }}
              text="成功创建一个{customLanguage}"
            />
          }
          visible={show_notification_modal}
          onCancel={this.onModalCancel}
          onDone={this.onModalDone}
        />
      </div>
    );
  }
}

Create_Purchase_List.contextTypes = {
  router: {},
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, Create_Purchase_List);
