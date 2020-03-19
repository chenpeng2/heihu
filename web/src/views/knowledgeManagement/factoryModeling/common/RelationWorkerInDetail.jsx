import React from 'react';
import { Button, Link, message, SimpleTable, withForm } from 'components';
import _ from 'lodash';
import { replaceSign } from 'constants';
import RelationWorkerFormItem from './RelationWorkerFormItem';
import { StationDefine } from '../workstation/workstationBaseForm';

class RelationWorkerInDetail extends React.PureComponent {
  state = {
    inEdit: false,
    dataSource: [],
  };

  setInitDataSource = detail => {
    const data = detail || this.state.data;
    if (Array.isArray(data.workers) && data.workers.length > 0) {
      this.setState({ dataSource: data.workers.map((node, index) => ({ key: index })) });
    }
  };

  setFormInit = () => {
    const { form: { setFieldsValue } } = this.props;
    const { workers } = this.props;
    this.setState({ inEdit: true }, () => {
      setFieldsValue({
        workerKeys: workers ? workers.map((node, index) => ({ key: index })) : [],
      });
      setTimeout(() => {
        setFieldsValue({
          workers: workers && workers.map(({ job, id, name }) => ({ job, id: { key: id, label: name } })),
        });
      });
    });
  };

  handleEditWorkers = () => {
    const { id, form: { validateFields }, submitApi, refetch } = this.props;
    validateFields(async (err, values) => {
      if (!err) {
        const { workers } = values;
        await submitApi(id, workers ? workers.filter(n => n).map(({ job, id: { key } }) => ({ job, id: key })) : []);
        message.success('修改成功！');
        this.setState({ inEdit: false });
        refetch();
      }
    });
  };

  render() {
    const { workers } = this.props;
    const { inEdit } = this.state;
    const { form: { resetFields } } = this.props;
    if (inEdit) {
      return (
        <div>
          <RelationWorkerFormItem form={this.props.form} />
          <div className="child-gap" style={{ marginTop: 20 }}>
            <Button
              type="default"
              onClick={() => {
                resetFields();
                this.setState({ inEdit: false });
              }}
            >
              取消
            </Button>
            <Button onClick={this.handleEditWorkers}>确定</Button>
          </div>
        </div>
      );
    }
    return _.get(workers, 'length', 0) > 0 ? (
      <div>
        <SimpleTable
          pagination={false}
          scroll={{ y: 310 }}
          style={{ margin: 0, marginBottom: 10 }}
          columns={[
            { title: '编号', key: 'NO', render: (text, record, index) => index + 1 },
            {
              title: '岗位',
              key: 'job',
              dataIndex: 'job',
              render: job => StationDefine[job],
            },
            { title: '员工姓名', dataIndex: 'name', key: 'name', width: 150 },
          ]}
          rowKey={({ id, job }) => `${id}/${job}`}
          dataSource={workers}
        />
        <Button onClick={this.setFormInit}>编辑</Button>
      </div>
    ) : (
      <div className="child-gap">
        <span>{replaceSign}</span>
        <Link onClick={this.setFormInit}>编辑</Link>
      </div>
    );
  }
}

export default withForm({}, RelationWorkerInDetail);
