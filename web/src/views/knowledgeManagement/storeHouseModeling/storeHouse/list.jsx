import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Link,
  RestPagingTable,
  Icon,
  Spin,
  Badge,
  Button,
  Tooltip,
  openModal,
  Attachment,
  haveAuthority,
} from 'src/components';
import { replaceSign } from 'src/constants';
import auth from 'utils/auth';
import { primary, error } from 'src/styles/color';

import LinkToEditPage from './commonComponent/linkToEditPage';
import LinkToOperationHistory from './commonComponent/linkToOperationHistory';
import UpdateStatusConfirmModal from '../storage/updateStatusConfirmModal';
import { getStorageDetailPageUrl } from './utils';

const MyBadge = Badge.MyBadge;

type Props = {
  refetch: () => {},
  data: [],
  loading: boolean,
  match: {},
};

const AttachmentImageView = Attachment.ImageView;

class StoreHouseList extends Component {
  props: Props;
  state = {
    visible: false,
    haveChildren: false,
    loading: false,
  };

  getColumns = () => {
      const { changeChineseToLocale } = this.context;
    return [
      {
        title: '仓库名称',
        dataIndex: 'name',
        type: 'mfgBatchNo',
        fixed: 'left',
        key: 'name',
        render: name => name,
      },
      {
        title: '仓库编码',
        dataIndex: 'code',
        type: 'mfgBatchNo',
        key: 'code',
        render: code => <Tooltip text={code} length={16} />,
      },
      {
        title: '区域',
        key: 'category',
        width: 120,
        dataIndex: 'category',
        render: (category, record) =>
          category === 1 ? changeChineseToLocale('仓库') : <Tooltip text={record.workshopName || replaceSign} length={7} />,
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
        width: 210,
        render: (__, record) => (
          <React.Fragment>
            <Link to={getStorageDetailPageUrl(_.get(record, 'code'))}>查看</Link>
            <UpdateStatusConfirmModal
              record={record}
              query={{}}
              updateStart={() => {
                this.setState({ loading: true });
              }}
              setStatus={() => {
                this.setState({ loading: false });
              }}
            />
            <LinkToEditPage code={_.get(record, 'code')} style={{ marginLeft: 10 }} />
            <LinkToOperationHistory code={_.get(record, 'code')} style={{ marginLeft: 10 }} />
          </React.Fragment>
        ),
      },
    ];
  };

  render() {
    const { data, refetch, loading: initialLoading } = this.props;
    const { changeChineseToLocale } = this.context;
    const { loading } = this.state;
    const columns = this.getColumns();
    const haveCreateStorehouseAuthority = haveAuthority(auth.WEB_WAREHOUSE_CREATE);

    return (
      <Spin spinning={initialLoading || loading}>
        <Button
          disabled={!haveCreateStorehouseAuthority}
          style={{
            height: 32,
            display: 'block',
            margin: '20px 0 20px 20px',
          }}
          onClick={() => {
            this.context.router.history.push('/knowledgeManagement/storeHouse/create');
          }}
        >
          <Icon type={'plus-circle-o'} />
          {changeChineseToLocale('创建仓库')}
        </Button>
        <RestPagingTable
          bordered
          dataSource={(data && data.data) || []}
          total={data && data.count}
          rowKey={record => record.id}
          columns={columns}
          scroll={{ x: 1400 }}
          refetch={refetch}
        />
      </Spin>
    );
  }
}

StoreHouseList.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};


export default withRouter(StoreHouseList);
