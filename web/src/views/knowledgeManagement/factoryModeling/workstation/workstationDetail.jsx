import React from 'react';
import { Attachment, Link, withForm, message } from 'components';
import _ from 'lodash';
import {
  getWorkstation,
  editWorkstationWorkers,
  deleteWorkstation,
  editWorkstation,
} from 'services/knowledgeBase/workstation';
import { replaceSign } from 'constants';
import SearchSelect from 'components/select/searchSelect';
import SwitchStatusLink from './switchStatusLink';
import RelationWorkerInDetail from '../common/RelationWorkerInDetail';
import Detail from '../common/detail';
import RelationWorkerTooltip from '../common/RelationWorkerTooltip';

class WorkstationDetail extends React.PureComponent<any> {
  state = {
    data: {},
    inEditEquipments: false,
  };

  componentDidMount() {
    this.setInitData();
  }

  setInitData = () => {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    getWorkstation(id).then(({ data: { data } }) => {
      this.setState({ data, inEdit: false });
    });
  };

  updateEquipments = async () => {
    const {
      form: { getFieldValue },
      match: {
        params: { id },
      },
    } = this.props;
    const equipments = getFieldValue('equipments');
    await editWorkstation(id, {
      equipments: equipments && equipments.map(({ key }) => key),
    });
    this.setState({ inEditEquipments: false });
    message.success('更新报工设备成功!');
    this.setInitData();
  };
  getColumns = () => {
    const {
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    return [
      { title: '工位编码', dataIndex: 'code' },
      { title: '工位名称', dataIndex: 'name' },
      { title: '上级区域', dataIndex: 'parent' },
      { title: '工位组', dataIndex: 'group' },
      { title: '多任务工位', dataIndex: 'toManyTask', render: task => (task === 1 ? '是' : '否') },
      {
        title: '报工设备',
        dataIndex: 'equipments',
        render: equipments =>
          this.state.inEditEquipments ? (
            <div className="child-gap">
              {getFieldDecorator('equipments')(<SearchSelect mode="multiple" type="device" style={{ width: 300 }} />)}
              <Link onClick={() => this.updateEquipments()}>保存</Link>
              <Link onClick={() => this.setState({ inEditEquipments: false })}>取消</Link>
            </div>
          ) : (
            <div className="child-gap">
              <span>
                {equipments && equipments.length > 0
                  ? _.join(equipments.map(({ entity: { name } }) => name), '，')
                  : replaceSign}
              </span>
              <Link
                onClick={() => {
                  this.setState({ inEditEquipments: true }, () => {
                    setFieldsValue({
                      equipments: equipments.map(({ entity: { id, name } }) => ({ key: id, label: name })),
                    });
                  });
                }}
              >
                编辑
              </Link>
            </div>
          ),
      },
      { title: '二维码', dataIndex: 'qrCode' },
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
        render: file => (_.get(file, 'length', 0) > 0 ? Attachment.AttachmentFile(file) : replaceSign),
      },
      {
        title: (
          <span>
            关联人员 <RelationWorkerTooltip />
          </span>
        ),
        dataIndex: 'workers',
        render: workers => {
          return (
            <RelationWorkerInDetail
              workers={workers}
              submitApi={editWorkstationWorkers}
              refetch={this.setInitData}
              id={this.props.match.params.id}
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
        params: { id },
      },
      location: { query },
      history: { push },
    } = this.props;
    return (
      <div>
        <Detail
          data={data}
          columns={this.getColumns()}
          logPath={`${location.pathname}/logs/${id}`}
          editPath={`${location.pathname}/edit/${id}`}
          title="工位详情"
          handleDelete={async () => {
            await deleteWorkstation(id);
            message.success('删除成功！');
            push(query.from || '/knowledgeManagement/workstation');
          }}
        />
      </div>
    );
  }
}

export default withForm({}, WorkstationDetail);
