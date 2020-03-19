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
  Tooltip,
} from 'components';
import { getSendTaskList, getSendTaskStatus } from 'services/shipment/sendTask';
import SearchSelect from 'components/select/searchSelect';
import { getParams, setLocation } from 'utils/url';
import { format, formatUnixMoment, formatRangeUnix } from 'utils/time';
import { replaceSign } from 'constants';
import auth from 'utils/auth';
import ImportSendTask from './ImportSendTask';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;

const selectLabel = data => {
  return data.map(({ label }) => ({
    key: label,
    label,
  }));
};

class SendTaskList extends React.PureComponent<any> {
  state = {
    dataSource: [],
    total: 0,
    loading: false,
    taskStatus: [],
    showImportModal: false,
  };

  componentDidMount = async () => {
    this._isMounted = true;
    const { data: { data } } = await getSendTaskStatus();
    this.setState({ taskStatus: data });
    const { queryObj } = getParams();
    const { reservedTimeFrom, reservedTimeTill } = queryObj || {};
    const init = { page: 1, ...queryObj };
    this.props.form.setFieldsValue({
      ...init,
      time: reservedTimeFrom ? [formatUnixMoment(reservedTimeFrom), formatUnixMoment(reservedTimeTill)] : [],
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
      const { data: { data, total } } = await getSendTaskList({ size: 10, ...params });
      this.setState({
        dataSource: data,
        total,
        loading: false,
      });
    }
  };

  getColumns = () => {
    return [
      { title: '任务ID', dataIndex: 'id', key: 'id', width: 100, fixed: 'left' },
      { title: '负载号', dataIndex: 'no', key: 'no' },
      { title: '交货单号', dataIndex: 'deliveringCode', key: 'deliveringCode' },
      { title: '发运类型', dataIndex: 'categoryName', key: 'category' },
      { title: '任务状态', dataIndex: 'step.showName', key: 'status' },
      {
        title: '执行人',
        dataIndex: 'assignees',
        key: 'assignees',
        render: users => users.map(({ name }) => name).join('、') || replaceSign,
      },
      {
        title: '承运商',
        dataIndex: 'carrier',
        key: 'carrier',
        width: 170,
      },
      {
        title: '车牌号',
        dataIndex: 'plateNo',
        key: 'plateNo',
      },
      { title: '司机', dataIndex: 'driver', key: 'driver', render: text => text || replaceSign },
      {
        title: '司机手机',
        dataIndex: 'driverTelephone',
        key: 'driverTelephone',
        render: text => text || replaceSign,
        width: 100,
      },
      {
        title: '预约时间',
        dataIndex: 'reservedTime',
        key: 'reservedTime',
        render: time => format(time),
      },
      {
        title: '销售订单',
        dataIndex: 'purchaseCode',
        key: 'purchaseCode',
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
            <Link to={`${location.pathname}/edit/${id}`} auth={auth.WEB_SHIPPING_TASK_EDIT}>
              编辑
            </Link>
            <Link to={`${location.pathname}/detail/${id}`}>详情</Link>
          </div>
        ),
      },
    ].map(node => ({
      width: 150,
      render: text => <Tooltip text={text || replaceSign} length={10} />,
      ...node,
    }));
  };

  handlerSearch = () => {
    const { form: { getFieldsValue } } = this.props;
    const { time } = getFieldsValue();
    this.setDataSource({
      page: 1,
      ...getFieldsValue(),
      time: undefined,
      reservedTimeFrom: time && time[0] && formatRangeUnix(time)[0],
      reservedTimeTill: time && time[1] && formatRangeUnix(time)[1],
    });
  };

  render() {
    const { form: { getFieldDecorator, resetFields }, history: { push } } = this.props;
    const { dataSource, total, loading, taskStatus, showImportModal } = this.state;
    return (
      <div>
        <FilterSortSearchBar searchDisabled>
          <ItemList>
            <Item label="负载号">{getFieldDecorator('searchNo')(<Input />)}</Item>
            <Item label="车牌号">
              {getFieldDecorator('searchPlateNo')(
                <SearchSelect type="plateNumber" labelInValue={false} handleData={selectLabel} />,
              )}
            </Item>
            <Item label="执行人">
              {getFieldDecorator('searchOperatorId')(<SearchSelect type="user" labelInValue={false} />)}
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
            <Item label="司机手机">{getFieldDecorator('searchDriverTelephone')(<Input />)}</Item>
            <Item label="交货单号">{getFieldDecorator('searchDeliveringCode')(<Input />)}</Item>
            <Item label="预约时间">{getFieldDecorator('time')(<RangePicker />)}</Item>
            <Item label="销售订单">{getFieldDecorator('searchPurchaseCode')(<Input />)}</Item>
            <Item label="任务状态">
              {getFieldDecorator('searchStep')(
                <Select allowClear>
                  {taskStatus.map(({ step, showName }) => <Option key={step}>{showName}</Option>)}
                </Select>,
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
        <div className="child-gap">
          <Button
            icon="plus-circle-o"
            style={{ marginLeft: 20, marginBottom: 20 }}
            onClick={() => push(`${location.pathname}/create`)}
          >
            发运任务
          </Button>
          <Button
            icon="download"
            ghost
            onClick={() => {
              this.setState({ showImportModal: true });
            }}
          >
            导入
          </Button>
          <Link icon="eye" to="/logistics/send-task/import-list">
            查看导入日志
          </Link>
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
        <ImportSendTask
          visible={showImportModal}
          toggleVisible={showImportModal => {
            this.setState({ showImportModal });
          }}
        />
      </div>
    );
  }
}

export default withForm({}, SendTaskList);
