import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Link,
  Table,
  Spin,
  Badge,
  Tooltip,
  openModal,
  Attachment,
  haveAuthority,
  Button,
  OpenImportModal,
} from 'src/components';
import MyStore from 'store';
import { expandStorage, createStorage, editStorage as editStorageAction } from 'src/store/redux/actions';
import auth from 'utils/auth';
import { formatUrlParams } from 'utils/url';
import { arrayIsEmpty } from 'src/utils/array';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import { importStorage, getStorageListByLevel, getStorage } from 'src/services/knowledgeBase/storage';
import { primary, error } from 'src/styles/color';

import styles from './styles.scss';
import DataExport from './dataExport';
import UpdateStatusConfirmModal from './updateStatusConfirmModal';

const MyBadge = Badge.MyBadge;

type Props = {
  match: any,
  refetch: () => {},
  data: [],
  loading: boolean,
  isNull: boolean,
};

const AttachmentImageView = Attachment.ImageView;

class StorageList extends Component {
  props: Props;
  state = {
    data: null,
    loading: null,
    showSearchData: true,
    expandedRows: [],
  };

  componentWillReceiveProps(nextProps) {
    const { data, match, isNull } = nextProps;
    const { expandedRows } = this.state;
    const query = getQuery(match);
    const record = MyStore.getState().createStorage;
    const editRecord = MyStore.getState().editStorage;
    if (data) {
      const expandRows = MyStore.getState().expandStorageReducer;
      const isNewReocrd = !expandRows.map(n => n.id).includes(record.id);
      if (query && query.search) {
        this.setSearchedExpandRow(expandedRows, data.data, query.search);
      } else {
        const _expandRows = expandRows.map(n => n.id);
        if (isNewReocrd) {
          record.needUpdate = true;
          _expandRows.push(record.id);
          this.onExpand(true, record);
        }
        if (editRecord) {
          editRecord.needUpdate = true;
          this.fetchSingleStorage(editRecord);
        }
        expandRows.forEach(n => {
          n.needUpdate = false;
          if (record.id === n.id) {
            n.needUpdate = true;
          }
          this.onExpand(true, n);
        });
        this.setState({ expandedRows: _expandRows });
      }
      if (isNull) {
        MyStore.dispatch(expandStorage({}, false, true));
        this.setState({ expandedRows: [] });
      }
    }
  }

  fetchStorage = (expanded, record, params) => {
    const { expandedRows } = this.state;
    if (expanded) {
      const { data } = this.props;
      const treeData = (data && data.data) || [];
      expandedRows.push(record.id);
      const expandRows = MyStore.getState().expandStorageReducer;
      if ((record.children && !record.children.length) || record.needUpdate) {
        this.setState({ loading: true });
        getStorageListByLevel(params)
          .then(res => {
            const data = _.cloneDeep(res.data.data);
            data.forEach(n => {
              n.storageId = n.id;
              n.id = `${n.code}:${n.parentCode}`;
              if (n.level === 1 && n.hasChildren) {
                n.children = [];
              }
            });
            if (record.children) {
              record.children.forEach(n => {
                const index = data.map(m => m.id).indexOf(n.id);
                if (index !== -1) {
                  data[index].children = n.children;
                }
              });
            }
            record.children = data;
            if (!expandRows.map(n => n.id).includes(record.id)) {
              MyStore.dispatch(expandStorage(record));
            }
            this.findTreeNode(treeData, record.id, 'children', data);
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      } else {
        if (!expandRows.map(n => n.id).includes(record.id)) {
          MyStore.dispatch(expandStorage(record));
        }
        this.findTreeNode(treeData, record.id, 'children', record.children);
      }
      this.setState({ data: treeData, expandedRows });
    } else {
      MyStore.dispatch(expandStorage(record, true));
      const _expandedRows = expandedRows.filter(n => n !== record.id);
      this.setState({ expandedRows: _expandedRows });
    }
  };

  fetchSingleStorage = record => {
    const { code } = record;
    if (code && typeof code === 'string' && record.level !== 3) {
      getStorage(code).then(res => {
        const { data } = res.data || {};
        record.name = data.name;
        record.qrCode = data.qrCode;
        record.remark = data.remark;
        record.attachmentFiles = data.attachmentFiles;
        record.attachments = data.attachments;
      });
    }
  };

  findTreeNode = (data, id, type, nodeData) => {
    data.find(node => {
      if (node.id === id) {
        if (!(nodeData && nodeData.length)) {
          node[type] = null;
        } else {
          node[type] = nodeData;
        }
        return true;
      }
      if (node.children && node.children.length) {
        this.findTreeNode(node.children, id, type, nodeData);
      }
      return false;
    });
  };

  onExpand = (expanded, record) => {
    const { code, level } = record;
    const params = {
      level: level === 3 ? 1 : 2,
      parentCode: code,
    };
    this.setState({ showSearchData: false });
    this.fetchStorage(expanded, record, params);
  };

  setSearchedExpandRow = (expandedRows, data, key) => {
    data.forEach(n => {
      if (typeof n.name === 'string' && typeof n.code === 'string') {
        if (
          (n.name.indexOf(key) !== -1 || n.code.indexOf(key) !== -1 || n.qrCode.indexOf(key) !== -1) &&
          n.level !== 3
        ) {
          n.name = <span style={{ color: primary }}>{<Tooltip text={n.name} length={8} />}</span>;
          n.code = <span style={{ color: primary }}>{<Tooltip text={n.code} length={14} />}</span>;
        }
      }
      if (n.children && n.children.length) {
        expandedRows.push(n.id);
        this.setSearchedExpandRow(expandedRows, n.children, key);
      }
    });
    this.setState({ expandedRows });
  };

  // isSingleUpdate参数为只改变自身状态不影响其子级
  setStatus = (record, status, isSingleUpdate) => {
    if (!arrayIsEmpty(record.children) && !isSingleUpdate) {
      record.children.forEach(n => {
        n.status = status;
        this.setStatus(n, status);
      });
    }
    this.setState({ loading: false });
  };

  getColumns = () => {
    const { router, changeChineseToLocale } = this.context;
    const { match } = this.props;
    const query = getQuery(match);
    const haveEditStorageAuthority = haveAuthority(auth.WEB_STORAGE_UPDATE);
    const haveCreateStorageAuthority = haveAuthority(auth.WEB_STORAGE_CREATE);
    const columns = [
      {
        title: '区域名称',
        dataIndex: 'name',
        fixed: 'left',
        type: 'mfgBatchNo',
        key: 'name',
        render: name => name,
      },
      {
        title: '区域编码',
        dataIndex: 'code',
        type: 'mfgBatchNo',
        key: 'code',
        render: code => code,
      },
      {
        title: '区域类型',
        key: 'category',
        width: 120,
        dataIndex: 'category',
        render: (category, record) => {
          if (category) {
            return category === 1 ? changeChineseToLocale('仓库') : <Tooltip text={record.workshopName || replaceSign} length={7} />;
          }
          return record.level === 1 ? changeChineseToLocale('一级仓位') : changeChineseToLocale('二级仓位');
        },
      },
      {
        title: '二维码',
        dataIndex: 'qrCode',
        type: 'QRCode',
        key: 'tqrCode',
        render: qrCode => <Tooltip text={qrCode || replaceSign} length={20} />,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        key: 'status',
        render: status => <MyBadge text={status ? '启用中' : '停用中'} color={status ? primary : error} />,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        render: remark => <Tooltip text={remark || replaceSign} length={18} />,
      },
      {
        title: '附件',
        dataIndex: 'attachmentFiles',
        width: 90,
        key: 'attachmentFiles',
        render: attachmentFiles => {
          if (attachmentFiles && attachmentFiles.length) {
            return (
              <div
                onClick={() => {
                  openModal({
                    title: '附件',
                    footer: null,
                    children: (
                      <AttachmentImageView
                        attachment={{
                          files: attachmentFiles.map(file => {
                            return {
                              ...file,
                              originalFileName: file.originalFileName,
                              originalExtension: file.originalExtension,
                            };
                          }),
                        }}
                      />
                    ),
                  });
                }}
              >
                <Link icon="paper-clip" />
                <span style={{ color: primary }}>{attachmentFiles.length}</span>
              </div>
            );
          }
          return replaceSign;
        },
      },
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 230,
        render: (data, record) => {
          return (
            <div style={{ display: 'flex' }}>
              {record.level !== 2 ? (
                <Link
                  disabled={record.status === 0 || !haveCreateStorageAuthority}
                  onClick={() => {
                    const recordName =
                      typeof record.name === 'string' ? record.name : _.get(record, 'name.props.children.props.text');
                    const recordCode =
                      typeof record.code === 'string' ? record.code : _.get(record, 'code.props.children.props.text');
                    const params = formatUrlParams([recordName, recordCode]);
                    MyStore.dispatch(createStorage(record));
                    router.history.push(
                      // 编辑仓库时不需要id
                      `/knowledgeManagement/storage/create?parentName=${params[0]}${
                        record.storageId ? `&id=${record.storageId}` : ''
                      }&parentCode=${params[1]}&level=${record.level === 1 ? 2 : 1}&qualityControlSwitch=${
                        record.qualityControlSwitch
                      }&qualityControlItems=${JSON.stringify(record.qualityControlItems || [])}`,
                    );
                  }}
                >
                  {'创建子仓位'}
                </Link>
              ) : null}
              <UpdateStatusConfirmModal
                record={record}
                query={query}
                updateStart={() => {
                  this.setState({ loading: true });
                }}
                setStatus={this.setStatus}
              />
              <Link
                style={{ marginLeft: 10 }}
                disabled={!haveEditStorageAuthority}
                onClick={() => {
                  const recordName =
                    typeof record.name === 'string' ? record.name : _.get(record, 'name.props.children.props.text');
                  const recordCode =
                    typeof record.code === 'string' ? record.code : _.get(record, 'code.props.children.props.text');
                  const params = formatUrlParams([recordName, recordCode]);
                  MyStore.dispatch(editStorageAction(record));
                  const { level } = record;
                  router.history.push(
                    level === 3
                      ? // 编辑仓库时不需要id
                        `/knowledgeManagement/storeHouse/edit?code=${params[1]}${
                          record.storageId ? `&id=${record.storageId}` : ''
                        }&page=storage`
                      : `/knowledgeManagement/storage/edit?name=${params[0]}${
                          record.storageId ? `&id=${record.storageId}` : ''
                        }&code=${params[1]}&parentCode=${record.parentCode}&parentName=${record.parentName}&level=${
                          record.level
                        }`,
                  );
                }}
              >
                {'编辑'}
              </Link>
              <Link
                style={{ marginLeft: 10 }}
                onClick={() => {
                  const { level } = record;
                  const recordName =
                    typeof record.name === 'string' ? record.name : _.get(record, 'name.props.children.props.text');
                  const recordCode =
                    typeof record.code === 'string' ? record.code : _.get(record, 'code.props.children.props.text');
                  const params = formatUrlParams([recordName, recordCode]);
                  router.history.push(
                    level === 3
                      ? `/knowledgeManagement/storeHouse/record/${params[1]}`
                      : `/knowledgeManagement/storage/record/${params[1]}`,
                  );
                }}
              >
                {'操作记录'}
              </Link>
            </div>
          );
        },
      },
    ];
    return columns;
  };

  render() {
    const { data, refetch, loading: initialLoading, match } = this.props;
    const query = getQuery(match);
    const { loading, expandedRows, showSearchData } = this.state;
    const columns = this.getColumns();
    return (
      <Spin spinning={initialLoading || loading}>
        <div className={styles.storageList}>
          <div style={{ margin: '0px 20px 20px' }}>
            {/* 这块是否开启质量管理要在仓库接口拿 */}
            <DataExport style={{ display: 'inline-block' }} match={match} />
            <Button
              icon="download"
              ghost
              style={{ margin: '0px 20px' }}
              onClick={() => {
                OpenImportModal({
                  importIdName: 'fileId',
                  withFileName: true,
                  item: '仓位',
                  fileTypes: ['.xlsx'],
                  context: this.context,
                  method: importStorage,
                  listName: 'imports',
                  logUrl: '/knowledgeManagement/storage/importLogs',
                  titles: ['parentLevel', 'parentCode', 'name', 'code', 'qrCode', 'remark'],
                  fileDataStartLocation: 1,
                  templateUrl:
                    'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/20190610/%E4%BB%93%E4%BD%8D%E6%A8%A1%E6%9D%BF.xlsx',
                  onSuccess: () => {
                    refetch({ page: 1 });
                  },
                });
              }}
            >
              导入仓位
            </Button>
            <Link icon="eye" to={'/knowledgeManagement/storage/importLogs'}>
              查看导入日志
            </Link>
          </div>
          <Table
            bordered
            expandedRowKeys={expandedRows}
            dataSource={query.search || showSearchData ? (data && data.data) || [] : this.state.data}
            total={data && data.count}
            rowKey={record => record.id}
            columns={columns}
            scroll={{ x: 1400 }}
            onExpand={this.onExpand}
            refetch={refetch}
          />
        </div>
      </Spin>
    );
  }
}

StorageList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default withRouter(StorageList);
