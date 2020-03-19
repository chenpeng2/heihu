import React from 'react';
import { SimpleTable, Badge, message, Button, Tooltip, Link } from 'components';
import { replaceSign } from 'constants';
import SearchSelect from 'components/select/searchSelect';
import { getProjectFinishReasonList } from 'services/knowledgeBase/projectFinishReason';

const formatTasks = tasks => {
  return tasks.map(({ projectCode, taskCode, status, processSeq, processName, workstation, operators, id }) => {
    return {
      id,
      projectCode,
      code: taskCode,
      status,
      processName,
      processSeq,
      workstation: workstation && workstation.name,
      operators:
        operators &&
        operators
          .filter(({ fake }) => fake === false)
          .map(({ name }) => name)
          .join('、'),
      type: '生产任务',
    };
  });
};

const formatQcTasks = qcTasks => {
  return qcTasks.map(({ projectCode, code, status, operatorName, task }) => {
    const { processSeq, processName, workstation, id } = task || {};
    return {
      id,
      code,
      projectCode,
      status,
      processName: processName || replaceSign,
      processSeq: processSeq || replaceSign,
      workstation: workstation && workstation.name,
      operators: operatorName || replaceSign,
      type: '质检任务',
    };
  });
};
class FinishProjectModal extends React.PureComponent<any> {
  state = {
    visible: true,
    hasFinishResult: false,
  };
  finishReasonId = '';
  componentDidMount = async () => {
    const {
      data: { total },
    } = await getProjectFinishReasonList({ size: 1, page: 1, status: 1 });
    this.setState({ hasFinishResult: !!total });
  };

  submit = async () => {
    const { changeChineseToLocale } = this.context;
    if (this.state.hasFinishResult && !this.finishReasonId) {
      return message.error(changeChineseToLocale('请填写项目结束原因'));
    }
    await this.props.onOk({ finishReasonId: this.finishReasonId });
    message.success(changeChineseToLocale('操作成功！'));
    this.props.onClose();
  };

  render() {
    const { changeChineseToLocale, changeChineseTemplateToLocale } = this.context;
    const { prodTasks, qcTasks, onCancel, onOk } = this.props;
    const { hasFinishResult } = this.state;
    const columns = [
      { title: '项目号', dataIndex: 'projectCode' },
      { title: '类型', dataIndex: 'type' },
      {
        title: '任务编号',
        dataIndex: 'code',
        render: (code, { type, id }) => (
          <Link
            onClick={() =>
              window.open(
                type === '生产任务' ? `/cooperate/prodTasks/detail/${id}` : `/qualityManagement/qcTask/detail/${code}`,
              )
            }
          >
            {code}
          </Link>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: status => {
          const statusMap = {
            1: { status: 'default', display: '未开始' },
            2: { status: 'success', display: '执行中' },
            3: { status: 'error', display: '暂停中' },
          };
          return (
            <span>
              <Badge status={statusMap[status].status} text={statusMap[status].display} />
            </span>
          );
        },
      },
      {
        title: '工序',
        dataIndex: 'processSeq',
        render: (processSeq, { processName }) => `${processSeq || replaceSign}/${processName || replaceSign}`,
      },
      { title: '工位', dataIndex: 'workstation' },
      { title: '执行人', dataIndex: 'operators' },
    ].map(node => ({
      render: text => <Tooltip text={text || replaceSign} length={14} />,
      ...node,
      key: node.title,
      width: 150,
    }));
    return (
      <div style={{ margin: 20 }}>
        {prodTasks.length > 0 && (
          <React.Fragment>
            <p>
              {changeChineseTemplateToLocale(
                '该项目有以下{length}个未开始、执行中或暂停中的生产任务，结束项目后会同时结束或取消这些生产任务',
                { length: prodTasks.length },
              )}
            </p>
            <SimpleTable
              columns={columns}
              dataSource={formatTasks(prodTasks)}
              pagination={false}
              style={{ margin: '10px 0' }}
              scroll={{ y: 210, x: columns.length * 150 }}
            />
          </React.Fragment>
        )}
        {qcTasks.length > 0 && (
          <React.Fragment>
            <p>
              {changeChineseTemplateToLocale(
                '该项目有以下{length}个未开始、执行中的质检任务，结束项目后会同时结束或取消这些质检任务',
                { length: qcTasks.length },
              )}
            </p>
            <SimpleTable
              columns={columns}
              dataSource={formatQcTasks(qcTasks)}
              pagination={false}
              style={{ margin: '10px 0' }}
              scroll={{ y: 210, x: columns.length * 150 }}
            />
          </React.Fragment>
        )}
        {hasFinishResult && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'right', width: '33%' }}>{changeChineseToLocale('请选择结束原因：')}</div>
            <div style={{ width: '66%' }}>
              <SearchSelect
                type="projectFinishReason"
                onChange={value => (this.finishReasonId = value)}
                labelInValue={false}
                params={{ status: 1 }}
                style={{ width: 300 }}
              />
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
          <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button
            type="primary"
            style={{ width: 114 }}
            onClick={async () => {
              if (hasFinishResult && !this.finishReasonId) {
                message.error(changeChineseToLocale('请选择结束原因！'));
                return;
              }
              onOk({ finishReasonId: this.finishReasonId });
            }}
          >
            完成
          </Button>
        </div>
      </div>
    );
  }
}

FinishProjectModal.contextTypes = {
  changeChineseToLocale: () => {},
  changeChineseTemplateToLocale: () => {},
};

export default FinishProjectModal;
