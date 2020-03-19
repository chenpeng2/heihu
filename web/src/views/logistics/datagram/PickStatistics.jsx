import React from 'react';
import {
  FilterSortSearchBar,
  withForm,
  DatePicker,
  Input,
  SimpleTable,
  Button,
  Link,
  message,
  Icon,
  Tooltip,
} from 'components';
import { getSortingStatisticsDatagram } from 'services/datagram/logistics';
import { format, formatUnixMoment, formatRangeUnix } from 'utils/time';
import { replaceSign } from 'constants';
import { setLocation, getParams } from 'utils/url';
import { exportXlsxFile } from 'utils/exportFile';
import { round, thousandBitSeparator } from 'utils/number';
import { queryQcItemsList } from 'services/knowledgeBase/qcItems';
import moment from 'moment';
import Color from 'styles/color';
import styles from './index.scss';

const ItemList = FilterSortSearchBar.ItemList;
const FormItem = FilterSortSearchBar.Item;
const RangerPicker = DatePicker.RangePicker;

class PickStatistics extends React.PureComponent<any> {
  state = {
    columns: [],
    dataSource: null,
    total: 0,
    searchParams: {},
  };

  componentDidMount() {
    const { queryObj } = getParams();
    const { timeFrom, timeTill, ...rest } = queryObj;
    this.props.form.setFieldsValue({
      time: timeFrom && [formatUnixMoment(timeFrom), formatUnixMoment(timeTill)],
      ...rest,
    });
    this.setColumns();
    if (timeFrom) {
      this.setDataSource({});
    }
  }

  setColumns = async () => {
    const leftCol = [
      {
        title: '分捡开始时间',
        dataIndex: 'startTime',
        fixed: 'left',
        render: time => format(time, 'YYYY/MM/DD HH:mm'),
      },
      {
        title: '分捡结束时间',
        dataIndex: 'endTime',
        fixed: 'left',
        render: time => format(time, 'YYYY/MM/DD HH:mm'),
      },
      { title: '车牌号', dataIndex: 'plateNumber', fixed: 'left' },
      { title: '收货任务类型', dataIndex: 'ioCategoryName' },
      { title: '负载号', dataIndex: 'receiveNumber' },
      { title: '系统票号', dataIndex: 'deliveringCode' },
      { title: '客户编号', dataIndex: 'customerCode' },
      { title: '分捡物料编号', dataIndex: 'materialCode' },
      { title: '分捡物料名称', dataIndex: 'materialName' },
      {
        title: '分捡抽样瓶数',
        dataIndex: 'checkAmount',
        align: 'right',
        render: amount => (amount || amount === 0 ? thousandBitSeparator(Math.round(amount)) : replaceSign),
      },
      {
        title: '不合格瓶数',
        dataIndex: 'defectAmount',
        align: 'right',
        render: amount => (amount || amount === 0 ? thousandBitSeparator(Math.round(amount)) : replaceSign),
      },
      {
        title: '不合格瓶比例',
        dataIndex: 'faultRate',
        align: 'right',
        render: rate => (rate || rate === 0 ? `${round(rate * 100, 2)} %` : replaceSign),
      },
    ];
    const { data: { data } } = await queryQcItemsList({ page: 1, size: 1000 });
    const rightCol = data.map(({ id, name }) => ({
      title: name,
      dataIndex: `checkItem-${id}`,
      align: 'right',
    }));
    const columns = [...leftCol, ...rightCol, { title: '备注', dataIndex: 'desc' }];
    this.setState({
      columns: columns.map((col, index) => ({
        render: title => (title || title === 0 ? <Tooltip text={title} length={12} /> : replaceSign),
        width: 150,
        ...col,
        key: col.title,
        className: index === columns.length - 1 ? styles.marginRight : '',
        getExport: col.render ? col.render : title => (title || title === 0 ? title : replaceSign),
      })),
    });
  };

  setDataSource = async params => {
    const _params = setLocation(this.props, p => ({
      page: 1,
      size: 10,
      ...p,
      ...params,
    }));
    const { data: { data, total } } = await getSortingStatisticsDatagram(_params);
    this.setState({
      total,
      dataSource: this.revertToDataSource(data),
      searchParams: _params,
    });
  };

  revertToDataSource = data =>
    data.map(r => {
      const record = {};
      r.items.forEach(({ checkItemId, checkItemDefect }) => {
        record[`checkItem-${checkItemId}`] = checkItemDefect;
      });
      return { ...r, ...record };
    });

  exportData = async () => {
    const headers = this.state.columns.map(({ title }) => title);
    const { data: { data } } = await getSortingStatisticsDatagram({
      ...this.state.searchParams,
      page: 1,
      size: 10 ** 7,
    });
    const body = this.revertToDataSource(data).map(record => {
      return this.state.columns.map(({ dataIndex, render, getExport }) => {
        if (getExport) {
          return getExport(record[dataIndex], record);
        }
        return render ? render(record[dataIndex], record) : record[dataIndex];
      });
    });
    exportXlsxFile([headers, ...body], `分捡统计${format(moment(), '_YYYY_MM_DD')}`);
  };

  render() {
    const { form: { getFieldDecorator, getFieldsValue, resetFields } } = this.props;
    const { columns, dataSource, total } = this.state;
    return (
      <div>
        <FilterSortSearchBar style={{ borderBottom: `1px solid ${Color.border}`, marginBottom: 10 }}>
          <ItemList>
            <FormItem label="车辆离厂时间" required>
              {getFieldDecorator('time')(<RangerPicker />)}
            </FormItem>
            <FormItem label="车牌号">{getFieldDecorator('plateNumber')(<Input />)}</FormItem>
            <FormItem label="负载号">{getFieldDecorator('receiveNumber')(<Input />)}</FormItem>
            <FormItem label="系统票号">{getFieldDecorator('deliveringCode')(<Input />)}</FormItem>
            <FormItem label="分拣物料编号">{getFieldDecorator('materialCode')(<Input />)}</FormItem>
            <FormItem label="客户编号">{getFieldDecorator('customerCode')(<Input />)}</FormItem>
          </ItemList>
          <div>
            <Button
              onClick={() => {
                const { time, ...rest } = getFieldsValue();
                if (!time || time.length === 0) {
                  message.error('请填写车辆离厂时间');
                  return;
                }
                if (Math.abs(time[0].diff(time[1], 'days')) > 31) {
                  message.error('时间间隔不能大于31天');
                  return;
                }
                this.setDataSource({
                  timeFrom: formatRangeUnix(time)[0],
                  timeTill: formatRangeUnix(time)[1],
                  ...rest,
                });
              }}
              style={{ marginRight: 10 }}
            >
              确定
            </Button>
            <Link
              onClick={() => {
                resetFields();
                setLocation(this.props, {});
                this.setState({ dataSource: null });
              }}
            >
              重置
            </Link>
          </div>
        </FilterSortSearchBar>
        <div
          style={{
            margin: '0px 20px 20px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>
            <Icon type="bars" />
            {'  '}分拣任务信息
          </span>
          <Button
            icon="upload"
            onClick={() => {
              this.exportData();
            }}
            disabled={!(dataSource && dataSource.length)}
          >
            数据导出
          </Button>
        </div>
        <div>
          {dataSource && (
            <SimpleTable
              rowKey={({ receiveTaskId, startTime }) => `${receiveTaskId}/${startTime}`}
              columns={columns}
              scroll={{ x: columns.length * 150 }}
              dataSource={dataSource}
              pagination={{
                total,
                onChange: page => this.setDataSource({ page }),
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withForm({}, PickStatistics);
