import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import auth from 'utils/auth';
import { replaceSign } from 'src/constants';
import { black, middleGrey } from 'src/styles/color';
import { Icon, Spin, Link, buttonAuthorityWrapper, Modal, PlainText } from 'src/components';
import { getCustomLanguage } from 'src/utils/customLanguage';
import LinkToEditPurchaseListPage from 'src/containers/purchase_list/base/link_to_edit_purchase_list_page';
import LinkToUpdatePurchaseListPage from 'src/containers/purchase_list/base/link_to_update_purchase_list_page';
import LinkToPurchaseListOperationHistoryPage from 'src/containers/purchase_list/base/link_to_purchase_list_operation_history';
import CancelPurchaseList from 'src/containers/purchase_list/base/cancel_purchase_list';
import MaterialListTreeTable from 'src/containers/purchase_list/base/material_list_tree_table';
import format_purchase_list from 'src/containers/purchase_list/util/format_material_list';
import { getOrganizationConfigFromLocalStorage } from 'src/utils/organizationConfig';
import { update_purchase_list_state, get_purchase_list_detail } from 'src/services/cooperate/purchase_list';
import { toPurchaseMaterialIncoming } from './navigation';

type Props = {
  style: {},
  match: {},
  location: any,
};
const LinkWithAuth = buttonAuthorityWrapper(Link);
const customLanguage = getCustomLanguage();
const AntModal = Modal.AntModal;

class Purchase_List_Detail extends Component {
  props: Props;
  state = {
    purchase_list_data: null,
    loading: false,
  };

  componentWillMount() {
    const config = getOrganizationConfigFromLocalStorage();
    this.setState({ config });
    this.fetch_purchase_list_data();
  }

  fetch_purchase_list_data = () => {
    const { match } = this.props;
    const { params } = match;
    const { id, code } = params || {};

    this.setState({ loading: true });

    get_purchase_list_detail(id)
      .then(res => {
        const { data } = res || {};
        const { data: realData } = data || {};

        this.setState({
          purchase_list_data: realData,
          purchase_list_code: id,
          code,
        });
      })
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  render_operation = () => {
    const { purchase_list_code, purchase_list_data, code: procureOrder_code } = this.state;
    const { procureOrder } = purchase_list_data || {};
    const { procureOrderStatus } = procureOrder || {};
    const { code } = procureOrderStatus || {};

    const { amountFinished } = procureOrder || {};
    const container_style = { margin: '0px 20px', lineHeight: '24px' };
    const icon_style = { verticalAlign: 'middle' };
    const text_style = { verticalAlign: 'middle' };
    const { changeChineseToLocale } = this.context;
    return (
      <div style={{ display: 'flex', float: 'right', marginRight: 20 }}>
        <React.Fragment>
          {code === 'created' ? (
            <React.Fragment>
              <LinkWithAuth
                style={container_style}
                auth={auth.WEB_EDIT_PROCURE_ORDER}
                onClick={() => {
                  update_purchase_list_state({ toStatus: 'applied', procureOrderCode: procureOrder_code }).then(() => {
                    AntModal.success({
                      title: changeChineseToLocale('提交成功'),
                    });
                    this.fetch_purchase_list_data();
                  });
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon style={icon_style} type="tijiaoicon" iconType={'gc'} />
                  <PlainText text="提交" style={text_style} />
                </div>
              </LinkWithAuth>
              <LinkToEditPurchaseListPage
                purchase_list_code={purchase_list_code}
                style={container_style}
                render={() => {
                  return (
                    <div>
                      <Icon style={icon_style} type="bianji" iconType={'gc'} />
                      <PlainText text="编辑" style={text_style} />
                    </div>
                  );
                }}
              />
            </React.Fragment>
          ) : null}
          {code === 'applied' ? (
            <LinkWithAuth
              style={container_style}
              auth={auth.WEB_PROCURE_IN_FACTORY}
              to={toPurchaseMaterialIncoming({ code: procureOrder_code, id: purchase_list_code })}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon style={icon_style} type="ruchangcaozuoICON1" iconType={'gc'} />
                <PlainText text="入厂" style={text_style} />
              </div>
            </LinkWithAuth>
          ) : null}
          {code !== 'created' ? (
            <Link
              style={container_style}
              onClick={() => {
                this.props.history.push(
                  `/cooperate/purchaseLists/${procureOrder_code}/detail/${purchase_list_code}/admitRecord`,
                );
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon style={{ ...icon_style, fontSize: 16, paddingRight: 8 }} type="eye-o" />
                <PlainText text="查看入厂记录" style={text_style} />
              </div>
            </Link>
          ) : null}
          {code === 'applied' ? (
            <LinkToUpdatePurchaseListPage
              purchase_list_code={purchase_list_code}
              style={container_style}
              render={() => {
                return (
                  <div>
                    <Icon style={icon_style} type="gengxin" iconType={'gc'} />
                    <PlainText text="更新" style={text_style} />
                  </div>
                );
              }}
            />
          ) : null}
          {code === 'done' || code === 'aborted' || amountFinished > 0 ? null : (
            <CancelPurchaseList
              purchase_list_code={procureOrder_code}
              style={container_style}
              code={code}
              cb={() => this.fetch_purchase_list_data()}
              render={() => {
                return (
                  <div>
                    <Icon style={icon_style} type={code === 'created' ? 'quxiao' : 'wanchengICON1'} iconType={'gc'} />
                    <PlainText text={code === 'created' ? '取消' : '完成'} style={text_style} />
                  </div>
                );
              }}
            />
          )}
        </React.Fragment>
        <LinkToPurchaseListOperationHistoryPage
          purchase_list_code={procureOrder_code}
          id={purchase_list_code}
          style={{ ...container_style, lineHeight: '24px' }}
          render={() => {
            return (
              <div>
                <Icon style={{ ...icon_style, fontSize: 16, paddingRight: 8 }} type="eye-o" />
                <PlainText text="查看操作记录" style={text_style} />
              </div>
            );
          }}
        />
      </div>
    );
  };

  render_material_list = data => {
    const data_after_format = format_purchase_list(data);
    return <MaterialListTreeTable material_data={data} key={JSON.stringify(data_after_format)} />;
  };

  render_item = (label, component) => {
    const label_style = { color: middleGrey, width: 100, display: 'inline-block', textAlign: 'right' };
    const component_style = {
      display: 'inline-block',
      marginLeft: 10,
      verticalAlign: 'top',
      maxWidth: 1000,
      overflowWrap: 'break-word',
    };
    const container_style = { display: 'flex', margin: '20px 0 20px 20px' };

    return (
      <div style={container_style}>
        <PlainText text={label} style={label_style} />
        <PlainText text={component || replaceSign} style={component_style} />
      </div>
    );
  };

  render() {
    const { purchase_list_data, loading, config } = this.state;
    const { changeChineseToLocale } = this.context;
    const { procureOrder, materials } = purchase_list_data || {};
    const { operator, procureOrderCode, supplier, remark, procureOrderStatus } = procureOrder || {};
    const { name } = operator || {};
    const useQrCode = config && config.config_use_qrcode.configValue;

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '20px 0 30px 20px' }}>
          <PlainText
            intlParams={{ customLanguage: `${customLanguage.procure_order}` }}
            text="{customLanguage}详情"
            style={{ fontSize: 16 }}
          />
          {this.render_operation()}
        </div>
        {this.render_item('编号', procureOrderCode)}
        {this.render_item('状态', procureOrderStatus && procureOrderStatus.statusDisplay)}
        {this.render_item('处理人', name)}
        {useQrCode === 'true' ? this.render_item('供应商', (supplier && supplier.name) || replaceSign) : null}
        {this.render_item('物料列表', this.render_material_list(materials))}
        {this.render_item('备注', remark)}
      </Spin>
    );
  }
}

Purchase_List_Detail.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(Purchase_List_Detail);
