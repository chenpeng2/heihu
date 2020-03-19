import React, { Component } from 'react';
import { withForm, message, Tooltip, Link, openModal, SimpleTable, Button, FormattedMessage } from 'components';
import { formatDateTime, formatToUnix } from 'utils/time';
import { error } from 'src/styles/color';
import { replaceSign } from 'constants';
import { getFileList } from 'src/services/knowledgeBase/file';
import { fileStatusMap } from 'src/views/knowledgeManagement/documentManagement/utils';
import DocumentFilter from './filter';

type propTypes = {
  form: any,
  match: {},
  onOk: () => {},
  onCancel: () => {},
};

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
    addedFiles: [],
  };

  fetchFiles = async params => {
    const {
      form: { getFieldsValue },
    } = this.props;
    const _params = {
      ...params,
      ...formatParams(getFieldsValue()),
    };
    if (_params && _params.folderId === 'all') {
      _params.folderId = undefined;
    }
    const {
      data: { data: files, total: fileTotal },
    } = await getFileList({ ..._params });
    this.setState({ files, fileTotal });
  };

  getColumns = type => {
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
        render: text => text || replaceSign,
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
    ];
    if (type === 'add') {
      columns.push({
        title: '操作',
        key: 'id',
        width: 100,
        fixed: 'right',
        dataIndex: 'id',
        render: (id, file) => {
          const { addedFiles } = this.state;
          return (
            <span className="child-gap" style={{ textAlign: 'right' }}>
              {
                <Link
                  disabled={addedFiles.map(e => e.id).indexOf(id) !== -1}
                  onClick={() => {
                    addedFiles.push(file);
                    this.setState({ addedFiles });
                  }}
                >
                  添加
                </Link>
              }
            </span>
          );
        },
      });
    } else if (type === 'delete') {
      columns.push({
        title: '操作',
        key: 'id',
        width: 100,
        fixed: 'right',
        dataIndex: 'id',
        render: (id, file) => {
          const { addedFiles } = this.state;
          return (
            <span className="child-gap" style={{ textAlign: 'right' }}>
              {
                <Link
                  style={{ color: error }}
                  onClick={() => {
                    const index = addedFiles.find(file => file.id === id);
                    addedFiles.splice(index, 1);
                    this.setState({ addedFiles });
                  }}
                >
                  删除
                </Link>
              }
            </span>
          );
        },
      });
    }
    return columns;
  };

  renderFooter = () => {
    const { onOk, onCancel } = this.props;
    const { addedFiles } = this.state;
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={() => onCancel()}>
          取消
        </Button>
        <Button
          type="primary"
          style={{ width: 114 }}
          onClick={async () => {
            if (!addedFiles.length) {
              message.error('请选择文档');
            }
            onOk(addedFiles);
          }}
        >
          确定
        </Button>
      </div>
    );
  };

  render() {
    const { form } = this.props;
    const { files, fileTotal, addedFiles } = this.state;
    return (
      <div>
        <div>
          <DocumentFilter form={form} onFilter={() => this.fetchFiles({ page: 1, status: 1, size: 1000 })} />
          <div>
            <SimpleTable
              noDefaultPage
              style={{ width: 1000 }}
              scroll={{ x: true }}
              columns={this.getColumns('add')}
              dataSource={files || []}
              pagination={{ pageSize: 10 }}
            />
          </div>
          <div style={{ borderTop: '1px solid #E8E8E8', padding: 10, marginTop: 30 }}>
            <FormattedMessage defaultMessage={'已添加'} />
          </div>
          <SimpleTable
            style={{ width: 1000 }}
            scroll={{ x: true }}
            columns={this.getColumns('delete')}
            dataSource={addedFiles || []}
            pagination={false}
          />
        </div>
        {this.renderFooter()}
      </div>
    );
  }
}

export default withForm({}, FolderList);
