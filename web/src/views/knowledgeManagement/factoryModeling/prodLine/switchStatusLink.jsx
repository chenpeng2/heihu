import React from 'react';
import { Link, Popconfirm, Badge, Button, message } from 'components';
import {
  checkDisableProdLine,
  checkEnableProdLine,
  enableProdLine,
  disableProdLine,
  enableProdLineChildren,
} from 'services/knowledgeBase/prodLine';

const { Popiknow } = Popconfirm;

class SwitchStatusLink extends React.PureComponent<any> {
  state = {
    code: '',
    entityLinks: [],
    showError: false,
  };

  checkStatus = async () => {
    const { status, id } = this.props;
    const { data: { code, data: { entityLinks } } } =
      status === 1 ? await checkDisableProdLine(id) : await checkEnableProdLine(id);
    if (code === 'READY') {
      await this.handleStatus();
    } else if (code === 'CHILDREN_NOT_EMPTY' || code === 'ENTITY_LINKS_NOT_REMOVED') {
      this.setState({ code, entityLinks });
    } else {
      this.setState({ code, showError: true, entityLinks });
    }
  };

  handleDisable = async () => {
    const { id, refetch } = this.props;
    const { data: { data } } = await disableProdLine(id);
    this.setState({ code: '' });
    refetch(data);
  };

  handleEnable = async () => {
    const { id, refetch } = this.props;
    const { data: { data } } = await enableProdLine(id);
    this.setState({ code: '' });
    refetch(data);
  };

  handleStatus = async () => {
    const { id, refetch, status } = this.props;
    const { data: { data } } = status === 1 ? await disableProdLine(id) : await enableProdLine(id);
    message.success(`${status === 1 ? '停用' : '启用'}成功！`);
    this.setState({ code: '' });
    refetch(data);
  };
  render() {
    const { code, showError, entityLinks } = this.state;
    const { status, id, refetch } = this.props;
    const codeMap = {
      CHILDREN_NOT_DISABLED: '请先停用所有子区域！',
      DISABLED: '非启用中的区域不能停用，请检查！',
      ENABLED: '非停用中的区域不能启用，请检查！',
      PARENT_NOT_ENABLE: '父节点区域未启用，当前区域不能启用，请检查！',
      CHILDREN_NOT_EMPTY: '是否启用当前区域所有子节点？',
      ENTITY_LINKS_NOT_DISABLED: '当前区域被以下使用，不能停用！',
      ENTITY_LINKS_NOT_REMOVED: '当前区域被以下使用，继续停用系统会解除关联的区域信息！',
      DRAFT_CHILDREN_NOT_DELETED: '停用当前区域会删除草稿状态的子节点！',
    };
    const text = status === 1 ? '停用' : '启用';
    let renderDom = null;
    if (!code) {
      renderDom = (
        <Link
          onClick={() => {
            this.checkStatus();
          }}
          type={showError && 'error'}
        >
          {text}
        </Link>
      );
    } else if (code === 'CHILDREN_NOT_EMPTY') {
      renderDom = (
        <Popconfirm
          cancelText="启用"
          okText="批量启用"
          title={codeMap[code]}
          onConfirm={async () => {
            const { data: { data } } = await enableProdLineChildren(id);
            this.setState({ code: '' });
            refetch(data);
          }}
          onCancel={this.handleEnable}
          onVisibleChange={visible => {
            if (!visible) {
              this.setState({ code: '' });
            }
          }}
          visible
        >
          <React.Fragment>
            <Link>{text}</Link>
          </React.Fragment>
        </Popconfirm>
      );
    } else if (code === 'DRAFT_CHILDREN_NOT_DELETED') {
      renderDom = (
        <Popconfirm
          cancelText="取消"
          okText="确认"
          title={codeMap[code]}
          onConfirm={this.handleDisable}
          onCancel={() => {
            this.setState({ code: '' });
          }}
          visible
        >
          <Link>{text}</Link>
        </Popconfirm>
      );
    } else {
      renderDom = (
        <Popiknow
          iconType="exclamation-circle"
          title={codeMap[code]}
          visible
          onConfirm={() => {
            this.setState({ code: '' });
          }}
          content={
            <div style={{ marginTop: 12 }}>
              {entityLinks.map(text => (
                <span style={{ display: 'block' }} key={text}>
                  <Badge status="success" text={text} />
                </span>
              ))}
            </div>
          }
          onVisibleChange={visible => {
            if (!visible) {
              this.setState({ code: '' });
            }
          }}
          footer={
            status === 'ENTITY_LINKS_NOT_REMOVED' && (
              <div>
                <Button
                  size="small"
                  type="default"
                  onClick={() => {
                    this.setState({ code: '' });
                  }}
                >
                  取消
                </Button>
                <Button
                  size="small"
                  type="danger"
                  onClick={() => {
                    this.handleStatus();
                  }}
                >
                  停用
                </Button>
              </div>
            )
          }
        >
          <Link type={showError && 'error'}>{text}</Link>
        </Popiknow>
      );
    }
    return renderDom;
  }
}

export default SwitchStatusLink;
