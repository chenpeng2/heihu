import React, { Component } from 'react';
import { Table, Badge, OpenModal, Link, Icon, Tooltip, Attachment, message } from 'components';
import { replaceSign } from 'constants';
import { primary, error } from 'src/styles/color';
import { editCustomer } from 'src/services/knowledgeBase/customer';
import { CustomerBaseForm } from 'src/containers/customers';
import { STATUS, TABLE_UNIQUE_KEY } from '../constant';

const AttachmentImageView = Attachment.ImageView;

type props = {
  loading: boolean,
  dataSource: [],
  total: number,
  pagination: {},
  refetch: () => {},
  knowledgeItem: {},
};

class CustomerTable extends Component<props> {
  state = {};

  getColumns = () => {
    const { knowledgeItem, refetch } = this.props;
    const columns = [
      {
        title: '客户编号',
        dataIndex: 'code',
        width: 150,
        render: code => {
          return code ? <Tooltip text={code} length={11} /> : replaceSign;
        },
      },
      {
        title: '客户名称',
        dataIndex: 'name',
        width: 150,
        render: name => {
          return name ? <Tooltip text={name} length={11} /> : replaceSign;
        },
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        width: 150,
        render: email => {
          return email ? <Tooltip text={email} length={18} /> : replaceSign;
        },
      },
      {
        title: '联系地址',
        dataIndex: 'contactAddress',
        width: 220,
        render: address => {
          return address ? <Tooltip text={address} length={15} /> : replaceSign;
        },
      },
      {
        title: '联系人',
        dataIndex: 'contactName',
        width: 150,
        render: name => {
          return name ? <Tooltip text={name} length={15} /> : replaceSign;
        },
      },
      {
        title: '联系电话',
        dataIndex: 'contactPhone',
        width: 130,
        render: phone => {
          return phone || replaceSign;
        },
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
        width: 220,
        render: remark => {
          return remark ? <Tooltip text={remark} length={15} /> : replaceSign;
        },
      },
      {
        title: '附件',
        dataIndex: 'attachments',
        width: 80,
        render: (attachments, index) => {
          return attachments && attachments.length > 0 ? (
            <Link
              key={`attachment-${index}`}
              onClick={async () => {
                // const attachments = await this.fetchAttachmentData(attachmentIds);
                OpenModal(
                  {
                    title: '附件',
                    footer: null,
                    children: <AttachmentImageView attachment={{ files: attachments }} />,
                  },
                  this.context,
                );
              }}
            >
              <Icon type="paper-clip" />
              {attachments.length}
            </Link>
          ) : (
            replaceSign
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'id',
        fixed: 'right',
        width: 150,
        render: (id, record) => {
          const { status } = record;
          return (
            <div key={`action-${record.id}`}>
              <Link
                style={{ marginRight: 10 }}
                onClick={() => {
                  OpenModal(
                    {
                      title: `编辑${knowledgeItem.display}`,
                      children: <CustomerBaseForm onCompeleted={refetch} editing initialData={record} />,
                      footer: null,
                      width: 730,
                      innerContainerStyle: { height: 558 },
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </Link>
              {status === 0 ? (
                <Link
                  onClick={async () => {
                    await editCustomer(id, { id, status: 1 });
                    message.success('启用成功！');
                    refetch();
                  }}
                >
                  启用
                </Link>
              ) : (
                <Link
                  onClick={async () => {
                    await editCustomer(id, { id, status: 0 });
                    message.success('停用成功！');
                    refetch();
                  }}
                >
                  停用
                </Link>
              )}
            </div>
          );
        },
      },
    ];
    return columns;
  };

  handleTableChange = (pagination, filters, sorter) => {
    const { current, pageSize } = pagination || {};
    const { refetch } = this.props;
    if (typeof refetch === 'function') {
      refetch({
        page: current,
        size: pageSize || 10,
      });
    }
  };

  // editCustomer = async values => {
  //   const { attachments, ...rest } = values;
  //   const ids = attachments && attachments.map(({ restId }) => restId);
  //   return await editCustomer({ attachments: ids, ...rest }).then(({ data: { statusCode } }) => {
  //     if (statusCode === 200) {
  //       this.props.refetch();
  //     }
  //   });
  // };

  render() {
    const { loading, dataSource, total, pagination } = this.props;
    const columns = this.getColumns();
    return (
      <Table
        tableUniqueKey={TABLE_UNIQUE_KEY}
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        scroll={{ x: 1500 }}
        total={total}
        rowKey={record => record && record.id}
        pagination={pagination}
        onChange={this.handleTableChange}
        bordered
      />
    );
  }
}

export default CustomerTable;
