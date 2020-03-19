import React from 'react';
import Proptypes from 'prop-types';
import { Drawer, Link, SimpleTable } from 'components';
import { getInjectMoldTaskDetail } from 'services/cooperate/injectMoldTask';
import DetailPageItemContainer from 'components/detailPageItemContainer';
import { getInjectMoldProjectDetail } from 'src/services/cooperate/project';
import { replaceSign, TASK_CATEGORY_INJECT_MOLD, taskStatusMap } from 'constants';
import { formatUnix } from 'utils/time';
import styles from './index.scss';
import UseAndHoldRecord from '../../../../containers/task/produceTask/detail/useAndHoldRecord';

class Detail extends React.PureComponent {
  state = {
    data: null,
    projectData: null,
    showDrawer: false,
    material: {},
  };

  componentDidMount() {
    this.setData();
  }

  setData = async () => {
    const {
      match: {
        params: { taskId },
      },
    } = this.props;
    const {
      data: { data },
    } = await getInjectMoldTaskDetail(taskId);
    const {
      data: { data: projectData },
    } = await getInjectMoldProjectDetail({ projectCode: data.projectCode });
    this.setState({ data, projectData });
  };

  renderMaterials = ({ dataSource, type }) => {
    const name = type === 'input' ? '投产' : '产出';
    const columns = [
      {
        title: `${name}物料`,
        key: 'material',
        dataIndex: 'materialCode',
        render: (materialCode, { materialName }) => `${materialCode}/${materialName}`,
      },
      {
        title: `计划${name}数量`,
        key: 'amountProductPlanned',
        dataIndex: 'amountProductPlanned',
        render: (amount, { unit }) => `${amount} ${unit || replaceSign}`,
      },
      {
        title: `实际${name}数量`,
        key: 'amountProductQualified',
        dataIndex: 'amountProductQualified',
        render: (amount, { unit }) => `${amount} ${unit || replaceSign}`,
      },
      {
        title: '操作',
        key: 'operate',
        render: (text, { materialCode, materialName }) => {
          return (
            <div>
              <Link
                onClick={() => {
                  this.setState({
                    showDrawer: true,
                    material: {
                      materialCode,
                      materialName,
                    },
                    recordType: type === 'input' ? 'use' : 'hold',
                    useQrCode: 'true',
                  });
                }}
              >
                {`${name}记录`}
              </Link>
            </div>
          );
        },
      },
    ];
    return (
      <SimpleTable columns={columns} dataSource={dataSource} style={{ width: '100%', margin: 10 }} pagination={false} />
    );
  };

  renderProject = () => {
    const { projectData, data } = this.state;
    const { changeChineseToLocale } = this.context;
    if (!projectData) {
      return null;
    }
    const { injectMoldProject } = projectData;
    const { projectCode, status } = injectMoldProject;
    const { projectStartTimePlanned, projectStartTimeReal, projectEndTimePlanned, projectEndTimeReal } = data;
    const projectMsg = [
      { label: '项目号', value: projectCode },
      { label: '项目状态', value: changeChineseToLocale(status.display) },
      {
        label: '计划开始结束时间',
        value: `${projectStartTimePlanned ? formatUnix(projectStartTimePlanned) : replaceSign}~${
          projectEndTimePlanned ? formatUnix(projectEndTimePlanned) : replaceSign
        }`,
      },
      {
        label: '实际开始结束时间',
        value: `${projectStartTimeReal ? formatUnix(projectStartTimeReal) : replaceSign}~${
          projectEndTimeReal ? formatUnix(projectEndTimeReal) : replaceSign
        }`,
      },
    ];
    return (
      <DetailPageItemContainer itemHeaderTitle="项目信息" className={styles.block}>
        <div>
          {projectMsg.map(({ label, value }) => (
            <div key={label} className={styles.row}>
              <span className={styles.label}>{changeChineseToLocale(label)}</span>
              <span className={styles.value}>{value}</span>
            </div>
          ))}
        </div>
      </DetailPageItemContainer>
    );
  };

  render() {
    const { data, material, recordType, useQrCode } = this.state;
    const { changeChineseToLocale } = this.context;
    if (!data) {
      return null;
    }
    const {
      taskCode,
      createdAt,
      id,
      operators,
      status,
      processName,
      processCode,
      workstation,
      startTimePlanned,
      startTimeReal,
      progresses,
      useProgresses,
      endTimePlanned,
      endTimeReal,
    } = data;
    const taskMsg = [
      { label: '任务编码', value: taskCode },
      { label: '任务号', value: id },
      { label: '执行人', value: operators && operators.map(({ name }) => name).join(',') },
      { label: '任务状态', value: changeChineseToLocale(taskStatusMap.get(status)) },
      { label: '工序名称', value: `${processCode}/${processName}` },
      { label: '工位名称', value: workstation && workstation.name },
      {
        label: '计划开始结束时间',
        value: `${startTimePlanned ? formatUnix(startTimePlanned) : replaceSign}~${
          endTimePlanned ? formatUnix(endTimePlanned) : replaceSign
        }`,
      },
      {
        label: '实际开始结束时间',
        value: `${startTimeReal ? formatUnix(startTimeReal) : replaceSign}~${
          endTimeReal ? formatUnix(endTimeReal) : replaceSign
        }`,
      },
    ];

    return (
      <div className={styles.injectMoldDetail}>
        <div className={styles.header}>
          <div className={styles.bar}>
            <span className={styles.code}>
              {changeChineseToLocale('任务编号')}: {taskCode}
            </span>
            <Link icon="bars" to={`${location.pathname}/log`}>
              查看操作记录
            </Link>
          </div>
          <p className={styles.subHeader}>
            <span>
              {changeChineseToLocale('创建时间')}: {formatUnix(createdAt)}
            </span>
          </p>
        </div>
        <DetailPageItemContainer itemHeaderTitle="任务信息" className={styles.block}>
          <div>
            {taskMsg.map(({ label, value }) => (
              <div key={label} className={styles.row}>
                <span className={styles.label}>{changeChineseToLocale(label)}</span>
                <span className={styles.value}>{value}</span>
              </div>
            ))}
          </div>
        </DetailPageItemContainer>
        <DetailPageItemContainer itemHeaderTitle="生产信息" className={styles.block}>
          {this.renderMaterials({ dataSource: progresses, type: 'output' })}
          {this.renderMaterials({ dataSource: useProgresses, type: 'input' })}
        </DetailPageItemContainer>
        {this.renderProject()}
        <Drawer
          sidebar={
            <UseAndHoldRecord
              // reportType={reportTypeValue}
              recordType={recordType}
              useQrCode={useQrCode}
              material={material}
              taskId={id}
              isClear={this.state.showDrawer}
              taskCategory={TASK_CATEGORY_INJECT_MOLD}
            />
          }
          position="right"
          transition
          open={this.state.showDrawer}
          onCancel={() => this.setState({ showDrawer: false })}
        />
      </div>
    );
  }
}

Detail.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default Detail;
