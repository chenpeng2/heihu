import React from 'react';
import { SimpleTable, Badge, message, withForm, Tooltip, Link } from 'components';
import { replaceSign } from 'constants';
import SearchSelect from 'components/select/searchSelect';
import { getProjectFinishReasonList } from 'services/knowledgeBase/projectFinishReason';

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
    await this.props.updateStatusFn({ finishReasonId: this.finishReasonId });
    message.success(changeChineseToLocale('操作成功！'));
    this.props.onClose();
  };

  render() {
    const { dataSource } = this.props;
    const { changeChineseToLocale } = this.context;
    const { hasFinishResult } = this.state;
    const dataSource1 = dataSource.filter(({ status }) => status === 'running' || status === 'pause');
    const dataSource2 = dataSource.filter(({ status }) => status === 'unStart');
    const columns = [
      { title: '类型', dataIndex: 'type' },
      {
        title: '任务编号',
        dataIndex: 'code',
        render: (code, { path }) => <Link.NewTagLink href={path}>{code}</Link.NewTagLink>,
      },
      {
        title: '状态',
        dataIndex: 'status',
        render: (status, { statusDisplay }) => {
          const statusMap = {
            unStart: { status: 'default', display: '未开始' },
            running: { status: 'success', display: '执行中' },
            pause: { status: 'error', display: '暂停中' },
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
        {dataSource1.length > 0 && (
          <React.Fragment>
            <p>
              {changeChineseToLocale(
                '该项目有以下执行中或暂停中生产任务和质检任务，结束项目后会同时结束这些生产任务和质检任务',
              )}
            </p>
            <SimpleTable
              columns={columns}
              dataSource={dataSource1}
              pagination={false}
              style={{ margin: '10px 0' }}
              scroll={{ y: 210, x: columns.length * 150 }}
            />
          </React.Fragment>
        )}
        {dataSource2.length > 0 && (
          <React.Fragment>
            <p>
              {changeChineseToLocale(
                '该项目有以下未开始生产任务和质检任务，结束项目后会同时结束这些生产任务和质检任务',
              )}
            </p>
            <SimpleTable
              columns={columns}
              dataSource={dataSource2}
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
                style={{ width: 500 }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

FinishProjectModal.contextTypes = {
  changeChineseToLocale: () => {},
};

export default FinishProjectModal;
