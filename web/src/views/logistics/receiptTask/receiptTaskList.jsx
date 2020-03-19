import React from 'react';
import {
  FilterSortSearchBar,
  Input,
  Button,
  withForm,
  Link,
  SimpleTable,
  DatePicker,
  Select,
} from 'components';
import { setLocation, getParams } from 'utils/url';
import SearchSelect from 'components/select/searchSelect';
import { getReceiveTaskList, getReceiptTaskStatus } from 'services/shipment/receiptTask';
import { format, formatToUnix, formatUnixMoment } from 'utils/time';
import { replaceSign } from 'constants';
import auth from 'utils/auth';

const RangePicker = DatePicker.RangePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;

const selectLabel = data => {
  return data.map(({ label }) => ({
    key: label,
    label,
  }));
};

class ReceiptTaskList extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
    taskStatus: [],
  };

  componentDidMount = async () => {
    this._isMounted = true;
    const { queryObj } = getParams();
    const { data: { data } } = await getReceiptTaskStatus();
    this.setState({ taskStatus: data });
    const { reservedTimeFrom, reservedTimeTill } = queryObj || {};
    const init = { page: 1, ...queryObj };
    this.props.form.setFieldsValue({
      ...init,
      time: reservedTimeFrom
        ? [formatUnixMoment(reservedTimeFrom), formatUnixMoment(reservedTimeTill)]
        : [],
    });
    this.setDataSource();
  };

  componentWillUnmount() {
    this._isMounted = false;
  }

  setDataSource = async _params => {
    const params = { page: 1, ...getParams().queryObj, ..._params };
    if (this._isMounted) {
      setLocation(this.props, params);
      this.setState({ loading: true });
      const { data: { data, total } } = await getReceiveTaskList({ size: 10, ...params });
      this.setState({
        dataSource: data,
        loading: false,
        total,
      });
    }
  };

  getColumns = () => {
    return [
      { title: '任务ID', dataIndex: 'id', key: 'id', width: 80, fixed: 'left' },
      { title: '负载号', dataIndex: 'no', key: 'no', width: 100 },
      {
        title: '系统票号',
        dataIndex: 'deliveringCode',
        width: 120,
        key: 'deliveringCode',
        render: text => text || replaceSign,
      },
      { title: '收货类型', dataIndex: 'categoryName', key: 'categoryName', width: 140 },
      { title: '任务状态', dataIndex: 'step.showName', width: 140, key: 'step.showName' },
      {
        title: '执行人',
        dataIndex: 'assignees',
        key: 'assignees',
        render: users => users.map(({ name }) => name).join('、') || replaceSign,
      },
      { title: '承运商', dataIndex: 'carrier', key: 'carrier' },
      { title: '车牌号', dataIndex: 'plateNo', key: 'plateNo' },
      { title: '司机', dataIndex: 'driver', key: 'driver' },
      { title: '司机手机', dataIndex: 'driverTelephone', key: 'driverTelephone', width: 100 },
      {
        title: '预约时间',
        dataIndex: 'reservedTime',
        render: time => (time ? format(time) : replaceSign),
        key: 'reservedTime',
        width: 140,
      },
      {
        title: '客户编号',
        dataIndex: 'customer.code',
        key: 'customerCode',
        width: 100,
        render: text => text || replaceSign,
      },
      {
        title: '客户名称',
        dataIndex: 'customer.name',
        key: 'customerName',
        width: 100,
        render: text => text || replaceSign,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'operation',
        width: 120,
        fixed: 'right',
        render: id => (
          <div className="child-gap">
            <Link to={`${location.pathname}/edit/${id}`} auth={auth.WEB_RECEIVE_TASK_EDIT}>
              编辑
            </Link>
            <Link to={`${location.pathname}/detail/${id}`}>详情</Link>
          </div>
        ),
      },
    ];
  };

  handlerSearch = () => {
    const { form: { getFieldsValue } } = this.props;
    const { time } = getFieldsValue();
    this.setDataSource({
      page: 1,
      ...getFieldsValue(),
      time: undefined,
      reservedTimeFrom: time && time[0] && formatToUnix(time[0]),
      reservedTimeTill: time && time[1] && formatToUnix(time[1]),
    });
  };

  render() {
    const { form: { getFieldDecorator, resetFields }, history: { push } } = this.props;
    const { dataSource, total, loading, taskStatus } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="负载号">{getFieldDecorator('searchNo')(<Input />)}</Item>
            <Item label="系统票号">
              {getFieldDecorator('searchDeliveringCode')(
                <Input placeholder="输入完整的系统票号" />,
              )}
            </Item>
            <Item label="任务状态">
              {getFieldDecorator('searchStep')(
                <Select allowClear>
                  {taskStatus.map(({ step, showName }) => <Option key={step}>{showName}</Option>)}
                </Select>,
              )}
            </Item>
            <Item label="车牌号">
              {getFieldDecorator('searchPlateNo')(
                <SearchSelect type="plateNumber" labelInValue={false} handleData={selectLabel} />,
              )}
            </Item>
            <Item label="预约时间">{getFieldDecorator('time')(<RangePicker />)}</Item>
            <Item label="执行人">
              {getFieldDecorator('searchOperatorId')(
                <SearchSelect type="user" labelInValue={false} />,
              )}
            </Item>
            <Item label="承运商">
              {getFieldDecorator('searchCarrier')(
                <SearchSelect type="carrier" labelInValue={false} handleData={selectLabel} />,
              )}
            </Item>
            <Item label="司机">
              {getFieldDecorator('searchDriver')(
                <SearchSelect type="driver" labelInValue={false} handleData={selectLabel} />,
              )}
            </Item>
          </ItemList>
          <div>
            <Button icon="search" onClick={this.handlerSearch}>
              查询
            </Button>
            <Link
              type="grey"
              style={{ marginLeft: 15 }}
              onClick={() => {
                resetFields();
                this.handlerSearch();
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        <div>
          <Button
            icon="plus-circle-o"
            style={{ marginLeft: 20, marginBottom: 20 }}
            onClick={() => push(`${location.pathname}/create`)}
          >
            收货任务
          </Button>
        </div>
        <SimpleTable
          loading={loading}
          columns={this.getColumns()}
          scroll={{ x: 1800 }}
          dataSource={dataSource}
          pagination={{
            total,
            onChange: page => {
              this.setDataSource({ page });
            },
          }}
        />
      </div>
    );
  }
}

export default withForm({}, ReceiptTaskList);
