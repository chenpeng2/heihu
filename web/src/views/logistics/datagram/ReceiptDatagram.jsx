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
import SearchSelect from 'components/select/searchSelect';
import { getReceiveMaterialDatagram } from 'services/datagram/logistics';
import { formatToUnix, format, formatUnixMoment } from 'utils/time';
import { replaceSign } from 'constants';
import { setLocation, getParams } from 'utils/url';
import { exportXlsxFile } from 'utils/exportFile';
import moment from 'moment';
import { round, thousandBitSeparator } from 'utils/number';
import Colors from 'styles/color';
import styles from './index.scss';

const ItemList = FilterSortSearchBar.ItemList;
const FormItem = FilterSortSearchBar.Item;
const RangerPicker = DatePicker.RangePicker;

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

class ReceiptDatagram extends React.PureComponent<any> {
  state = {
    dataSource: null,
    total: 0,
    searchParmas: {},
  };

  componentDidMount() {
    const { queryObj } = getParams();
    const { exitTimeFrom, exitTimeTill, carrier, ...rest } = queryObj;
    this.props.form.setFieldsValue({
      time: exitTimeFrom && [formatUnixMoment(exitTimeFrom), formatUnixMoment(exitTimeTill)],
      carrier: carrier && carrier.map(c => ({ label: c, key: c })),
      ...rest,
    });
    if (exitTimeFrom) {
      this.setDataSource({});
    }
  }

  setDataSource = async params => {
    const { page, size, ...rest } = setLocation(this.props, p => ({
      page: 1,
      size: 10,
      ...p,
      ...params,
    }));
    this.setState({ searchParams: rest });
    const { data: { data, total } } = await getReceiveMaterialDatagram(rest, { page, size });
    this.setState({ dataSource: data, total });
  };

  getColumns = () => {
    const formatArray = array =>
      array && array.length > 0 ? array.map(({ name }) => name).join('，') : replaceSign;
    const columns = [
      {
        title: '车辆离厂时间',
        dataIndex: 'exitTime',
        fixed: 'left',
        render: time => format(time, 'YYYY/MM/DD HH:mm'),
      },
      { title: '负载号', dataIndex: 'no', fixed: 'left' },
      { title: '系统票号', dataIndex: 'deliveringCode', fixed: 'left' },
      { title: '收货类型', dataIndex: 'categoryName' },
      { title: '承运商', dataIndex: 'carrier' },
      { title: '车牌号', dataIndex: 'plateNo' },
      { title: '司机', dataIndex: 'driver' },
      { title: '客户编号', dataIndex: 'customerCode' },
      { title: '客户名称', dataIndex: 'customerName' },
      {
        title: '保管员',
        dataIndex: 'warehouseManagers',
        render: manager => <Tooltip text={formatArray(manager)} length={12} />,
        getExport: formatArray,
      },
      {
        title: '叉车',
        dataIndex: 'forklifts',
        render: lifts => <Tooltip text={formatArray(lifts)} length={12} />,
        getExport: formatArray,
      },
      {
        title: '收货物料编号',
        dataIndex: 'materialCode',
      },
      { title: '收货物料名称', dataIndex: 'materialName' },
      {
        title: '收货物料库位',
        dataIndex: 'storages',
        render: storage => <Tooltip text={formatArray(storage)} length={12} />,
        getExport: formatArray,
      },
      { title: '物料单位', dataIndex: 'unit' },
      {
        title: '收货物料数量',
        dataIndex: 'amount',
        align: 'right',
        width: 90,
        render: amount =>
          amount || amount === 0 ? thousandBitSeparator(Math.round(amount)) : replaceSign,
      },
      {
        title: '扣减比例',
        dataIndex: 'faultRate',
        align: 'right',
        render: (faultRate, { type, sortingPlanId }) =>
          type === 0 && sortingPlanId > 0 ? `${round(faultRate * 100, 2)}%` : replaceSign,
      },
      {
        title: '扣减数量(瓶)',
        align: 'right',
        dataIndex: 'faultRate',
        render: (faultRate, { type, amount, sortingPlanId }) => {
          return type === 0 && sortingPlanId > 0
            ? `${thousandBitSeparator(Math.round(faultRate * amount))}`
            : replaceSign;
        },
      },
      {
        title: '实收数量(瓶)',
        align: 'right',
        dataIndex: 'faultRate',
        render: (faultRate, { type, amount, sortingPlanId }) =>
          type === 0 && sortingPlanId > 0
            ? `${thousandBitSeparator(Math.round((1 - faultRate) * amount, 10))}`
            : replaceSign,
      },
    ];
    return columns.map((column, index) => ({
      width: 160,
      render: title => (title ? <Tooltip text={title} length={12} /> : replaceSign),
      getExport: column.render ? column.render : title => title || replaceSign,
      ...column,
      key: column.title,
      className: index === columns.length - 1 ? styles.marginRight : '',
    }));
  };

  exportData = async () => {
    const headers = this.getColumns().map(({ title }) => title);
    const { data: { data } } = await getReceiveMaterialDatagram(this.state.searchParams, {
      page: 1,
      size: 10 ** 7,
    });
    const body = data.map(record => {
      return this.getColumns().map(({ dataIndex, render, getExport }) => {
        if (getExport) {
          return getExport(record[dataIndex], record);
        }
        return render ? render(record[dataIndex], record) : record[dataIndex];
      });
    });
    exportXlsxFile([headers, ...body], `收货物料统计${format(moment(), '_YYYY_MM_DD')}`);
  };

  render() {
    const { form: { getFieldDecorator, getFieldsValue, resetFields, validateFields } } = this.props;
    const { dataSource, total } = this.state;
    return (
      <div>
        <FilterSortSearchBar
          style={{ borderBottom: `1px solid ${Colors.border}`, marginBottom: 10 }}
        >
          <ItemList>
            <FormItem label="车辆离厂时间" required>
              {getFieldDecorator('time', {
                rules: [{ required: true, message: '车辆离厂时间必填' }],
              })(
                <RangerPicker
                  showTime={{
                    hideDisabledOptions: true,
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }}
                  format="YYYY-MM-DD HH"
                  disabledTime={(_, type) => ({
                    disabledMinutes: () => (type === 'start' ? range(1, 60) : range(0, 59)),
                    disabledSeconds: () => (type === 'start' ? range(1, 60) : range(0, 59)),
                  })}
                />,
              )}
            </FormItem>
            <FormItem label="负载号">{getFieldDecorator('no')(<Input />)}</FormItem>
            <FormItem label="系统票号">{getFieldDecorator('deliveringCode')(<Input />)}</FormItem>
            <FormItem label="承运商">
              {getFieldDecorator('carrier')(<SearchSelect type="carrier" mode="multiple" />)}
            </FormItem>
            <FormItem label="车牌号">{getFieldDecorator('plateNo')(<Input />)}</FormItem>
            <FormItem label="客户编号">{getFieldDecorator('customerCode')(<Input />)}</FormItem>
            <FormItem label="物料编号/名称">
              {getFieldDecorator('materialCode')(
                <SearchSelect type="materialBySearch" labelInValue={false} />,
              )}
            </FormItem>
          </ItemList>
          <div>
            <Button
              icon="search"
              onClick={() => {
                const { time, carrier, ...rest } = getFieldsValue();
                validateFields();
                if (!time || time.length === 0) {
                  message.error('请填写车辆离厂时间');
                  return;
                }
                if (Math.abs(time[0].diff(time[1], 'days')) > 31) {
                  message.error('时间间隔不能大于31天');
                  return;
                }
                const exitTimeFrom = time && formatToUnix(time[0].set({ second: 0, minute: 0 }));
                const exitTimeTill = time && formatToUnix(time[1].set({ second: 59, minute: 59 }));
                this.setDataSource({
                  exitTimeFrom,
                  exitTimeTill,
                  carrier: carrier && carrier.map(({ label }) => label),
                  page: 1,
                  ...rest,
                });
              }}
              style={{ marginRight: 10 }}
            >
              搜索
            </Button>
            <Link
              type="grey"
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
            {'  '}收货任务信息
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
              rowKey="id"
              dataSource={dataSource}
              columns={this.getColumns()}
              scroll={{ x: this.getColumns().length * 160 }}
              total={total}
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

export default withForm({}, ReceiptDatagram);
