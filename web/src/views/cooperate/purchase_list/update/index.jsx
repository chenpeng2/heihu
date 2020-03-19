import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Proptypes from 'prop-types';
import _ from 'lodash';
import moment from 'utils/time';
import { message, Spin, Button, withForm, Form, FormItem, PlainText } from 'components';
import { replaceSign } from 'constants';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { replaceDot } from 'containers/purchase_list/util/repalceDot';
import { get_purchase_list_detail, update_purchase_list } from 'services/cooperate/purchase_list';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import MaterialTableForEdit from 'containers/purchase_list/update_purchase_list/material_table_for_update';

type Props = {
  style: {},
  form: {},
  match: {},
};
const customLanguage = getCustomLanguage();

/** 更新采购清单 */
class Update_Purchase_List extends Component {
  props: Props;
  state = {
    loading: false,
    purchase_list_data: null,
    purchase_list_code: null,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
  }

  componentDidMount() {
    const { form } = this.props;
    this.fetch_purchase_list_data()
      .then(res => {
        this.setState({
          purchase_list_data: res,
        });
        const { materials } = res || {};
        form.setFieldsValue({ materials });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  fetch_purchase_list_data = () => {
    const { match } = this.props;
    const { params } = match || {};
    const { code: purchase_list_code } = params;

    this.setState({ loading: true, purchase_list_code });

    return get_purchase_list_detail(purchase_list_code).then(res => {
      const { data } = res || {};
      const { data: detail_data } = data || {};

      return detail_data;
    });
  };

  renderHeader = () => {
    const ContainerStyle = { margin: '20px 0 30px 20px' };
    const TextStyle = { fontSize: 16 };
    return (
      <div style={ContainerStyle}>
        <PlainText
          intlParams={{ customLanguage: `${customLanguage.procure_order}` }}
          text="更新{customLanguage}"
          style={TextStyle}
        />
      </div>
    );
  };

  renderForm = () => {
    const { form } = this.props;
    const { purchase_list_data } = this.state;
    const { procureOrder } = purchase_list_data || {};
    const { procureOrderCode, operator, remark, supplier, procureOrderStatus } = procureOrder || {};
    const { getFieldDecorator } = form;
    const { config } = this.state;
    const useQrCode = config && config.config_use_qrcode.configValue;
    return (
      <Form>
        <FormItem label="编号">{procureOrderCode || replaceSign}</FormItem>
        <FormItem label="状态">{procureOrderStatus && procureOrderStatus.statusDisplay}</FormItem>
        <FormItem label="处理人">{(operator && operator.name) || replaceSign}</FormItem>
        {useQrCode === 'true' ? <FormItem label="供应商">{(supplier && supplier.name) || replaceSign}</FormItem> : null}
        <FormItem label="物料列表">
          {getFieldDecorator('materials', {
            rules: [
              {
                required: true,
                message: '物料列表必填',
              },
            ],
          })(
            <MaterialTableForEdit
              columnsData={purchase_list_data && purchase_list_data.materials}
              wrappedComponentRef={inst => (this.materialTableForm = inst)}
            />,
          )}
        </FormItem>
        <FormItem label="备注">{remark || replaceSign}</FormItem>
      </Form>
    );
  };

  renderFooter = () => {
    const { form } = this.props;
    const { purchase_list_code, purchase_list_data } = this.state;
    const { router } = this.context;
    const { validateFieldsAndScroll } = form;
    const { procureOrder } = purchase_list_data || {};
    const { procureOrderCode, operator, remark, supplier } = procureOrder || {};
    const container_style = { marginLeft: 120 };
    const button_style = { marginRight: 60, width: 114 };

    return (
      <div style={container_style}>
        <Button
          type="default"
          style={button_style}
          onClick={() => {
            router.history.push(`/cooperate/purchaseLists/${procureOrderCode}/detail/${purchase_list_code}`);
          }}
        >
          取消
        </Button>
        <Button
          style={button_style}
          onClick={() => {
            validateFieldsAndScroll((error, values) => {
              const materialListErrors = this.materialTableForm.wrappedInstance.validate_form_value();
              if (!error && !materialListErrors) {
                const { materials } = values || {};
                const materials_list = [];
                purchase_list_data.materials.forEach((item, index) => {
                  const {
                    amountPlanned,
                    amountInFactory: _amountInFactory,
                    materialCode,
                    planWorkOrderCode,
                    concernedPerson,
                    note,
                    demandTime,
                    projectCode,
                    purchaseOrderCode,
                    eta: _eta,
                    id,
                  } = item || {};
                  const material_code = replaceDot(materialCode);
                  const amountInFactory = materials[`material-${material_code}-${index}-amountInFactory`];
                  const eta = materials[`material-${material_code}-${index}-eta`] || moment(_eta);
                  const warning = materials[`material-${material_code}-${index}-warning`];
                  const warningLine = materials[`material-${material_code}-${index}-warningLine`];
                  materials_list.push({
                    id,
                    amountPlanned,
                    amountInFactory: amountInFactory === 0 || amountInFactory ? amountInFactory : _amountInFactory,
                    concernedPersonId: concernedPerson ? concernedPerson.id : null,
                    demandTime,
                    eta: eta ? Date.parse(eta) : null,
                    projectCode,
                    note,
                    purchaseOrderCode,
                    materialCode,
                    planWorkOrderCode,
                    warning,
                    warningLine,
                  });
                });
                update_purchase_list({
                  remark,
                  type: 'update',
                  procureOrderCode,
                  operatorId: operator ? operator.id : null,
                  supplierCode: supplier ? supplier.id : null,
                  materials: materials_list,
                }).then(() => {
                  router.history.push(`/cooperate/purchaseLists/${procureOrderCode}/detail/${purchase_list_code}`);
                });
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
          }}
        >
          确认
        </Button>
      </div>
    );
  };

  render() {
    const { loading } = this.state;
    return (
      <Spin spinning={loading}>
        {this.renderHeader()}
        {this.renderForm()}
        {this.renderFooter()}
      </Spin>
    );
  }
}

Update_Purchase_List.contextTypes = {
  router: {},
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, withRouter(Update_Purchase_List));
