import * as React from 'react';
import { FilterSortSearchBar, withForm, SimpleTable, Select, Button, DatePicker, Link } from 'components';
import { setLocation } from 'utils/url';
import { formatToUnix, formatUnix, formatUnixMoment } from 'utils/time';
import SearchSelect from 'components/select/searchSelect';
import { getMouldLog } from 'services/equipmentMaintenance/mould';

const { ItemList, Item } = FilterSortSearchBar;
const { Option } = Select;
const { RangePicker } = DatePicker;
const EquipmentLogType = {
  add: '添加',
  start: '启用',
  stop: '停用',
  scrap: '报废',
  modify: '信息变更',
  task: '任务',
  taskWarn: '任务提醒',
  clean: '清理',
  dirty: '变为未清理',
};

type propsType = {
  form: any,
  match: {
    params: {
      id: string,
      type: 'module' | 'device',
    },
  },
};

class DeviceLog extends React.Component<propsType> {
  state = {
    total: 0,
    loading: false,
  };

  componentDidMount() {
    this.setDataSource();
  }

  setDataSource = async params => {
    this.setState({ loading: true });
    const { match: { params: { id } }, form: { setFieldsValue } } = this.props;
    const _params = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    setFieldsValue({
      ..._params,
      time: [
        _params.createdAtFrom && formatUnixMoment(_params.createdAtFrom),
        _params.createdAtFrom && formatUnixMoment(_params.createdAtTill),
      ],
    });
    const { data: { data, total } } = await getMouldLog(id, _params);
    this.setState({ dataSource: data, total });
    this.setState({ loading: false });
  };

  render() {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { dataSource, total, loading } = this.state;
    const columns = [
      { title: '时间', dataIndex: 'createdAt', key: 'createdAt', render: time => formatUnix(time) },
      { title: '日志类型', dataIndex: 'logTypeDisplay', key: 'logTypeDisplay' },
      { title: '操作人', dataIndex: 'operator.name', key: 'operator' },
      { title: '描述', dataIndex: 'description', key: 'description' },
      {
        title: '详情',
        key: 'detail',
        render: (_, record) => {
          const { taskSnapshot } = record;
          let taskType = '';
          let taskCode = '';
          console.log(record);
          if (taskSnapshot) {
            const { taskCategory } = taskSnapshot;
            taskCode = taskSnapshot.taskCode;
            taskType = taskSnapshot.taskCategory === 'maintain' ? 'maintenanceTask' : `${taskSnapshot.taskCategory}Task`;
          }
          return (
            <div>
              {taskSnapshot ?
                <Link to={`/equipmentMaintenance/${taskType}/detail/${taskCode}`}>查看</Link>
              : null}
            </div>
          );
        },
      },
    ];
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="日志类型">
              {getFieldDecorator('searchLogType')(
                <Select allowClear>
                  {Object.keys(EquipmentLogType).map(key => (
                    <Option value={key}>{EquipmentLogType[key]}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="操作人">
              {getFieldDecorator('searchOperatorId')(
                <SearchSelect type="account" labelInValue={false} />,
              )}
            </Item>
            <Item label="时间范围">
              {getFieldDecorator('time')(<RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />)}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              const params = {};
              const { time } = getFieldsValue();
              if (time) {
                params.createdAtFrom = time[0] && formatToUnix(time[0]);
                params.createdAtTill = time[1] && formatToUnix(time[1]);
              }
              this.setDataSource({ ...getFieldsValue(), ...params, time: undefined, page: 1 });
            }}
          >
            查询
          </Button>
        </FilterSortSearchBar>
        <div>
          <SimpleTable
            columns={columns}
            rowKey="id"
            dataSource={dataSource}
            pagination={{
              total,
              onChange: page => this.setDataSource({ page }),
            }}
            loading={loading}
          />
        </div>
      </div>
    );
  }
}

export default withForm({}, DeviceLog);
