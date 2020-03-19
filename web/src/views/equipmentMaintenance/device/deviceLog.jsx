import * as React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  Input,
  SimpleTable,
  Select,
  Button,
  DatePicker,
  Link,
  Tooltip,
} from 'components';
import { setLocation } from 'utils/url';
import { formatToUnix, formatUnix, formatUnixMoment } from 'utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import SearchSelect from 'components/select/searchSelect';
import { replaceSign } from 'src/constants';
import { getDeviceLog, getModuleLog } from 'services/equipmentMaintenance/device';

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
};

type propsType = {
  form: any,
  intl: any,
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
    const {
      match: {
        params: { id, type },
      },
      form: { setFieldsValue },
    } = this.props;
    const _params = setLocation(this.props, p => ({ page: 1, size: 10, ...p, ...params }));
    setFieldsValue({
      ..._params,
      time: [
        _params.createdAtFrom && formatUnixMoment(_params.createdAtFrom),
        _params.createdAtFrom && formatUnixMoment(_params.createdAtTill),
      ],
    });
    const {
      data: { data, total },
    } = type === 'module' ? await getModuleLog(id, _params) : await getDeviceLog(id, _params);
    this.setState({ dataSource: data, total });
    this.setState({ loading: false });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldsValue },
      match: {
        params: { type },
      },
      intl,
    } = this.props;
    const { dataSource, total, loading } = this.state;
    const columns = [
      { title: '时间', dataIndex: 'createdAt', width: 200, key: 'createdAt', render: time => formatUnix(time) },
      { title: '日志类型', dataIndex: 'logTypeDisplay', width: 200, key: 'logTypeDisplay' },
      { title: '操作人', dataIndex: 'operator.name', width: 150, key: 'operator' },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        render: data => <Tooltip text={data || replaceSign} length={40} />,
      },
      {
        title: '详情',
        key: 'detail',
        width: 100,
        render: (_, record) => {
          const { taskSnapshot } = record;
          let taskType = '';
          let taskCode = '';
          if (taskSnapshot) {
            const { taskCategory } = taskSnapshot;
            taskCode = taskSnapshot.taskCode;
            taskType =
              taskSnapshot.taskCategory === 'maintain' ? 'maintenanceTask' : `${taskSnapshot.taskCategory}Task`;
          }
          return (
            <div>
              {taskSnapshot ? <Link to={`/equipmentMaintenance/${taskType}/detail/${taskCode}`}>查看</Link> : null}
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
                    <Option value={key}>{changeChineseToLocale(EquipmentLogType[key], intl)}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="操作人">
              {getFieldDecorator('searchOperatorId')(<SearchSelect type="account" labelInValue={false} />)}
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

export default withForm({}, injectIntl(DeviceLog));
