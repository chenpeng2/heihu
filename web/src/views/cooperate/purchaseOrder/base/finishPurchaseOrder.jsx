import React, { Component } from 'react';
import _ from 'lodash';

import { Popover, Button, Icon, Link, OpenModal, message, haveAuthority } from 'src/components';
import { warning } from 'src/styles/color';
import { getPurchaseOrderFinishReasons, editPurchaseOrder } from 'services/cooperate/purchaseOrder';
import auth from 'utils/auth';

import FinishReasonForm from './finishReasonForm';

import styles from './styles.scss';

type Props = {
  render: () => {},
  code: string, // 实际是id
  style: {},
  refetch: () => {},
  data: {},
  icon: string,
  type: string,
  page: string,
};

class FinishPurchaseOrder extends Component {
  props: Props;
  state = {
    confirmTitle: '确定结束该销售订单吗？',
    okText: '确定',
    cancelText: '取消',
    visible: false,
  };

  onFinishClick = async () => {
    const {
      data: { data },
    } = await getPurchaseOrderFinishReasons({ status: 1 });

    if (data && data.length <= 0) {
      this.setState({ visible: !this.state.visible });
      return null;
    }

    this.openFinishModal();
  };

  finishPurchaseOrder = async params => {
    const { code, refetch, data, page } = this.props;

    if (!code) return null;

    const status = _.get(data, 'status.value');

    if (status === 1) {
      await editPurchaseOrder(code, { ...params, status: 0 })
        .then(({ data: { statusCode } }) => {
          if (statusCode === 200) {
            if (sensors) {
              sensors.track('web_cooperate_purchaseOrders_end', {});
            }
            message.success('结束成功！');
            if (page === 'detail') {
              refetch(code);
              return;
            }
            refetch();
          }
        })
        .catch(err => console.log(err));
    }
  };

  openFinishModal = () => {
    OpenModal({
      width: 815,
      children: <FinishReasonForm wrappedComponentRef={inst => (this.form = inst)} />,
      title: '选择结束原因',
      okText: '结束',
      cancelText: '暂不结束',
      onOk: async () => {
        const values = this.form.submit() || {};
        await this.finishPurchaseOrder(values);
      },
    });
  };

  renderContent = () => {
    const { okText, cancelText } = this.state;

    return (
      <div>
        {cancelText ? (
          <Button type="default" onClick={() => this.setState({ visible: false })}>
            {cancelText}
          </Button>
        ) : null}
        {okText ? (
          <Button
            onClick={() => {
              this.finishPurchaseOrder();
              this.setState({ visible: false });
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
    const { confirmTitle, visible } = this.state;

    return (
      <Popover
        overlayClassName={styles.popconfirm}
        title={
          <div>
            <Icon color={warning} type="info-circle" theme="filled" />
            {confirmTitle}
          </div>
        }
        trigger="click"
        visible={visible}
        content={this.renderContent()}
      >
        <Link
          disabled={!haveAuthority(auth.WEB_FINISH_PURCHASE_ORDER)}
          icon={icon}
          style={style}
          type={type}
          onClick={() => this.onFinishClick()}
        >
          {_.get(data, 'status.value') === 1 ? '结束' : null}
        </Link>
      </Popover>
    );
  }
}

export default FinishPurchaseOrder;
