import * as React from 'react';

import { Link, Popover, Icon, Button, message as Message } from 'src/components';
import { modifyEbomStatus, enableMaterialByEbom } from 'services/bom/ebom';
import auth from 'src/utils/auth';

type PropsTypes = {
  enableDom: React.Node,
  disableDom: React.Node,
  status: 'disable' | 'enable',
  id: string,
  ebom: any,
  refetch: () => {},
  style: any,
};

class EBomPop extends React.Component<PropsTypes> {
  state = {
    message: '',
    visible: false,
  };

  handleStatus() {
    const { id, status, refetch } = this.props;
    modifyEbomStatus(id, { status: status === 1 ? 0 : 1 }).then(({ data: { statusCode, message } }) => {
      if (statusCode === 201) {
        this.setState({
          visible: true,
          message,
        });
      } else {
        Message.success(`${status === 1 ? '停用' : '启用'}成功`);
        refetch();
      }
    });
  }

  renderContent() {
    const { message } = this.state;
    const { status, id, refetch } = this.props;
    return (
      <div style={{ width: 230 }}>
        <Icon type={'close-circle'} style={{ float: 'left' }} />
        <p style={{ marginLeft: 20, overflowWrap: 'break-word' }}>{message}</p>
        <div style={{ textAlign: 'right' }}>
          {status === 1 ? (
            <Button size={'small'} onClick={() => this.setState({ visible: false })} type="default" key="knowIt">
              知道了
            </Button>
          ) : (
            [
              <Button
                key="disable"
                size={'small'}
                type="default"
                style={{ marginRight: 20 }}
                onClick={() => {
                  this.setState({ visible: false });
                }}
              >
                暂不启用
              </Button>,
              <Button
                key="enable"
                size={'small'}
                onClick={() => {
                  enableMaterialByEbom(id).then(() => {
                    this.setState({ visible: false });
                    refetch();
                    Message.success('物料全部启用成功');
                  });
                }}
              >
                全部启用
              </Button>,
            ]
          )}
        </div>
      </div>
    );
  }

  render() {
    const { style, enableDom, disableDom, status } = this.props;
    const { visible } = this.state;
    return (
      <Popover
        visible={visible}
        content={this.renderContent()}
        placement="topLeft"
        arrowPointAtCenter
        trigger="click"
        onVisibleChange={visible => {
          if (visible === true) {
            this.handleStatus();
          } else {
            this.setState({ visible });
          }
        }}
      >
        <Link auth={auth.WEB_EDIT_EBOM_DEF} style={style}>
          {status === 1 ? enableDom : disableDom}
        </Link>
      </Popover>
    );
  }
}

export default EBomPop;
