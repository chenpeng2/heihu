import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Button, message as AntMessage, Popconfirm, FormattedMessage } from 'src/components';
import { error, blacklakeGreen } from 'src/styles/color/index';
import { updateProcessRouteStatus, enableAllProcessUnderProcessRouting } from 'src/services/bom/processRouting';
import auth from 'src/utils/auth';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';

const PopConfirmWithCustomButton = Popconfirm.PopConfirmWithCustomButton;

const baseStyle = { margin: '0px 10px', cursor: 'pointer', color: blacklakeGreen };

type Props = {
  processRouting: any,
  style: any,
  fetchData: () => {},
};

class UpdateProcessRoutingStatus extends Component {
  props: Props;
  state = {
    showPopConfirm: false,
    popConfirmText: null,
    popConfirmButton: null,
  };

  showPopConfirm = (text, button) => {
    this.setState({
      showPopConfirm: true,
      popConfirmText: text,
      popConfirmButton: button,
    });
  };

  renderButtonForStopProcess = () => {
    const { code } = this.props.processRouting;
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size={'small'}
          style={{ marginRight: 10 }}
          type={'default'}
          onClick={() => {
            this.setState({ showPopConfirm: false });
          }}
        >
          暂不启用
        </Button>
        <Button
          size={'small'}
          onClick={() => {
            enableAllProcessUnderProcessRouting({
              processRouteCode: encodeURIComponent(code),
            }).then(() => {
              AntMessage.success('启用工序成功');
              this.setState({
                showPopConfirm: false,
              });
            });
          }}
        >
          全部启用
        </Button>
      </div>
    );
  };

  render() {
    const { showPopConfirm, popConfirmText, popConfirmButton } = this.state;
    const { style, fetchData, beforeClick, finallyCallback, processRouting } = this.props;
    const { code, status } = processRouting || {};
    if (showPopConfirm) {
      return (
        <PopConfirmWithCustomButton
          visible={showPopConfirm}
          text={popConfirmText}
          getButtonElement={popConfirmButton}
          visibleChangeCb={visible => {
            this.setState({ showPopConfirm: visible });
          }}
          placement={'topRight'}
        >
          <FormattedMessage
            style={{ ...baseStyle, color: status ? error : blacklakeGreen, ...style }}
            defaultMessage={status ? '停用' : '发布'}
          />
        </PopConfirmWithCustomButton>
      );
    }

    return (
      <Link
        auth={auth.WEB_EDIT_PROCESS_ROUTING_DEF}
        style={{ ...baseStyle, color: status ? error : blacklakeGreen, ...style }}
        onClick={() => {
          if (typeof beforeClick === 'function') {
            beforeClick();
          }
          updateProcessRouteStatus({ code: encodeURIComponent(code), status: status === 0 ? 1 : 0 })
            .then(res => {
              const { data } = res || {};
              if (!data) {
                return;
              }

              const { code, message, statusCode } = data || {};

              if (code) {
                switch (code) {
                  // 验证是否在有效期
                  case 'PROCESS_ROUTING_START_FAILED_NO_VALID':
                    this.showPopConfirm(message);
                    break;
                  // 工艺路线被用于生产bom
                  case 'PROCESS_ROUTING_STOP_FAILED':
                    this.showPopConfirm(message);
                    break;
                  // 发布失败，存在工序没有发布
                  case 'PROCESS_ROUTING_START_FAILED_NO_START_PROCESS':
                    this.showPopConfirm(message, this.renderButtonForStopProcess);
                    break;
                  default:
                    this.showPopConfirm(message);
                }
                return;
              }

              if (statusCode === 200) {
                // 成功了
                AntMessage.success(
                  changeChineseToLocaleWithoutIntl('{action}工艺路线', { action: status === 1 ? '停用' : '发布' }),
                );
                if (typeof fetchData === 'function') fetchData();
              }
            })
            .finally(() => {
              finallyCallback();
            });
        }}
      >
        {status ? '停用' : '发布'}
      </Link>
    );
  }
}

UpdateProcessRoutingStatus.propTypes = {
  beforeClick: PropTypes.func,
  finallyCallback: PropTypes.func,
};

export default UpdateProcessRoutingStatus;
