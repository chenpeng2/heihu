import React from 'react';
import { Attachment, message } from 'components';
import _ from 'lodash';
import { replaceSign } from 'constants';
import { getProdLine, deleteProdLine, editProdLineWorkers } from 'services/knowledgeBase/prodLine';
import SwitchStatusLink from './switchStatusLink';
import Detail from '../common/detail';
import RelationWorkerInDetail from '../common/RelationWorkerInDetail';
import RelationWorkerTooltip from '../common/RelationWorkerTooltip';

class ProdLineDetail extends React.PureComponent<any> {
  state = {
    data: {},
  };

  componentDidMount = async () => {
    this.setInitData();
  };

  setInitData = async () => {
    const {
      match: {
        params: { prodLineId },
      },
    } = this.props;
    const {
      data: { data },
    } = await getProdLine(prodLineId);
    this.setState({ data, inEdit: false });
  };

  getColumns = () => {
    return [
      { title: '产线编码', dataIndex: 'code' },
      { title: '产线名称', dataIndex: 'name' },
      { title: '上级区域', dataIndex: 'parent' },
      { title: '二维码', dataIndex: 'qrCode' },
      { title: '负责人', dataIndex: 'manager' },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status, { id }) => (
          <span>
            <span style={{ marginRight: 10 }}>{['停用中', '启用中', '草稿'][status]}</span>
            <SwitchStatusLink id={id} status={status} refetch={this.setInitData} />
          </span>
        ),
      },
      { title: '备注', dataIndex: 'remark' },
      {
        title: '附件',
        dataIndex: 'attachmentsFile',
        render: file => (_.get(file, 'length') > 0 ? Attachment.AttachmentFile(file) : replaceSign),
      },
      {
        title: (
          <span>
            关联人员
            <RelationWorkerTooltip />
          </span>
        ),
        dataIndex: 'workers',
        render: workers => {
          return (
            <RelationWorkerInDetail
              workers={workers}
              id={this.props.match.params.prodLineId}
              submitApi={editProdLineWorkers}
              refetch={this.setInitData}
            />
          );
        },
      },
    ];
  };

  render() {
    const { data } = this.state;
    const {
      match: {
        params: { prodLineId },
      },
      location: { query },
      history: { push },
    } = this.props;
    return (
      <div>
        <Detail
          data={data}
          columns={this.getColumns()}
          logPath={`${location.pathname}/logs/${prodLineId}`}
          editPath={`${location.pathname}/edit/${prodLineId}`}
          title="产线详情"
          handleDelete={async () => {
            await deleteProdLine(prodLineId);
            message.success('删除成功！');
            push(query.from || '/knowledgeManagement/prod-line');
          }}
        />
      </div>
    );
  }
}

export default ProdLineDetail;
