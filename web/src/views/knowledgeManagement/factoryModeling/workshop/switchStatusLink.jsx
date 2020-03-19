import React from 'react';
import { Link, Popconfirm, message } from 'components';
import {
  checkDisabled,
  checkEnabled,
  disabledWorkshop,
  enabledWorkshop,
  enabledWorkshopChildren,
} from 'services/knowledgeBase/workshop';

const { Popiknow } = Popconfirm;

class SwitchStatusLink extends React.PureComponent<any> {
  state = {
    code: '',
    showError: false,
    loading: false,
  };

  handleEnable = async () => {
    const { refetch, id } = this.props;
    const { data: { data } } = await enabledWorkshop(id);
    this.setState({ code: '' });
    refetch(data);
  };

  handleDisable = async () => {
    const { refetch, id } = this.props;
    const { data: { data } } = await disabledWorkshop(id);
    this.setState({ code: '' });
    refetch(data);
  };

  handleStatus = async () => {
    const { status, id, refetch } = this.props;
    const { data: { code, data: { entityLinks } } } = status === 1 ? await checkDisabled(id) : await checkEnabled(id);
    if (code === 'READY') {
      const { data: { data } } = status === 1 ? await disabledWorkshop(id) : await enabledWorkshop(id);
      message.success(`${status === 1 ? '停用' : '启用'}成功！`);
      this.setState({ showError: false, loading: false });
      refetch(data);
    } else if (code === 'CHILDREN_NOT_EMPTY') {
      this.setState({ code, loading: false, entityLinks });
    } else {
      this.setState({ code, showError: true, loading: false, entityLinks });
    }
  };
  render() {
    const { code, showError, loading } = this.state;
    const { status, id, refetch } = this.props;
    const codeMap = {
      CHILDREN_NOT_DISABLED: '请先停用所有子区域！',
      DISABLED: '非启用中的区域不能停用，请检查！',
      ENABLED: '非停用中的区域不能启用，请检查！',
      PARENT_NOT_ENABLE: '父节点区域未启用，当前区域不能启用，请检查！',
      CHILDREN_NOT_EMPTY: '是否启用当前区域所有子节点？',
      DRAFT_CHILDREN_NOT_DELETED: '停用当前区域会删除草稿状态的子节点！',
    };
    const text = status === 1 ? '停用' : '启用';
    let renderDom = null;
    if (!code) {
      renderDom = (
        <Link
          disabled={loading}
          onClick={() => {
            this.setState({ loading: true });
            this.handleStatus();
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
            const { data: { data } } = await enabledWorkshopChildren(id);
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
          <Link disabled={loading}>{text}</Link>
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
          <Link disabled={loading}>{text}</Link>
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
          onVisibleChange={visible => {
            if (!visible) {
              this.setState({ code: '' });
            }
          }}
        >
          <Link type={showError && 'error'} disabled={loading}>
            {text}
          </Link>
        </Popiknow>
      );
    }
    return renderDom;
  }
}

export default SwitchStatusLink;
