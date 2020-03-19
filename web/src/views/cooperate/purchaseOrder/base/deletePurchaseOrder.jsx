import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import { Popover, Button, Icon, Link, authorityWrapper } from 'src/components';
import { error, warning } from 'src/styles/color';
import auth from 'utils/auth';
import { deletePurchaseOrder, getDeliveryRequestByPurchaseOrder } from 'src/services/cooperate/purchaseOrder';
import styles from './styles.scss';

const LinkWithAuth = authorityWrapper(Link);

type Props = {
  render: () => {},
  code: string,
  style: {},
  fetchData: () => {},
  data: {},
  icon: string,
  type: string,
  page: string,
  history: {
    push: () => {},
  },
};

/** 删除销售订单 */
class DeletePurchaseOrder extends Component {
  props: Props;
  state = {
    confirmTitle: '删除后无法恢复，确定删除吗？',
    okText: '删除',
    cancelText: '暂不删除',
    visible: false,
  };

  /** 检查发运申请 */
  checkDeliveryRequest = async purchaseOrder => {
    // 已经关联到非「已取消」状态的发运申请上，则不可删除
    const { purchaseOrderCode, materialList } = purchaseOrder || {};
    if (Array.isArray(materialList) && materialList.length > 0) {
      const lineIds = materialList.map(({ id }) => id);
      await getDeliveryRequestByPurchaseOrder({
        headerStatus: [0, 1, 2, 3, 5],
        code: purchaseOrderCode,
        lineIds,
      })
        .then(res => {
          const data = _.get(res, 'data.data');
          if (Array.isArray(data) && data.length > 0) {
            const deliveryRequestCodes = data.map(({ headerCode }) => headerCode);
            const text = _.join(deliveryRequestCodes, ', ');
            this.setState({
              visible: true,
              confirmTitle: `已经关联到发运申请 ${text} 上，不可删除`,
              okText: null,
              cancelText: '知道了',
            });
            return;
          }
          this.checkDelivered(purchaseOrder);
        })
        .catch(err => console.log(err));
    } else {
      this.checkDelivered(purchaseOrder);
    }
  };

  /** 检查是否出厂 */
  checkDelivered = purchaseOrder => {
    // 已经进行了按销售订单出厂，则不可删除
    const { materialList } = purchaseOrder || {};
    if (Array.isArray(materialList) && materialList.length > 0) {
      const deliveredMaterials = materialList.filter(m => m.amountDone > 0);
      if (Array.isArray(deliveredMaterials) && deliveredMaterials.length > 0) {
        const text = _.join(_.map(deliveredMaterials, o => o.materialCode), ',');
        this.setState({
          visible: true,
          confirmTitle: `${text} 已出厂，不可删除`,
          okText: null,
          cancelText: '知道了',
        });
        return;
      }
    }
    this.checkWorkOrder(purchaseOrder);
  };

  checkWorkOrder = purchaseOrder => {
    // 如果已经关联到非「已取消」状态的计划工单/项目上，则不可删除
    const { workOrders, projects } = purchaseOrder || {};
    let text;
    if (Array.isArray(workOrders) && workOrders.length > 0) {
      text = `计划工单 ${_.join(workOrders, ', ')}`;
    } else if (Array.isArray(projects) && projects.length > 0) {
      const projectCodes = projects.map(({ projectCode }) => projectCode);
      text = `项目 ${_.join(projectCodes, ', ')}`;
    }
    if (text) {
      this.setState({
        visible: true,
        confirmTitle: `已关联${text} 不可删除！`,
        okText: null,
        cancelText: '知道了',
      });
      return null;
    }
    this.setState({ visible: true });
  };

  renderContent = () => {
    const { okText, cancelText } = this.state;
    const { code, fetchData, page } = this.props;

    return (
      <div>
        {cancelText ? (
          <Button type="default" onClick={() => this.setState({ visible: false })}>
            {cancelText}
          </Button>
        ) : null}
        {okText ? (
          <Button
            style={{ backgroundColor: error, width: 74 }}
            onClick={() => {
              if (!code) return null;

              deletePurchaseOrder(code).then(({ data: { statusCode } }) => {
                if (statusCode === 200) {
                  this.setState({ visible: false });
                }
                if (page === 'detail') {
                  this.props.history.push('/cooperate/purchaseOrders');
                  return;
                }
                if (fetchData && typeof fetchData === 'function') {
                  fetchData();
                }
              });
            }}
          >
            {okText}
          </Button>
        ) : null}
      </div>
    );
  };

  render() {
    const { style, data, icon, type } = this.props;
    const { changeChineseToLocale } = this.context;
    const { confirmTitle, visible } = this.state;

    return (
      <Popover
        autoAdjustOverflow
        placement={'topRight'}
        overlayClassName={styles.popconfirm}
        title={
          <div>
            <Icon color={warning} type="info-circle" theme="filled" />
            {changeChineseToLocale(confirmTitle)}
          </div>
        }
        trigger="click"
        visible={visible}
        content={this.renderContent()}
      >
        <LinkWithAuth
          auth={auth.WEB_DELETE_PURCHASE_ORDER}
          icon={icon}
          style={style}
          type={type}
          onClick={() => this.checkDeliveryRequest(this.props.data)}
        >
          {_.get(data, 'status.value') === 1 ? '删除' : null}
        </LinkWithAuth>
      </Popover>
    );
  }
}

DeletePurchaseOrder.contextTypes = {
  changeChineseToLocale: () => {},
};

export default withRouter(DeletePurchaseOrder);
