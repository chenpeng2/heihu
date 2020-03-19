import React, { Component } from 'react';

import { Table, Tooltip, Badge, Link, openModal, Attachment } from 'src/components';
import { replaceSign } from 'src/constants';
import { primary, error } from 'src/styles/color';
import UpdateStatus from 'src/containers/provider/base/updateStatus';
import LinkToEditProvider from 'src/containers/provider/base/linkToEditProvider';

import { STATUS, TABLE_UNIQUE_KEY } from '../constant';

const AttachmentInlineView = Attachment.InlineView;

type Props = {
  data: [],
  pagination: {},
  fetchData: () => {},
};

class Text extends Component {
  props: Props;
  state = {};

  getColumns = () => {
    return [
      {
        title: '供应商名称',
        dataIndex: 'name',
        width: 200,
        render: data => data || replaceSign,
      },
      {
        title: '供应商编号',
        dataIndex: 'code',
        width: 100,
        render: data => data || replaceSign,
      },
      {
        title: '状态',
        dataIndex: 'status',
        width: 100,
        render: data => {
          return <Badge.MyBadge color={data === 1 ? primary : error} text={STATUS[data] || replaceSign} />;
        },
      },
      {
        title: '备注',
        dataIndex: 'remark',
        width: 100,
        render: data => {
          return <Tooltip text={data || replaceSign} length={15} />;
        },
      },
      {
        title: '附件',
        dataIndex: 'attachmentsFile',
        width: 100,
        render: data => {
          if (!Array.isArray(data) || !data.length) return replaceSign;

          return (
            <div style={{ color: primary, cursor: 'pointer' }}>
              <Link
                icon="paper-clip"
                onClick={() => {
                  openModal({
                    title: '附件',
                    footer: null,
                    children: <AttachmentInlineView files={data} />,
                  });
                }}
              />
              <span> {Array.isArray(data) ? data.length : 0} </span>
            </div>
          );
        },
      },
      {
        title: '操作',
        key: 'operation',
        width: 120,
        render: (_, record) => {
          const { code, status } = record || {};

          return (
            <div>
              <UpdateStatus statusNow={{ code: status }} code={code} fetchData={this.props.fetchData} />
              <LinkToEditProvider code={code} />
            </div>
          );
        },
      },
    ].map(node => ({ ...node, key: node.title }));
  };

  handleTableChange = (pagination, filter, sorter) => {
    const { current, pageSize } = pagination || {};
    const { fetchData } = this.props;
    if (typeof fetchData === 'function') {
      fetchData({
        page: current,
        size: pageSize || 10,
      });
    }
  };

  render() {
    const { data, pagination } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        dragable
        tableUniqueKey={TABLE_UNIQUE_KEY}
        onChange={this.handleTableChange}
        dataSource={data || []}
        columns={columns}
        pagination={pagination}
      />
    );
  }
}

export default Text;
