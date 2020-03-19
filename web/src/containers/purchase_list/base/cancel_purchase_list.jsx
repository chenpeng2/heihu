import React, { Component } from 'react';
import PropTypes from 'prop-types';
import auth from 'utils/auth';
import { primary, white } from 'src/styles/color';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { Popover, Alert, Button, buttonAuthorityWrapper, Link } from 'src/components';
import { update_purchase_list_state } from 'src/services/cooperate/purchase_list';

const LinkWithAuth = buttonAuthorityWrapper(Link);
const customLanguage = getCustomLanguage();

type Props = { render: () => {}, style: {}, purchase_list_code: string, cb: () => {}, code: string };

class Cancel_Purchase_List extends Component {
  props: Props;
  state = {
    visible: false,
  };

  hide = () => {
    this.setState({ visible: false });
  };

  open = () => {
    this.setState({ visible: true });
  };

  render_content = () => {
    const { purchase_list_code, cb, code } = this.props || {};
    const { changeChineseToLocale } = this.context;

    return (
      <div>
        <Alert
          style={{ width: 204, background: white, border: 'none' }}
          message={changeChineseToLocale(
            `确定${code === 'created' ? '取消' : '结束'}${customLanguage.procure_order}吗？`,
          )}
          showIcon
          type={'error'}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type={'default'} size={'small'} style={{ marginRight: 10 }} onClick={this.hide}>
            {changeChineseToLocale(`暂不${code === 'created' ? '取消' : '结束'}`)}
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              update_purchase_list_state({
                procureOrderCode: purchase_list_code,
                toStatus: code === 'created' ? 'aborted' : 'done',
              })
                .then(() => {
                  // code = created时 为取消
                  if (sensors && code !== 'created') {
                    sensors.track('web_cooperate_purchaseLists_end', {});
                  }
                  if (cb) cb();
                })
                .finally(() => {
                  this.hide();
                });
            }}
          >
            {code === 'created' ? '取消' : '结束'}
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    const { render, style, code } = this.props || {};

    return (
      <Popover trigger={'click'} content={this.render_content()} visible={visible}>
        <LinkWithAuth
          auth={auth.WEB_ABORT_PROCURE_ORDER}
          style={{ cursor: 'pointer', display: 'inline-block', color: primary, margin: '0 5px', ...style }}
          onClick={this.open}
        >
          {render ? render() : code === 'created' ? '取消' : '完成'}
        </LinkWithAuth>
      </Popover>
    );
  }
}

Cancel_Purchase_List.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default Cancel_Purchase_List;
