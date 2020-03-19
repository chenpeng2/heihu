import React, { Component } from 'react';
import _ from 'lodash';
import { withRouter } from 'react-router-dom';
import Tree from 'rc-tree';
import 'rc-tree/assets/index.css';
import { withForm, Attachment, Popover, Link, Tooltip, openModal, RestPagingTable, Button } from 'components';
import moment, { formatDateTime, formatToUnix } from 'utils/time';
import { replaceSign } from 'constants';
import { setLocation } from 'utils/url';
import { getLocation } from 'src/routes/getRouteParams';
import { wrapUrl, download } from 'utils/attachment';
import { getFolderList, updateFolder, getFileList } from 'src/services/knowledgeBase/file';
import DocumentFilter from './filter';
import { formatFolders, fileStatusMap } from '../utils';
import styles from './styles.scss';

type propTypes = {
  form: any,
  match: {},
};

const AttachmentImageView = Attachment.ImageView;

const formatParams = formValue => {
  const { createdAt, ..._params } = formValue;
  if (!_params.nameLike) {
    _params.nameLike = undefined;
  }
  if (!_params.versionLike) {
    _params.versionLike = undefined;
  }
  if (!_params.codeLike) {
    _params.codeLike = undefined;
  }
  if (_params.status === 'all') {
    _params.status = undefined;
  }
  if (_params.type === 'all') {
    _params.type = undefined;
  }
  if (_params.creatorId) {
    _params.creatorId = _params.creatorId.key;
  }
  if (Array.isArray(createdAt) && createdAt.length === 2) {
    const [startTime, endTime] = createdAt;
    _params.fromAt = formatToUnix(
      startTime
        .hour(0)
        .minute(0)
        .second(0),
    );
    _params.tillAt = formatToUnix(
      endTime
        .hour(23)
        .minute(59)
        .second(59),
    );
  }
  return _params;
};

class FolderList extends Component<propTypes> {
  state = {
    folderSearch: '',
  };

  async componentDidMount() {
    const { match, form } = this.props;
    if (match) {
      const location = getLocation(match);
      const filter = _.get(location, 'query.filter');
      if (filter) {
        if (filter.createdAt && !_.isEmpty(filter.createdAt)) {
          filter.createdAt[0] = moment(filter.createdAt[0]);
          filter.createdAt[1] = moment(filter.createdAt[1]);
        }
        form.setFieldsValue(filter);
      }
      const folderId = _.get(location, 'query.folderId');
      this.setState({ folderId: [folderId || 'all'] });
    }
    await this.setInitialData();
  }

  setInitialData = async () => {
    const {
      data: { data },
    } = await getFolderList({ status: 1 });
    const dataSource = formatFolders([{ name: '全部', id: 'all' }].concat(data));
    this.setState({
      dataSource,
    });
    await this.fetchFiles({ folderId: 'all' });
  };

  fetchFiles = async params => {
    const { match } = this.props;
    const location = getLocation(match);
    location.query = { ...location.query, ...params };
    const {
      form: { getFieldsValue },
    } = this.props;
    setLocation(this.props, () => ({ ...location.query, filter: getFieldsValue() }));
    const _params = {
      ...location.query,
      ...formatParams(getFieldsValue()),
    };
    if (_params && _params.folderId === 'all') {
      _params.folderId = undefined;
    }
    delete _params.filter;
    const {
      data: { data: files, total: fileTotal },
    } = await getFileList({ ..._params });
    this.setState({ files, fileTotal });
  };

  getColumns = () => {
    const columns = [
      {
        title: '文档编码',
        key: 'code',
        dataIndex: 'code',
        fixed: 'left',
        width: 100,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '版本',
        key: 'version',
        dataIndex: 'version',
        fixed: 'left',
        width: 100,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '名称',
        key: 'name',
        width: 100,
        fixed: 'left',
        dataIndex: 'name',
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '文档状态',
        key: 'status',
        dataIndex: 'status',
        width: 180,
        render: status => fileStatusMap[status] || replaceSign,
      },
      {
        title: '文档格式',
        key: 'type',
        dataIndex: 'type',
        width: 180,
        render: text => text || replaceSign,
      },
      {
        title: '文件夹',
        key: 'folder.name',
        dataIndex: 'folder.name',
        width: 180,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '描述',
        key: 'desc',
        dataIndex: 'desc',
        width: 180,
        render: text => <Tooltip length={20} text={text || replaceSign} />,
      },
      {
        title: '创建人',
        key: 'creatorName',
        dataIndex: 'creatorName',
        width: 180,
        render: text => text || replaceSign,
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        render: text => (text ? formatDateTime(text) : replaceSign),
      },
      {
        title: '操作',
        key: 'id',
        width: 180,
        fixed: 'right',
        dataIndex: 'id',
        render: (id, { attachment, status }) => {
          return (
            <span className="child-gap" style={{ textAlign: 'right' }}>
              {
                <Popover
                  content={
                    <div style={{ padding: '0 5px' }}>
                      <Link
                        onClick={() => {
                          if (!attachment) {
                            return;
                          }
                          window.open(wrapUrl(attachment.id));
                        }}
                        target="_blank"
                      >
                        预览
                      </Link>
                      <Link
                        style={{ paddingLeft: 20 }}
                        onClick={() => {
                          if (!attachment) {
                            return;
                          }
                          const { id, originalFileName } = attachment;
                          download(wrapUrl(id), originalFileName);
                        }}
                        download
                        target="_blank"
                      >
                        下载
                      </Link>
                    </div>
                  }
                >
                  <Link>附件</Link>
                </Popover>
              }
              {
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/knowledgeManagement/documents/${id}/detail`);
                  }}
                >
                  查看
                </Link>
              }
              {
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/knowledgeManagement/documents/${id}/edit`);
                  }}
                >
                  编辑
                </Link>
              }
              {status === 1 ? (
                <Link
                  onClick={() => {
                    this.context.router.history.push(`/knowledgeManagement/documents/${id}/changeVersion`);
                  }}
                >
                  版本变更
                </Link>
              ) : null}
            </span>
          );
        },
      },
    ];
    return columns;
  };

  renderActions = () => (
    <div style={{ padding: 20 }}>
      <Button
        icon="plus-circle-o"
        style={{ marginRight: '20px' }}
        onClick={() => {
          this.context.router.history.push('/knowledgeManagement/documents/create');
        }}
      >
        创建文件
      </Button>
    </div>
  );

  render() {
    const { form } = this.props;
    const { dataSource, files, fileTotal, folderId } = this.state;
    return (
      <div className={styles.FolderContainer}>
        <div className={styles.leftContainer}>
          <Tree
            autoExpandParent
            defaultExpandAll
            defaultSelectedKeys={['all']}
            selectedKeys={folderId}
            treeData={dataSource}
            onSelect={id => {
              if (Array.isArray(id) && id.length === 1) {
                this.setState({ folderId: id });
                this.fetchFiles({ folderId: id[0] });
              }
            }}
          />
        </div>
        <div className={styles.rightContainer}>
          <DocumentFilter form={form} onFilter={this.fetchFiles} />
          {this.renderActions()}
          <div>
            <RestPagingTable
              style={{ width: 1000 }}
              scroll={{ x: true }}
              columns={this.getColumns()}
              dataSource={files || []}
              refetch={this.fetchFiles}
              total={fileTotal}
            />
          </div>
        </div>
      </div>
    );
  }
}

FolderList.contextTypes = {
  router: {},
};

export default withRouter(withForm({}, FolderList));
