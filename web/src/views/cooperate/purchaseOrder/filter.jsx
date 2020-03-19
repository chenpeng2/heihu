import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import {
  message,
  withForm,
  Input,
  Link,
  Button,
  FilterSortSearchBar,
  DatePicker,
  OpenImportModal,
  haveAuthority,
} from 'src/components';
import auth from 'utils/auth';
import { splitRequestDataByFifty, arrayIsEmpty } from 'utils/array';
import { getQuery } from 'routes/getRouteParams';
import moment, { formatToUnix, formatUnixMoment } from 'utils/time';
import { importPurchaseOrders, getSaleOrderCustomProperty } from 'services/cooperate/purchaseOrder';
import { keysToObj } from 'utils/parseFile';

import LinkToCreatePurchaseOrder from './base/linkToCreatePurchaseOrder';
import { GET_PURCHASEORDER_IMPORT_TEMPLATE } from './constants';

const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const { RangePicker } = DatePicker;

type Props = {
  fetchData: () => {},
  form: {
    setFieldsValue: () => {},
  },
  match: {},
  location: any,
  history: any,
};

class Filter extends Component {
  props: Props;
  state = {
    pressEnter: false,
  };

  componentDidMount() {
    const {
      match,
      form: { setFieldsValue },
    } = this.props;
    const query = getQuery(match);
    const { creatTimeFromAt, creatTimeEndAt, ...rest } = query || {};
    setFieldsValue({
      ...rest,
      createdAt: [
        creatTimeFromAt ? formatUnixMoment(creatTimeFromAt) : undefined,
        creatTimeEndAt ? formatUnixMoment(creatTimeEndAt) : undefined,
      ],
    });
    this.setState({ pressEnter: false });
  }

  onSearch = () => {
    const { form, fetchData } = this.props;
    const values = form.getFieldsValue();
    const format = this.formatData(values);
    this.setState({ pressEnter: false });
    fetchData({ ...format });
  };

  formatData = values => {
    const { createdAt, page, ...rest } = values;
    const format = {
      ...rest,
      page: page || 1,
      creatTimeFromAt: createdAt && createdAt[0] ? formatToUnix(createdAt[0]) : undefined,
      creatTimeEndAt: createdAt && createdAt[1] ? formatToUnix(createdAt[1]) : undefined,
    };
    return format;
  };

  onKeyDown = e => {
    e.preventDefault();
    if (e.keyCode === 13) {
      this.setState({ pressEnter: true });
      document.getElementsByClassName('purchaseOrderSearchBtn')[0].click();
    }
  };

  handleOpenChange = status => {
    document.getElementsByClassName('targetDateRangePicker')[0].focus();
  };

  formatImportData = async data => {
    const res = await getSaleOrderCustomProperty({ size: 1000 });
    const fields = _.get(res, 'data.data');
    const purchaseOrderItemFields = !arrayIsEmpty(fields)
      ? fields.filter(e => e.keyType === 0).map(e => e.keyName)
      : [];
    const purchaseOrderFields = !arrayIsEmpty(fields) ? fields.filter(e => e.keyType === 1).map(e => e.keyName) : [];
    const keys1 = ['purchaseOrderCode', 'customerName'];
    const keys2 = ['remark', 'materialCode', 'materialAmount', 'unitName', 'materialTargetDate'];
    const keys = keys1.concat(keys2);
    // 去除第一行的填写备注
    data.splice(0, 1);
    // 去除空行
    data = data.filter(e => Array.isArray(e) && e.length);
    if (data[0].length !== purchaseOrderItemFields.length + purchaseOrderFields.length + keys.length) {
      message.error('模板版本不符，请下载最新模板!');
      // throw new Error('模板版本不符，请下载最新模板!');
    }
    const baseKey1EndIndex = keys1.length;
    const baseKeys2StartIndex = keys1.length + purchaseOrderFields.length;
    const baseKeys2EndIndex = keys1.length + purchaseOrderFields.length + keys2.length;
    const baseData = data.map(e =>
      e.slice(0, baseKey1EndIndex).concat(e.slice(baseKeys2StartIndex, baseKeys2EndIndex)),
    );
    const keysData = keysToObj(baseData, keys);

    const valueInCsvData = Array.isArray(data) ? data.slice(1) : []; // csv文件中的数据
    const titlesInCsv = data[0]; // csv文件中的titles

    // 获取自定义的字段
    valueInCsvData.forEach((item, index) => {
      const orderCustomFields = [];
      const lineCustomFields = [];
      for (let i = baseKey1EndIndex; i < baseKeys2StartIndex; i += 1) {
        orderCustomFields.push({
          keyName: titlesInCsv[i],
          keyValue: item[i],
        });
      }
      for (let i = baseKeys2EndIndex; i < baseKeys2EndIndex + purchaseOrderItemFields.length; i += 1) {
        lineCustomFields.push({
          keyName: titlesInCsv[i],
          keyValue: item[i],
        });
      }
      keysData[index].orderCustomFields = orderCustomFields;
      keysData[index].lineCustomFields = lineCustomFields;
    });

    return keysData;
  };

  splitData = data => {
    const sorted = _.sortBy(data, 'purchaseOrderCode');
    return splitRequestDataByFifty(sorted);
  };

  renderForm = () => {
    const {
      form: { getFieldDecorator, resetFields },
    } = this.props;

    return (
      <FilterSortSearchBar style={{ borderBottom: '1px solid rgb(232, 232, 232)' }} searchFn={this.onSearch}>
        <ItemList>
          <Item label="订单编号">{getFieldDecorator('purchaseOrderCode')(<Input placeholder="请输入订单编号" />)}</Item>
          <Item label="客户名称">{getFieldDecorator('customerName')(<Input placeholder="请输入客户名称" />)}</Item>
          <Item label="创建时间">
            {getFieldDecorator('createdAt', {})(
              <RangePicker
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                format="YYYY-MM-DD HH:mm:ss"
                allowClear
              />,
            )}
          </Item>
          <Item label="物料编号">{getFieldDecorator('materialCode')(<Input placeholder="请输入物料编号" />)}</Item>
        </ItemList>

        <Button className="purchaseOrderSearchBtn" icon={'search'} style={{ margin: '0 10px' }} onClick={this.onSearch}>
          查询
        </Button>
        <Link
          style={{
            lineHeight: '30px',
            height: '28px',
            color: '#8C8C8C',
          }}
          onClick={() => {
            resetFields();
            this.onSearch();
          }}
        >
          重置
        </Link>
      </FilterSortSearchBar>
    );
  };

  render() {
    return (
      <div>
        <div>{this.renderForm()}</div>
        <div style={{ display: 'flex', padding: 20 }}>
          <LinkToCreatePurchaseOrder
            disabled={!haveAuthority(auth.WEB_CREATE_PURCHASE_ORDER)}
            style={{ marginRight: 20 }}
          />
          <Button
            ghost
            disabled={!haveAuthority(auth.WEB_CREATE_PURCHASE_ORDER)}
            icon="download"
            style={{ marginRight: '20px' }}
            onClick={async () => {
              OpenImportModal({
                item: '销售订单',
                fileTypes: '.xlsx',
                context: { router: { history: _.get(this.props, 'history') } },
                method: importPurchaseOrders,
                listName: 'lineItems',
                logUrl: '/cooperate/purchaseOrders/logs/import',
                dataFormat: this.formatImportData,
                splitData: this.splitData,
                template: await GET_PURCHASEORDER_IMPORT_TEMPLATE(),
                onSuccess: res => {
                  if (sensors) {
                    sensors.track('web_cooperate_purchaseOrders_create', {
                      CreateMode: 'Excel导入',
                      amount: res.success,
                    });
                  }
                },
              });
            }}
          >
            导入销售订单
          </Button>
          <Link
            icon="eye-o"
            style={{ lineHeight: '30px', height: '28px' }}
            onClick={() => {
              this.props.history.push('/cooperate/purchaseOrders/logs/import');
            }}
          >
            查看导入日志
          </Link>
        </div>
      </div>
    );
  }
}

export default withRouter(withForm({}, Filter));
