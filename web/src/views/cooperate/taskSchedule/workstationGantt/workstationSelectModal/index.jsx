import React, { Component, Fragment } from 'react';
import { Table, Link, Button } from 'components';
import _ from 'lodash';
import { queryWorkstation, queryWorkstationItems } from 'src/services/workstation';
import Filter from './filter';

type props = {
  workstations: [],
  onOk: () => {},
  onCancel: () => {},
};

class WorkstationSelectModal extends Component<props> {
  state = {
    dataOptions: [],
    data: [],
  };
  componentDidMount() {
    this.setState({ data: this.props.workstations });
    this.fetchData();
  }

  fetchData = async params => {
    const {
      data: { data, count },
    } = await queryWorkstation({ size: 10, ...this.state.params, ...params, status: 1 });
    this.setState({
      dataOptions: data,
      dataOptionsTotal: count,
      dataOptionPagination: {
        current: (params && params.page) || 1,
        pageSize: (params && params.size) || 10,
        totl: count,
      },
    });
  };

  getColumns = type => {
    const columns = [
      {
        title: '工位名称',
        dataIndex: 'name',
        width: 200,
      },
      {
        title: '上级区域',
        dataIndex: 'parent',
      },
    ];
    if (type === 'option') {
      columns.push({
        title: '操作',
        key: 'action',
        width: 200,
        render: (_data, record) => {
          const { data } = this.state;
          const disabled = Array.isArray(data) && data.find(e => e.id === record.id);
          return (
            <Link
              disabled={disabled}
              onClick={() => {
                this.setState(({ data }) => {
                  const _data = _(data)
                    .concat(record)
                    .value();
                  return { data: _data };
                });
              }}
            >
              添加
            </Link>
          );
        },
      });
    } else if (type === 'data') {
      columns.push({
        title: '操作',
        key: 'action',
        width: 200,
        render: (_data, record) => {
          return (
            <Link
              onClick={() => {
                this.setState(({ data }) => {
                  const _data = _.cloneDeep(data);
                  _data.splice(data.findIndex(e => e.id === record.id), 1);
                  return { data: _data };
                });
              }}
            >
              删除
            </Link>
          );
        },
      });
    }
    return columns;
  };

  render() {
    const { onOk, onCancel } = this.props;
    const { dataOptions, dataOptionsTotal, dataOptionPagination, data } = this.state;
    const optionColumns = this.getColumns('option');
    const dataColumns = this.getColumns('data');
    return (
      <Fragment>
        <div>
          <Filter
            style={{ marginTop: -20 }}
            onFilter={params => {
              this.setState({ params });
              this.fetchData(params);
            }}
          />
          <div style={{ height: 350, overflowY: 'auto' }}>
            <Table
              total={dataOptionsTotal}
              pagination={{ ...dataOptionPagination, size: 'small' }}
              style={{ maxHeight: 246 }}
              scroll={{ y: 200 }}
              dataSource={dataOptions}
              columns={optionColumns}
              refetch={this.fetchData}
            />
            <div style={{ paddingLeft: 10, marginTop: 56, fontSize: 14 }}>
              已添加的工位<span style={{ color: 'rgba(0, 0, 0, 0.4)' }}>（可拖动调整显示顺序）</span>
            </div>
            <Table
              pagination={false}
              style={{ maxHeight: 246, marginTop: 10 }}
              scroll={{ y: 200 }}
              sortable
              onMoveRow={(dragIndex, hoverIndex) => {
                const _data = _.cloneDeep(data);
                const dragRow = _data.splice(dragIndex, 1);
                _data.splice(hoverIndex, 0, dragRow[0]);
                this.setState({ data: _data });
              }}
              dataSource={data}
              columns={dataColumns}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <Button style={{ width: 114, marginRight: 60 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button
            type="primary"
            style={{ width: 114 }}
            onClick={() => {
              onOk(data);
            }}
          >
            完成
          </Button>
        </div>
      </Fragment>
    );
  }
}
export default WorkstationSelectModal;
