import React, { Component } from 'react';
import Proptypes from 'prop-types';
import _ from 'lodash';
import moment, { formatTodayUnderline } from 'utils/time';
import Colors from 'src/styles/color';
import { withRouter } from 'react-router-dom';
import { setLocation } from 'utils/url';
import { thousandBitSeparator } from 'utils/number';
import { getQuery } from 'src/routes/getRouteParams';
import withForm, { trimWholeValue } from 'components/form';
import { white, fontSub, borderGrey } from 'src/styles/color/index';
import { queryPurchaseOrderSummary } from 'src/services/datagram/purchaseOrderSummary';
import {
  FilterSortSearchBar,
  Searchselect,
  Select,
  Input,
  DatePicker,
  Icon,
  Button,
  Tooltip,
  Link,
  Badge,
} from 'components';
import { exportXlsxFile } from '../../../utils/exportFile';
import { replaceSign } from '../../../constants';
import styles from './styles.scss';

const MyBadge = Badge.MyBadge;
const { RangePicker } = DatePicker;
const { Option } = Select;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;

const resetButton = {
  float: 'right',
  width: 60,
  color: fontSub,
  height: 28,
  lineHeight: '28px',
  textAlign: 'center',
  cursor: 'pointer',
};

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
    resetFields: () => {},
    setFieldsValue: () => {},
  },
  children: any,
  match: {
    location: {},
  },
};

const getFormatDate = timestamp => {
  if (!timestamp) {
    return '';
  }
  return moment(Number(timestamp)).format('YYYY/MM/DD');
};

const getFormatAmount = amount => {
  const inDecimal = Math.round(amount) !== amount ? amount.toFixed(3) : amount;
  return thousandBitSeparator(inDecimal);
};

class FilterForPurchaseOrderSummary extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
    orderBy: 'purchaseOrderCode',
    order: 0,
  };

  componentDidMount() {
    this.setInitialData();
    this.fetchData();
  }

  setInitialData = () => {
    const query = getQuery(this.props.match);
    const { duration } = query;
    if (Array.isArray(duration)) {
      duration[0] = moment(duration[0]);
      duration[1] = moment(duration[1]);
    }
    this.props.form.setFieldsValue({ ...query });
  };

  getVariables = (params, query) => {
    const { match } = this.props;
    const _query = query || this.getFormatParams(getQuery(match));
    const _params = this.getFormatParams(params);
    const variables = Object.assign({}, { ..._query, ..._params });
    Object.keys(variables).forEach(key => {
      if (variables[key] === null || variables[key] === 'null') {
        delete variables[key];
      }
    });
    return variables;
  };

  fetchData = async params => {
    this.setState({ loading: true });
    setLocation(this.props, p => {
      return { ...p, ...params };
    });
    const { match } = this.props;
    const query = getQuery(match);
    const variables = this.getFormatParams({ ...query, ...params });
    await queryPurchaseOrderSummary(variables)
      .then(({ data: { data, total } }) => {
        this.setState({
          data,
          loading: false,
          pagination: {
            total,
            current: variables.page,
          },
          orderBy: variables.orderBy,
          order: variables.order,
          delayed: variables.delayed,
        });
      })
      .catch(err => console.error(err));
  };

  getFormatParams = value => {
    const params = {};
    Object.keys(value).forEach(prop => {
      if (value[prop]) {
        switch (prop) {
          case 'materialCodes':
            params[prop] = value[prop].map(x => x.key);
            break;
          case 'purchaseOrderCodes':
            params[prop] = value[prop].map(x => x.key);
            break;
          case 'materialNames':
            params[prop] = value[prop].map(x => x.key);
            break;
          case 'duration':
            if (value.duration.length > 0) {
              params.timeFrom = String(Date.parse(value.duration[0]));
              params.timeTill = String(Date.parse(value.duration[1]));
            }
            break;
          default:
            params[prop] = value[prop];
        }
      }
    });
    return Object.assign({}, params, { delayed: value.delayed }, { order: value.order });
  };

  onSearch = () => {
    const value = this.props.form.getFieldsValue();
    this.fetchData({
      ...value,
      size: 10,
      page: 1,
      orderBy: 'purchaseOrderCode',
      order: 0,
    });
  };

  renderButton = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <div>
        <Button style={{ width: 130 }} onClick={this.onSearch}>
          <Icon type={'search'} />
          {changeChineseToLocale('查询')}
        </Button>
        <span style={{ ...resetButton }} onClick={this.onReset}>
          {changeChineseToLocale('重置')}
        </span>
      </div>
    );
  };

  getSortOrder = dataIndex => {
    return this.state.orderBy !== dataIndex ? null : this.state.order === 1 ? 'descend' : 'ascend';
  };

  getColumns = () => {
    return [
      {
        title: '订单号',
        type: 'purchaseOrderCode',
        dataIndex: 'purchaseOrderCode',
        key: 'purchaseOrderCode',
        render: purchaseOrderCode => purchaseOrderCode || replaceSign,
        sorter: true,
        sortOrder: this.getSortOrder('purchaseOrderCode'),
      },
      {
        title: '物料编号/物料名称',
        dataIndex: 'materialCode',
        type: 'materialCode',
        key: 'materialCode',
        render: (materialCode, record) => {
          const { materialName } = record;
          return (
            <Link onClick={() => window.open(`/bom/materials/${encodeURIComponent(materialCode)}/detail`, '_blank')}>
              <Tooltip text={`${materialCode || replaceSign}/${materialName || replaceSign}`} length={26} />
            </Link>
          );
        },
        sorter: true,
        sortOrder: this.getSortOrder('materialCode'),
      },
      // {
      //   title: '物料名称',
      //   dataIndex: 'materialName',
      //   type: 'materialName',
      //   key: 'materialName',
      //   render: (materialName, record) => (
      //     <div>
      //       <Tooltip text={materialName || replaceSign} length={23} />
      //     </div>
      //   ),
      //   sorter: true,
      //   sortOrder: this.getSortOrder('materialName'),
      // },
      {
        title: '单位',
        type: 'materialUnit',
        dataIndex: 'materialUnit',
        key: 'materialUnit',
        render: (materialUnit, record) => (
          <div>
            <Tooltip text={materialUnit || replaceSign} length={6} />
          </div>
        ),
      },
      {
        title: '订单需求量',
        type: 'amountNeeded',
        dataIndex: 'amountNeeded',
        key: 'amountNeeded',
        className: 'column-numeric',
        render: (amount, record) => {
          return (
            <div key={`amountNeeded-${record.id}`} style={{ justifyContent: 'flex-end' }}>
              {getFormatAmount(amount)}
            </div>
          );
        },
      },
      {
        title: '已交货数量',
        type: 'amountDelivered',
        dataIndex: 'amountDelivered',
        key: 'amountDelivered',
        className: 'column-numeric',
        render: (amount, record) => {
          return <div key={`amountDelivered-${record.id}`}>{getFormatAmount(amount)}</div>;
        },
      },
      {
        title: '还需交货数量',
        type: 'amountRemaining',
        dataIndex: 'amountRemaining',
        key: 'amountRemaining',
        className: 'column-numeric',
        render: (amount, record) => {
          return <div key={`amountRemaining-${record.id}`}>{getFormatAmount(amount)}</div>;
        },
      },
      {
        title: '订单交货日期',
        dataIndex: 'targetDate',
        type: 'targetDate',
        key: 'targetDate',
        render: (targetDate, record) => {
          return <span key={`date-${record.id}`}>{getFormatDate(targetDate)}</span>;
        },
        sorter: true,
        sortOrder: this.getSortOrder('targetDate'),
      },
      {
        title: '订单延期交货',
        type: 'delayed',
        dataIndex: 'delayed',
        key: 'delayed',
        render: (delayed, record) => (
          <MyBadge text={delayed ? '延期' : '未延期'} color={delayed ? Colors.errorRed : Colors.blacklakeGreen} />
        ),
      },
      {
        title: '在库待交货物料',
        type: 'link',
        dataIndex: 'link',
        key: 'link',
        render: (_, record) => {
          const { materialCode, materialName, purchaseOrderCode } = record;
          const purchaseOrder = { key: purchaseOrderCode, label: purchaseOrderCode };
          const material = {
            key: materialCode,
            label: `${materialCode || replaceSign}/${materialName || replaceSign}`,
          };

          const nextQuery = {
            purchaseOrderCode,
            materialCode,
          };
          const nextFilter = {
            material,
            purchaseOrder,
          };

          return (
            <Link.NewTagLink href={`/stock/qrCode?query=${JSON.stringify({ query: nextQuery, filter: nextFilter })}`}>
              查看
            </Link.NewTagLink>
          );
        },
      },
    ];
  };

  handleTableChange = (pagination, filters, sorter) => {
    this.fetchData({
      orderBy: sorter.field,
      order: {
        ascend: 0,
        descend: 1,
      }[sorter.order],
      page: pagination.current,
      delayed: this.state.delayed,
    });
    this.setState({
      orderBy: sorter.field,
      order: {
        ascend: 0,
        descend: 1,
      }[sorter.order],
    });
  };

  onReset = () => {
    location.query = {};
    setLocation(this.props, p => ({}));
    this.props.form.resetFields();
    this.fetchData(
      {
        page: 1,
        size: 10,
        orderBy: 'purchaseOrderCode',
        order: 0,
      },
      {},
    );
  };

  onClickExport = async () => {
    const {
      data: { data },
    } = await queryPurchaseOrderSummary({
      size: 300,
      page: 1,
      orderBy: this.state.orderBy,
      order: this.state.order,
      delayed: this.state.delayed,
    });
    const titles = [
      '订单号',
      '物料编号',
      '物料名称',
      '单位',
      '订单交货日期',
      '订单延期交货',
      '订单需求量',
      '已交货数量',
      '还需交货数量',
    ];
    const dataForExport = [
      titles,
      ...data.map(x => [
        x.purchaseOrderCode,
        x.materialCode,
        x.materialName,
        x.materialUnit,
        getFormatDate(x.targetDate),
        x.delayed,
        x.amountNeeded,
        x.amountDelivered,
        x.amountRemaining,
      ]),
    ];
    exportXlsxFile(dataForExport, `订单交货数据_${formatTodayUnderline()}.xlsx`);
  };

  render() {
    const { form, children } = this.props;
    const { changeChineseToLocale } = this.context;
    const { data, loading, pagination } = this.state;
    const { getFieldDecorator } = form;
    const _children = React.cloneElement(children, {
      data,
      loading,
      refetch: this.fetchData,
      onClickExport: this.onClickExport,
      columns: this.getColumns(),
      onChange: this.handleTableChange,
      pagination,
    });
    const isDelayedOptions = [
      {
        key: 'null',
        label: '全部',
      },
      {
        key: 1,
        label: '延期',
      },
      {
        key: 0,
        label: '未延期',
      },
    ];
    return (
      <div className={styles.reportsList}>
        <FilterSortSearchBar
          style={{
            backgroundColor: white,
            width: '100%',
            borderBottom: `1px solid ${borderGrey}`,
          }}
          searchDisabled
        >
          <ItemList>
            <Item label="订单号">
              {getFieldDecorator('purchaseOrderCodes', {
                normalize: trimWholeValue,
              })(<Searchselect placeholder="请输入订单号" type="purchaseOrder" mode={'multiple'} />)}
            </Item>
            <Item label="订单交货日期">{getFieldDecorator('duration')(<RangePicker />)}</Item>
            <Item label="订单延期出厂">
              {getFieldDecorator('delayed', {
                initialValue: 'null',
              })(
                <Select>
                  {isDelayedOptions.map(({ label, key }) => (
                    <Option value={key}>{changeChineseToLocale(label)}</Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="物料">
              {getFieldDecorator('materialSearch', {
                normalize: trimWholeValue,
              })(<Input allowClear placeholder="请输入关键字" />)}
            </Item>
          </ItemList>
          {this.renderButton()}
        </FilterSortSearchBar>
        {_children}
      </div>
    );
  }
}

FilterForPurchaseOrderSummary.contextTypes = {
  changeChineseToLocale: Proptypes.func,
};

export default withForm({}, withRouter(FilterForPurchaseOrderSummary));
