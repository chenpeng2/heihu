import React from 'react';
import _ from 'lodash';
import RelationWorkerFormItem from '../common/RelationWorkerFormItem';
import { Button, Link, SimpleTable } from '../../../../components';
import { StationDefine } from './workstationBaseForm';
import { replaceSign } from '../../../../constants';

class RelationWorkerInDetail extends React.PureComponent {
  state = {};

  render() {
    const { inEdit, workers } = this.state;
    const { form: { resetFields } } = this.props;
    if (inEdit) {
      return (
        <div>
          <RelationWorkerFormItem form={this.props.form} />
          <div className="child-gap">
            <Button
              type="default"
              onClick={() => {
                resetFields();
                this.setInitDataSource();
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

export default RelationWorkerInDetail;
