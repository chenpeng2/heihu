import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DatePicker, Form } from 'antd';
import moment from 'utils/time';
import { getPathname, getQuery } from 'src/routes/getRouteParams';
import { withForm, RestPagingTable, FormItem, Button, Icon, Spin } from 'components';
import { getStoreHouseLog } from 'src/services/knowledgeBase/storeHouse';
import { setLocation } from 'utils/url';
import { primary } from 'styles/color';
import { replaceSign } from 'src/constants';

const RangePicker = DatePicker.RangePicker;

type propTypes = {
  viewer: any,
  form: {},
  relay: any,
  children: Element,
  match: {
    params: {
      code: string,
    },
  },
};

class StoreHouseOperateRecords extends Component<propTypes> {
  state = {
    data: null,
    loading: false,
  };

  componentDidMount() {
    const from_at = String(Date.parse(moment().subtract(1, 'months')));
    const to_at = String(Date.parse(moment()));
    const variables = { from_at, to_at };
    this.fetchData(variables);
    setLocation(this.props, p => ({ ...p, ...variables }));
  }

  fetchData = async params => {
    const { match } = this.props;
    const code = match.params.code;
    const query = getQuery(match);
    const variables = Object.assign({}, { ...query, ...params });
    this.setState({ loading: true });
    getStoreHouseLog(code, variables).then(res => {
      const { data } = res || {};
      this.setState({ data, loading: false });
    });
  };

  getTableColumns = () => {
    return [
      {
        title: '操作时间',
        dataIndex: 'createdAt',
        key: 'createdAt',
        type: 'operationDate',
        render: createdAt => {
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD HH:mm');
          };
          return <span>{getFormatDate(createdAt)}</span>;
        },
      },
      {
        title: '操作用户',
        dataIndex: 'userName',
        key: 'userName',
        type: 'personName',
        render: userName => <span>{userName || replaceSign}</span>,
      },
      {
        title: '仓库名称',
        dataIndex: 'warehouseName',
        key: 'warehouseName',
        type: 'personName',
        render: warehouseName => <span>{warehouseName || replaceSign}</span>,
      },
      {
        title: '操作类型',
        dataIndex: 'type',
        key: 'type',
        maxWidth: { C: 10 },
        render: type => <span>{type || replaceSign}</span>,
      },
      {
        title: '操作详情',
        dataIndex: 'detail',
        key: 'detail',
        maxWidth: { C: 45 },
        render: detail => (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ borderColor: primary }} />
            {detail}
          </div>
        ),
      },
    ];
  };

  onSearch = () => {
    const { form } = this.props;
    const { getFieldValue } = form;
    const { match } = this.props;
    const value = getFieldValue('operationTime') || [];
    const query = getQuery(match);
    const from_at = (value.length > 0 && String(Date.parse(value[0]._d))) || null;
    const to_at = (value.length > 0 && String(Date.parse(value[1]._d))) || null;
    const params = { code: match.params.code, from_at, to_at, page: 0 };
    const variables = Object.assign({}, { ...query, ...params });
    const pathname = getPathname(match);
    setLocation(this.props, () => variables);
    this.fetchData(variables);
  };

  render() {
    const { form } = this.props;
    const { changeChineseToLocale } = this.context;
    const { getFieldDecorator } = form;
    const { data, loading } = this.state;
    const today = moment();
    const lastMothToday = moment().subtract(1, 'months');
    const columns = this.getTableColumns();

    return (
      <Spin spinning={loading}>
        <div style={{ display: 'flex', marginTop: 20 }}>
          <Form>
            <FormItem label="操作时间">
              {getFieldDecorator('operationTime', {
                initialValue: [lastMothToday, today],
              })(
                <RangePicker
                  showTime={{
                    format: 'HH:mm',
                    hideDisabledOptions: true,
                  }}
                  format="YYYY/MM/DD HH:mm"
                />,
              )}
            </FormItem>
          </Form>
          <Button style={{ width: 86, margin: '5px 0 0 10px' }} onClick={this.onSearch}>
            <Icon type={'search'} />
            {changeChineseToLocale('查询')}
          </Button>
        </div>
        <div id="process_list">
          <RestPagingTable
            bordered
            dataSource={data && data.data}
            columns={columns}
            rowKey={record => record.id}
            total={data && data.count}
            refetch={this.fetchData}
          />
        </div>
      </Spin>
    );
  }
}

StoreHouseOperateRecords.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

export default withForm({}, StoreHouseOperateRecords);
