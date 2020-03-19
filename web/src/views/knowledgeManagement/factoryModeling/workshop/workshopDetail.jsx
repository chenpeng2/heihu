import React from 'react';
import { getWorkshop, deleteWorkshop, editWorkshopWorkers } from 'services/knowledgeBase/workshop';
import { Attachment, message } from 'components';
import _ from 'lodash';
import { replaceSign } from 'constants';
import SwitchStatusLink from './switchStatusLink';
import Detail from '../common/detail';
import RelationWorkerInDetail from '../common/RelationWorkerInDetail';
import RelationWorkerTooltip from '../common/RelationWorkerTooltip';

class WorkshopDetail extends React.PureComponent<any> {
  state = {
    data: {},
    inEdit: false,
    dataSource: [],
  };

  componentDidMount = () => {
    this.setInitData();
  };

  setInitData = async () => {
    const {
      match: {
        params: { workshopId },
      },
    } = this.props;
    const {
      data: { data },
    } = await getWorkshop(workshopId);
    this.setState({ data });
  };

  getColumns = () => [
    { title: '车间编码', dataIndex: 'code' },
    { title: '车间名称', dataIndex: 'name' },
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
            id={this.props.match.params.workshopId}
            submitApi={editWorkshopWorkers}
            refetch={this.setInitData}
          />
        );
      },
    },
  ];

  render() {
    const { data } = this.state;
    const {
      match: {
        params: { workshopId },
      },
      location: { query },
      history: { push },
    } = this.props;
    return (
      <div>
        <Detail
          data={data}
          columns={this.getColumns()}
          logPath={`${location.pathname}/logs/${workshopId}`}
          editPath={`${location.pathname}/edit/${workshopId}`}
          title="车间详情"
          handleDelete={async () => {
            await deleteWorkshop(workshopId);
            message.success('删除成功！');
            push(query.form || '/knowledgeManagement/workshop');
          }}
        />
      </div>
    );
  }
}

export default WorkshopDetail;
