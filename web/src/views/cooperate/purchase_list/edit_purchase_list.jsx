import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { message, Textarea, Spin, Button, withForm, Form, FormItem, Input, Select } from 'src/components';
import { checkStringLength, codeFormat } from 'src/components/form';
import { black } from 'src/styles/color';
import { arrayIsEmpty } from 'utils/array';
import moment from 'src/utils/time';
import { formatToUnix, setDayEnd } from 'utils/time';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { replaceDot } from 'src/containers/purchase_list/util/repalceDot';
import SearchSelect from 'src/components/select/searchSelect';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { get_purchase_list_detail, update_purchase_list } from 'src/services/cooperate/purchase_list';
import format_material_list from 'src/containers/purchase_list/util/format_material_list';
import MaterialTableForEdit from 'src/containers/purchase_list/edit_purchase_list/material_table_for_edit';
import { replaceSign } from 'src/constants';

// style constant
const INPUT_WIDTH = 300;
const TEXT_AREA_HEIGHT = 100;
const Option = Select.Option;
const customLanguage = getCustomLanguage();

type Props = {
  style: {},
  form: {},
  match: {},
};

class Edit_Purchase_List extends Component {
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
        const data = this.formatData(res);
        this.setState({ purchase_list_data: data });

        const { materials, procureOrder } = data || {};
        const { procureOrderCode, operator, remark, supplier } = procureOrder || {};

        const { id, name } = operator || {};
        const { code, name: _name } = supplier || {};
        form.setFieldsValue({
          code: procureOrderCode,
          operator: { key: id, label: name },
          remark,
          // materials: format_material_list(materials),
          supplier: { key: code, label: _name },
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  formatData = ({ materials, procureOrder }) => {
    const _materials = arrayIsEmpty(materials)
      ? []
      : materials.map(m => {
          const { concernedPersonList: concernedPersons, ...rest } = m;
          const concernedPersonList = arrayIsEmpty(concernedPersons)
            ? null
            : concernedPersons.map(({ id, name }) => ({ key: id, label: name }));
          return { ...rest, concernedPersonList };
        });
    return { materials: _materials, procureOrder };
  };

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

  render_title = () => {
    const style = {
      margin: '20px 0 30px 20px',
      color: black,
      fontSize: 16,
    };

    return <div style={style}> 编辑{customLanguage.procure_order} </div>;
  };

  render_form = () => {
    const { form } = this.props;
    const { purchase_list_data } = this.state;
    const { procureOrder } = purchase_list_data || {};
    const { supplier } = procureOrder || {};
    const { getFieldDecorator } = form;
    const { config } = this.state;
    const useQrCode = config && config.config_use_qrcode.configValue;
    return (
      <Form>
        <FormItem label={'编号'}>
          {getFieldDecorator('code', {
            rules: [
              { required: true, message: `${customLanguage.procure_order}编号必填` },
              { validator: codeFormat(`${customLanguage.procure_order}编号`) },
            ],
          })(<Input style={{ width: INPUT_WIDTH }} disabled />)}
        </FormItem>
        <FormItem label={'处理人'}>
          {getFieldDecorator('operator')(
            <SearchSelect style={{ width: INPUT_WIDTH }} type={'account'} className="select-input" />,
          )}
        </FormItem>
        {useQrCode === 'true' ? (
          <FormItem label={'供应商'}>
            {supplier
              ? getFieldDecorator('supplier')(
                  <Select disabled labelInValue style={{ width: INPUT_WIDTH }}>
                    <Option value={supplier.code}>{supplier.name}</Option>
                  </Select>,
                )
              : replaceSign}
          </FormItem>
        ) : null}
        <FormItem label={'物料列表'}>
          {getFieldDecorator('materials', {
            // rules: [{ required: true, message: '物料列表必填' }],
          })(
            <MaterialTableForEdit
              columnsData={purchase_list_data && purchase_list_data.materials}
              wrappedComponentRef={inst => (this.materialTableForm = inst)}
            />,
          )}
        </FormItem>
        <FormItem label={'备注'}>
          {getFieldDecorator('remark', {
            rules: [
              {
                validator: checkStringLength(100),
              },
            ],
          })(<Textarea maxLength={100} style={{ width: INPUT_WIDTH, height: TEXT_AREA_HEIGHT }} />)}
        </FormItem>
      </Form>
    );
  };

  render_footer_buttons = () => {
    const { form } = this.props;
    const { purchase_list_code, purchase_list_data } = this.state;
    const { router } = this.context;
    const { procureOrder } = purchase_list_data || {};
    const { procureOrderCode } = procureOrder || {};
    const { validateFieldsAndScroll } = form;

    const container_style = { marginLeft: 120 };
    const button_style = { marginRight: 60, width: 114 };

    return (
      <div style={{ ...container_style, marginTop: 30 }}>
        <Button
          type={'default'}
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
              const materialList = this.materialTableForm.wrappedInstance.props.form.getFieldsValue();
              if (!error && !materialListErrors) {
                const { code, remark, materials, operator, supplier } = values || {};
                const materials_list = [];
                purchase_list_data.materials.forEach((item, index) => {
                  const {
                    amountPlanned,
                    amountInFactory,
                    materialCode,
                    planWorkOrderCode,
                    demandTime: _demandTime,
                    note: _note,
                    projectCode,
                    purchaseOrderCode,
                    eta,
                    id,
                  } = item || {};
                  const material_code = replaceDot(materialCode);
                  const amount = materialList[`material-${material_code}-${index}-amount`] || amountPlanned;
                  const concernedPersonList = materialList[`material-${material_code}-${index}-concernedPersonList`];
                  const demandTime =
                    materialList[`material-${material_code}-${index}-demandTime`] || moment(_demandTime);
                  const note = materialList[`material-${material_code}-${index}-note`] || _note;
                  const warning = materialList[`material-${material_code}-${index}-warning`];
                  const warningLine = materialList[`material-${material_code}-${index}-warningLine`];
                  materials_list.push({
                    id,
                    amountPlanned: amount,
                    amountInFactory,
                    concernedPersonIds: arrayIsEmpty(concernedPersonList)
                      ? null
                      : concernedPersonList.map(({ key }) => key),
                    demandTime: demandTime ? formatToUnix(setDayEnd(demandTime)) : null,
                    eta: eta ? Date.parse(eta) : null,
                    projectCode,
                    purchaseOrderCode,
                    materialCode,
                    note,
                    planWorkOrderCode,
                    warning,
                    warningLine,
                  });
                });

                update_purchase_list({
                  remark,
                  type: 'edit',
                  procureOrderCode: code,
                  operatorId: operator ? operator.key : null,
                  supplierCode: supplier ? supplier.key : null,
                  materials: materials_list,
                }).then(() => {
                  if (sensors) {
                    sensors.track('web_cooperate_purchaseLists_edit', {});
                  }
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
        {this.render_title()}
        {this.render_form()}
        {this.render_footer_buttons()}
      </Spin>
    );
  }
}

Edit_Purchase_List.contextTypes = {
  router: {},
};

export default withForm({}, withRouter(Edit_Purchase_List));
