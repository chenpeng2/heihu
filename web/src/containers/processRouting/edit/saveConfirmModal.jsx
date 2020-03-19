import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropType from 'prop-types';
import { syncAllQcConfigsByProcessRouting, syncQcConfigsByProcessRouting } from 'services/bom/mbom';
import { OpenModal, Button, Icon, Table, Tooltip, Link, message, FormattedMessage } from 'src/components';
import { primary, error } from 'src/styles/color/index';
import { toMBomDetail } from 'views/bom/utils/navigation';
import { replaceSign } from 'src/constants';
import EffectStandardCapacitys from './EffectStandardCapacitys';

import styles from './styles.scss';

const { AntModal } = OpenModal;

type Props = {
  style: {},
  visible: boolean,
  successMessage: string,
  listData: [],
  match: {},
  confirmType: string,
  errorMessage: string,
  onVisibleChange: () => {},
};

class SaveConfirmModal extends Component {
  props: Props;
  state = {
    visible: false,
    loading: false,
  };

  componentWillMount() {
    const { visible } = this.props;
    this.setState({
      visible,
    });
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (visible !== this.state.visible) {
      this.setState({ visible });
    }
  }

  closeModal = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        this.props.onVisibleChange(false);
      },
    );
  };

  toDetailPage = () => {
    const { router } = this.context;
    const { match } = this.props;
    const processRoutingId = _.get(match, 'params.id');
    router.history.push(`/bom/processRoute/${encodeURIComponent(processRoutingId)}/detail`);
  };

  handleOk = () => {
    this.closeModal();
  };

  handleCancel = () => {
    this.closeModal();
    this.toDetailPage();
  };

  renderFooter = hasMBomsChanged => {
    const { confirmType, match } = this.props;
    const processRoutingId = _.get(match, 'params.id');

    return (
      <div style={{ padding: '22px 0 6px', display: 'flex', justifyContent: 'center' }}>
        <Button
          style={{ width: 114, marginRight: 60 }}
          type={'default'}
          onClick={() => {
            this.closeModal();
            this.toDetailPage();
          }}
        >
          知道了
        </Button>
      </div>
    );
  };

  renderConfirm = (iconType, iconColor, title, text) => {
    return (
      <div>
        <div style={{ display: 'flex', marginRight: 14, alignItems: 'center' }}>
          <Icon type={iconType} style={{ fontSize: 36, color: iconColor }} />
          <div style={{ fontSize: 18, marginLeft: 10 }}>
            <FormattedMessage defaultMessage={title} />
          </div>
        </div>
      </div>
    );
  };

  handleSyncQc = async mBomId => {
    const { code } = this.props;
    this.setState({ loading: true });
    if (mBomId) {
      const {
        data: { data },
      } = await syncQcConfigsByProcessRouting({ processRoutingCode: code, mBomIds: [mBomId] });
      console.log('data', data);
    } else {
      const {
        data: { data },
      } = await syncAllQcConfigsByProcessRouting(code);
      console.log('data', data);
    }
    message.success('同步成功!');
    this.setState({ loading: false });
  };

  renderList = listData => {
    const { loading } = this.state;
    if (!listData || (Array.isArray(listData) && listData.length === 0)) {
      return null;
    }
    const formatData = data => {
      if (!Array.isArray(data)) {
        return [{}];
      }
      return data.map(mBom => {
        const { materialCode, materialName, version, status, id } = mBom;
        return {
          materialCode,
          materialName,
          version,
          status,
          id,
        };
      });
    };

    const columns = [
      {
        title: '成品编码／名称',
        key: 'codeAndName',
        maxWidth: { C: 20 },
        render: (_, record) => {
          const { materialCode, materialName } = record;
          return (
            <Tooltip
              text={materialCode && materialName ? `${materialCode}/${materialName}` : replaceSign}
              length={20}
            />
          );
        },
      },
      {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        render: text => {
          return text || replaceSign;
        },
      },
      {
        title: (
          <div className="child-gap">
            <FormattedMessage defaultMessage={'操作'} /> <Link onClick={() => this.handleSyncQc()}>全部同步</Link>
          </div>
        ),
        dataIndex: 'id',
        key: 'id',
        render: id => {
          return (
            <div className="child-gap">
              <Link.NewTagLink href={toMBomDetail(id)}>查看</Link.NewTagLink>
              <Link onClick={() => this.handleSyncQc(id)}>同步</Link>
            </div>
          );
        },
      },
    ];

    return (
      <div>
        <div style={{ display: 'inline-block', marginTop: 10 }}>
          <FormattedMessage
            defaultMessage={
              '保存成功，除质检方案外，以下{mount}个生产BOM同步该工艺路线最新信息。若变更了质检方案，请确认是否要同步质检方案至生产BOM，若需要，请点击「同步」：'
            }
            values={{ mount: listData.length }}
          />
        </div>
        <Table
          loading={loading}
          bordered
          style={{ margin: 0, marginBottom: 60 }}
          dataSource={listData ? formatData(listData) : [{}]}
          total={Array.isArray(listData) ? listData.length : 0}
          columns={columns}
          rowKey={record => record.id}
        />
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    const { style, listData, effectStandardCapacitys } = this.props;

    return (
      <div>
        <AntModal
          className={styles.editProcessRoute}
          style={style}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
          width={640}
        >
          <div style={{ margin: '20px 0 20px 0' }}>
            <div>
              {this.renderConfirm('check-circle', primary, '保存成功！')}
              {this.renderList(listData)}
            </div>
            <EffectStandardCapacitys dataSource={effectStandardCapacitys} />
            {this.renderFooter()}
          </div>
        </AntModal>
      </div>
    );
  }
}

SaveConfirmModal.contextTypes = {
  router: PropType.func,
  effectStandardCapacitys: PropType.array,
};

export default withRouter(SaveConfirmModal);
