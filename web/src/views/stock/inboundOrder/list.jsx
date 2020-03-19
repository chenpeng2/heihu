import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Link, Badge, RestPagingTable, Tooltip, message, Spin, Popconfirm } from 'src/components';
import { replaceSign } from 'src/constants';
import moment from 'utils/time';
import { primary } from 'src/styles/color';
import log from 'src/utils/log';
import { abortInboundOrder, issueInboundOrder, finishInboundOrder } from 'src/services/stock/inboundOrder';
import DetailModal from './detailModal';
import LinkToDetail from './actionButton/linkToDetail';
import LinkToEdit from './actionButton/linkToEdit';
import { INBOUND_ORDER_STATUS } from './constants';
import styles from './styles.scss';

type Props = {
  data: any,
  match: any,
  fetchData: () => {},
};

class List extends Component {
  props: Props;
  state = {
    loading: false,
  };

  getColumns = () => {
    return [
      {
        title: '入库单号',
        width: 160,
        dataIndex: 'inboundOrderCode',
        render: inboundOrderCode => (
          <Tooltip
            placement="bottomLeft"
            getPopupContainer={() => document.getElementsByClassName(styles.inboundOrder)[0]}
            title={<DetailModal inboundOrderCode={inboundOrderCode} />}
          >
            <span style={{ color: primary, cursor: 'pointer' }}>{inboundOrderCode || replaceSign}</span>
          </Tooltip>
        ),
      },
      {
        title: '状态',
        width: 140,
        dataIndex: 'status',
        render: status =>
          (status && (
            <Badge.MyBadge color={INBOUND_ORDER_STATUS[status].color} text={INBOUND_ORDER_STATUS[status].label} />
          )) ||
          replaceSign,
      },
      {
        title: '创建人',
        width: 140,
        dataIndex: 'creator',
        render: creator => (creator && creator.name) || replaceSign,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: createdAt => (createdAt && moment(createdAt).format('YYYY/MM/DD HH:mm:ss')) || replaceSign,
      },
      {
        title: '操作',
        key: 'action',
        width: 240,
        render: (_, record) => {
          const { loading } = this.state;
          const { status, inboundOrderCode } = record;
          return (
            <Spin spinning={loading}>
              <LinkToDetail inboundOrderCode={inboundOrderCode} />
              {`${status}` === INBOUND_ORDER_STATUS[1].key ? (
                <React.Fragment>
                  <LinkToEdit inboundOrderCode={inboundOrderCode} />
                  <Link
                    style={{ marginLeft: 20 }}
                    onClick={() => {
                      this.setState({ loading: true });
                      issueInboundOrder(inboundOrderCode)
                        .then(() => {
                          message.success('下发成功');
                          record.status = INBOUND_ORDER_STATUS[2].key;
                          this.setState({ loading: false });
                        })
                        .catch(e => {
                          log.error(e);
                          this.setState({ loading: false });
                        });
                    }}
                  >
                    下发
                  </Link>
                  <Popconfirm
                    title={'确定取消入库单吗?'}
                    onConfirm={() => {
                      this.setState({ loading: true });
                      abortInboundOrder(inboundOrderCode)
                        .then(() => {
                          message.success('取消成功');
                          record.status = INBOUND_ORDER_STATUS[3].key;
                          this.setState({ loading: false });
                        })
                        .catch(e => {
                          log.error(e);
                          this.setState({ loading: false });
                        });
                    }}
                  >
                    <Link style={{ marginLeft: 20 }}>取消</Link>
                  </Popconfirm>
                </React.Fragment>
              ) : `${status}` === INBOUND_ORDER_STATUS[2].key || `${status}` === INBOUND_ORDER_STATUS[4].key ? (
                <Popconfirm
                  title={'确定结束入库单吗?'}
                  onConfirm={() => {
                    this.setState({ loading: true });
                    finishInboundOrder(inboundOrderCode)
                      .then(() => {
                        message.success('结束成功');
                        record.status = INBOUND_ORDER_STATUS[4].key;
                        this.setState({ loading: false });
                      })
                      .catch(e => {
                        log.error(e);
                        this.setState({ loading: false });
                      });
                  }}
                >
                  <Link style={{ marginLeft: 20 }}>结束</Link>
                </Popconfirm>
              ) : null}
            </Spin>
          );
        },
      },
    ];
  };

  render() {
    const { data = {}, fetchData } = this.props;
    const columns = this.getColumns();
    return (
      <div className={styles.inboundOrder} style={{ marginTop: 20 }}>
        <RestPagingTable
          columns={columns}
          dataSource={Array.isArray(data.data) ? data.data : []}
          total={data && data.total}
          refetch={fetchData}
        />
      </div>
    );
  }
}

export default withRouter(List);
