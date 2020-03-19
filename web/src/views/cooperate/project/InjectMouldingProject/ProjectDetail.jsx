import React from 'react';
import { Attachment, Spin, SimpleTable, Link } from 'components';
import { projectTypeDisplay, replaceSign, PROJECT_CATEGORY_INJECTION_MOULDING } from 'constants';
import { format } from 'utils/time';
import { arrayIsEmpty } from 'utils/array';
import { getInjectMoldProjectDetail } from 'services/cooperate/project';
import UpdateProjectStatus from 'containers/project/base/updateProjectStatus/updateProjectStatus';
import { getCraftType } from 'containers/plannedTicket/util';
import Color from 'styles/color';

const AttachmentView = Attachment.InlineView;

class ProjectDetail extends React.Component {
  state = {
    data: null,
  };

  componentDidMount() {
    this.setData();
  }

  setData = async () => {
    const {
      match: {
        params: { projectCode },
      },
    } = this.props;
    const {
      data: { data },
    } = await getInjectMoldProjectDetail({ projectCode });
    this.setState({ data });
  };

  render() {
    const { data } = this.state;
    console.log('data', data);
    if (!data) {
      return <Spin spinning />;
    }
    const {
      injectMoldProject: {
        type,
        projectCode,
        status,
        startTimePlanned,
        endTimePlanned,
        purchaseOrderCode,
        managers,
        planners,
        createdAt,
        remark,
        attachments,
      },
      injectMoldProject,
      projects,
    } = data;
    const columns = [
      { title: '序号', key: 'no', render: (text, record, index) => index + 1 },
      {
        title: '物料编码/名称',
        key: 'material',
        dataIndex: 'outputMaterial',
        render: ({ code, name }) => `${code}/${name}`,
      },
      { title: '数量', key: 'amount', dataIndex: 'outputMaterial.totalAmount' },
      {
        title: '进度',
        key: 'progress',
        dataIndex: 'outputMaterial',
        render: ({ totalAmount, actualAmount, unitName }) => `${actualAmount}/${totalAmount} ${unitName}`,
      },
      { title: '工艺', key: 'mbom', render: record => getCraftType(record) },
      { title: '普通项目', key: 'projectCode', dataIndex: 'projectCode' },
    ];
    const renderFields = [
      { label: '项目类型', value: projectTypeDisplay[type] },
      { label: '项目编号', value: projectCode },
      { label: '状态', value: status.display },
      {
        label: '产出物料',
        value: (
          <SimpleTable
            dataSource={projects.map(node => ({
              ...node,
              outputMaterial: node.outputMaterial[0],
              key: node.projectCode,
            }))}
            columns={columns}
            pagination={false}
            style={{ margin: 0, width: '100%' }}
          />
        ),
        style: {
          flex: '0 0 100%',
          display: 'flex',
        },
      },
      {
        label: '计划时间',
        value: `${startTimePlanned ? format(startTimePlanned) : replaceSign} - ${
          endTimePlanned ? format(endTimePlanned) : replaceSign
        }`,
      },
      { label: '销售订单', value: purchaseOrderCode },
      { label: '生产主管', value: arrayIsEmpty(managers) ? replaceSign : managers.map(({ name }) => name).join(',') },
      { label: '计划员', value: arrayIsEmpty(planners) ? replaceSign : planners.map(({ name }) => name).join(',') },
      { label: '创建时间', value: createdAt ? format(createdAt) : replaceSign },
      { label: '项目备注', value: remark || replaceSign },
      {
        label: '附件',
        value: arrayIsEmpty(attachments) ? replaceSign : <AttachmentView hideTitle files={attachments} />,
      },
    ];
    return (
      <div style={{ margin: 20 }}>
        <div style={{ display: 'flex', alignItem: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 14 }}>项目详情(注塑型)</span>
          <div>
            <UpdateProjectStatus
              useIcon
              projectData={injectMoldProject}
              injectionProjectData={data}
              freshData={() => {
                this.setData();
              }}
              projectCategory={PROJECT_CATEGORY_INJECTION_MOULDING}
            />
            <Link
              icon="bars"
              to={`/cooperate/projects/injection-moulding-project/${projectCode}/detail/operationHistory`}
            >
              查看操作记录
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', margin: '0 40px' }}>
          {renderFields.map(({ label, value, style = {} }) => {
            return (
              <div key={label} style={{ flex: '0 0 33%', marginBottom: 20, ...style }}>
                <span style={{ marginRight: 10, color: Color.fontSub }}>{label}:</span>
                <span style={{ flex: 1 }}>{value}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ProjectDetail;
