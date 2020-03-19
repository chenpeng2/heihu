import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Link, RestPagingTable, Icon, Spin, Badge, Tooltip, openModal, haveAuthority } from 'src/components';
import auth from 'utils/auth';
import { AddFinishWorkStorage, AddInputStorage, DetailModal } from 'src/containers/relatedStorage';
import { getWorkShopChildren, getProdLineChildren } from 'src/services/knowledgeBase/area';
import {
  deleteFeedingStorageByWorkshop,
  deleteFeedingStorageByProdline,
  deleteFeedingStorageByWorkstation,
  deleteFinishedStorageByWorkshop,
  deleteFinishedStorageByProdline,
  deleteFinishedStorageByWorkstation,
} from 'src/services/knowledgeBase/relatedStorage';
import { replaceSign } from 'src/constants';
import { primary, error } from 'src/styles/color';
import { getQuery } from 'src/routes/getRouteParams';
import styles from './styles.scss';

const MyBadge = Badge.MyBadge;

type Props = {
  data: [],
  loading: boolean,
  match: {},
  params: null,
  refetch: () => {},
};

class RelatedStorageList extends Component {
  props: Props;
  state = {
    data: null,
    loading: null,
    expandedRows: null,
  };

  componentWillReceiveProps(nextProps) {
    const { data, match } = nextProps;
    const query = getQuery(match);
    if (data[0] && query && query.key) {
      this.setSearchedExpandRow([data[0].id], data[0], query.key);
    }
    this.setState({ data, expandedRows: [data[0] && data[0].id], loading: null });
  }

  findTreeNode = (data, id, type, action, code) => {
    data.find(node => {
      if (node.id === id) {
        if (action === 'add') {
          node[type] = code;
        } else {
          node[type].forEach((m, index) => {
            if (m.code === code) {
              node[type].splice(index, 1);
            }
          });
        }
        return true;
      }
      if (node.children && node.children.length) {
        this.findTreeNode(node.children, id, type, action, code);
      }
      return false;
    });
  };

  setDeletedData = (code, record, type) => {
    const data = this.props.data;
    if (type === 'finishedStorage') {
      record.finishedStorage = null;
    } else {
      this.findTreeNode(data[0].children || data, record.id, 'feedingStorageList', 'delete', code);
      this.setState({ data: this.props.data });
    }
  };

  setAddedData = (codes, record, type) => {
    const data = this.props.data;
    if (type === 'finishedStorage') {
      this.findTreeNode(data[0].children || data, record.id, 'finishedStorage', 'add', codes);
    } else {
      this.findTreeNode(data[0].children || data, record.id, 'feedingStorageList', 'add', codes);
    }
    this.setState({ data: this.props.data });
  };

  getTag = (value, showMore, record, type) => {
    const { code, id, name } = value;
    return (
      <span
        key={`${code}:${id}`}
        className={styles.tag}
        style={showMore ? { cursor: 'pointer', width: 32, textAlign: 'center' } : {}}
        onClick={
          showMore
            ? () => {
                openModal(
                  {
                    title: '查看投料仓位',
                    children: (
                      <DetailModal
                        initialStorage={record.feedingStorageList}
                        setDeletedData={this.setDeletedData}
                        record={record}
                      />
                    ),
                    footer: null,
                  },
                  this.context,
                );
              }
            : null
        }
      >
        <Tooltip text={name} length={6} />
        {!showMore ? (
          <Icon
            type="close"
            onClick={() => {
              this.setState({ loading: true });
              let deleteFeedingStorage = () => {};
              switch (record.type) {
                case 'WORKSHOP':
                  deleteFeedingStorage =
                    type === 'finishedStorage' ? deleteFinishedStorageByWorkshop : deleteFeedingStorageByWorkshop;
                  break;
                case 'PRODUCTION_LINE':
                  deleteFeedingStorage =
                    type === 'finishedStorage' ? deleteFinishedStorageByProdline : deleteFeedingStorageByProdline;
                  break;
                case 'WORKSTATION':
                  deleteFeedingStorage =
                    type === 'finishedStorage' ? deleteFinishedStorageByWorkstation : deleteFeedingStorageByWorkstation;
                  break;
                default:
                  deleteFeedingStorage = () => {};
              }
              deleteFeedingStorage({ code, id: id.split(':')[1] })
                .then(() => {
                  this.setDeletedData(code, record, type);
                })
                .finally(() => {
                  this.setState({ loading: false });
                });
            }}
          />
        ) : null}
      </span>
    );
  };

  getTypeDisplay = type => {
    switch (type) {
      case 'ORGANIZATION':
        return '工厂';
      case 'WORKSHOP':
        return '车间';
      case 'PRODUCTION_LINE':
        return '生产线';
      case 'WORKSTATION':
        return '工位';
      default:
        return '未知类型';
    }
  };

  fetchWorkShopData = (expanded, record, id) => {
    if (expanded && !record.children.length) {
      const { params } = this.props;
      this.setState({ loading: true });
      getWorkShopChildren(id, params)
        .then(res => {
          const data = _.cloneDeep(res.data.data);
          data.forEach(n => {
            n.id = `${n.type}:${n.id}`;
          });
          record.children = data;
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  };

  fetchProdLineData = (expanded, record, id, workshopId) => {
    if (expanded && !record.children.length) {
      const { params } = this.props;
      this.setState({ loading: true });
      getProdLineChildren(id, params)
        .then(res => {
          const data = _.cloneDeep(res.data.data);
          data.forEach(n => {
            n.id = `${n.type}:${n.id}`;
          });
          record.children = data;
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  };

  onExpand = (expanded, record) => {
    const { id, type } = record;
    const { expandedRows } = this.state;
    if (expanded) {
      expandedRows.push(id);
      this.setState({ expandedRows });
    } else {
      const _expandedRows = expandedRows.filter(n => n !== id);
      this.setState({ expandedRows: _expandedRows });
    }
    if (type === 'WORKSHOP') {
      this.fetchWorkShopData(expanded, record, id.split(':')[1]);
    }
    if (type === 'PRODUCTION_LINE') {
      this.fetchProdLineData(expanded, record, id.split(':')[1], record.workshopId);
    }
  };

  setSearchedExpandRow = (expandedRows, data, key) => {
    if (data && data.children) {
      data.children.forEach(n => {
        if (typeof n.name === 'string' && typeof n.code === 'string') {
          if (n.name.indexOf(key) !== -1 || n.code.indexOf(key || n.qrCode.indexOf(key) !== -1) !== -1) {
            n.name = <span style={{ color: primary }}>{<Tooltip text={n.name} length={8} />}</span>;
            n.code = <span style={{ color: primary }}>{<Tooltip text={n.code} length={14} />}</span>;
          }
        }
        if (n.children && n.children.length) {
          expandedRows.push(n.id);
          this.setSearchedExpandRow(expandedRows, n, key);
        }
      });
      this.setState({ expandedRows });
    }
  };

  getColumns = () => {
    const haveEditStorageAuthority = haveAuthority(auth.WEB_RELATION_STORAGE_UPDATE);
    const columns = [
      {
        title: '区域名称',
        dataIndex: 'name',
        type: 'mfgBatchNo',
        key: 'name',
        render: name => name || replaceSign,
      },
      {
        title: '区域编码',
        dataIndex: 'code',
        type: 'QRCode',
        key: 'code',
        render: code => code || replaceSign,
      },
      {
        title: '区域类型',
        key: 'type',
        width: 95,
        dataIndex: 'type',
        render: type => this.getTypeDisplay(type),
      },
      {
        title: '区域状态',
        dataIndex: 'status',
        width: 95,
        key: 'status',
        render: (status, record) =>
          record.type !== 'ORGANIZATION' ? (
            <MyBadge text={status ? '启用中' : '停用中'} color={status ? primary : error} />
          ) : null,
      },
      {
        title: '投料仓位',
        width: 260,
        dataIndex: 'feedingStorageList',
        key: 'feedingStorageList',
        render: (feedingStorageList, record) => {
          if (feedingStorageList && feedingStorageList.length > 2) {
            const tags = feedingStorageList
              .slice(0, 2)
              .map(n => this.getTag({ name: n.name, code: n.code, id: record.id }, false, record));
            tags.push(this.getTag({ name: '···' }, true, record));
            return tags;
          }
          return feedingStorageList && feedingStorageList.length
            ? feedingStorageList.map(n => this.getTag({ name: n.name, code: n.code, id: record.id }, false, record))
            : replaceSign;
        },
      },
      {
        title: '完工仓位',
        dataIndex: 'finishedStorage',
        width: 140,
        key: 'finishedStorage',
        render: (finishedStorage, record) => {
          if (finishedStorage) {
            const value = { name: finishedStorage.name, code: finishedStorage.code, id: record.id };
            return this.getTag(value, false, record, 'finishedStorage');
          }
          return replaceSign;
        },
      },
      {
        title: '操作',
        key: 'action',
        width: 200,
        render: (_, record) =>
          record.type !== 'ORGANIZATION' ? (
            <React.Fragment>
              <Link
                disabled={!haveEditStorageAuthority || !record.hasWarehouse}
                onClick={() => {
                  openModal(
                    {
                      title: '添加投料仓位',
                      children: (
                        <AddInputStorage
                          record={record}
                          setAddedData={this.setAddedData}
                          workshopId={record.workshopId}
                          parentClass={styles.storeHouseList}
                        />
                      ),
                      footer: null,
                    },
                    this.context,
                  );
                }}
              >
                {'添加投料仓位'}
              </Link>
              <Link
                style={{ marginLeft: 10 }}
                disabled={!haveEditStorageAuthority || !record.hasWarehouse}
                onClick={() => {
                  openModal(
                    {
                      title: '添加完工仓位',
                      children: (
                        <AddFinishWorkStorage
                          record={record}
                          setAddedData={this.setAddedData}
                          workshopId={record.workshopId}
                        />
                      ),
                      footer: null,
                    },
                    this.context,
                  );
                }}
              >
                {'添加完工仓位'}
              </Link>
            </React.Fragment>
          ) : null,
      },
    ];
    return columns;
  };

  render() {
    const { loading: initialLoading, data } = this.props;
    const { loading, expandedRows } = this.state;
    const columns = this.getColumns();
    if (data[0] && typeof data[0].name === 'string' && typeof data[0].code === 'string') {
      data[0].name = <Tooltip text={data[0].name} length={8} />;
      data[0].code = <Tooltip text={data[0].code} length={14} />;
      if (data[0].children && data[0].children.length) {
        data[0].children.forEach(n => {
          if (typeof n.name === 'string' && typeof n.code === 'string') {
            n.name = <Tooltip text={n.name} length={8} />;
            n.code = <Tooltip text={n.code} length={14} />;
          }
        });
      }
    }

    return (
      <Spin spinning={loading === null ? initialLoading : loading}>
        <div className={styles.storeHouseList}>
          <RestPagingTable
            bordered
            expandedRowKeys={expandedRows}
            dataSource={this.state.data || data || []}
            total={data && data.total}
            rowKey={record => record.id}
            columns={columns}
            onExpand={this.onExpand}
          />
        </div>
      </Spin>
    );
  }
}

RelatedStorageList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(RelatedStorageList);
