import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { DatePicker, Tabs } from 'antd';
import { white, borderGrey } from 'src/styles/color/index';
import FilterSortSearchBar from 'components/filterSortSearchBar';
import { Button, Link, withForm, Icon, Searchselect, Row, Select } from 'components';

const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
const ItemList = FilterSortSearchBar.ItemList;
const Item = FilterSortSearchBar.Item;
const Option = Select.Option;
const filterGroup = [
  {
    label: '全部',
    key: '6',
  },
  {
    label: '未开始',
    key: '1',
  },
  {
    label: '执行中',
    key: '2',
  },
  {
    label: '暂停中',
    key: '3',
  },
  {
    label: '已结束',
    key: '4',
  },
  {
    label: '已取消',
    key: '5',
  },
];

type Props = {
  push: () => {},
  children: Node,
  match: {},
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
    resetFields: () => {},
  },
  fetchData: () => {},
  onSearch: () => {},
  onReset: () => {},
};

class FilterForProdReportsList extends Component {
  props: Props;

  state = {
    data: [],
    loading: false,
    startTimePlanned: [],
    exportData: [],
    total: 0,
  };

  componentDidMount() {
    this.setState({
      onSearching: false,
    });
  }

  getButton = () => {
    const { changeChineseToLocale } = this.context;
    return (
      <Button
        style={{ width: 86 }}
        onClick={() => {
          const formValues = this.props.form.getFieldsValue();
          this.props.fetchData(false, { sortBy: 'startTimePlanned', order: 0, size: 10, page: 1, ...formValues }, {});
          this.props.onSearch();
        }}
      >
        <Icon type={'search'} />
        {changeChineseToLocale('查询')}
      </Button>
    );
  };

  renderFilter = () => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { changeChineseToLocale } = this.context;

    return (
      <FilterSortSearchBar
        style={{ backgroundColor: white, width: '100%', borderBottom: `1px solid ${borderGrey}` }}
        searchDisabled
      >
        <ItemList>
          <Row style={{ flex: '1 1 auto' }}>
            <Item label="计划开始时间">{getFieldDecorator('startTimePlanned')(<RangePicker />)}</Item>
            <Item label="计划结束时间">
              {getFieldDecorator('endTimePlanned')(
                <RangePicker disabledDate={this.state.disabledDate} onChange={this.setDisabledDate} />,
              )}
            </Item>
            <Item label="创建时间">{getFieldDecorator('createdAt')(<RangePicker />)}</Item>
            <Item label="实际开始时间">{getFieldDecorator('startTimeReal')(<RangePicker />)}</Item>
            <Item label="实际结束时间">{getFieldDecorator('endTimeReal')(<RangePicker />)}</Item>
          </Row>
          <Row style={{ flex: '1 1 auto' }}>
            <Item label="项目编号">
              {getFieldDecorator('projectCode')(
                <Searchselect placeholder={''} type="project" className="select-input" />,
              )}
            </Item>
            <Item label="订单号">
              {getFieldDecorator('purchaseOrderCode')(
                <Searchselect placeholder={''} type="purchaseOrder" className="select-input" />,
              )}
            </Item>
            <Item label="项目状态">
              {getFieldDecorator('status', { initialValue: { key: '6', label: '全部' } })(
                <Select size="default" labelInValue style={{ marginLeft: 13, marginRight: 20, minWidth: 120 }}>
                  {filterGroup.map(({ label, key }) => (
                    <Option key={key} value={key}>
                      {changeChineseToLocale(label)}
                    </Option>
                  ))}
                </Select>,
              )}
            </Item>
            <Item label="产出物料编号">
              {getFieldDecorator('productCode')(
                <Searchselect type="productCode" className="select-input" hideCreateButton allowClear />,
              )}
            </Item>
            <Item label="产出物料名称">
              {getFieldDecorator('productName')(
                <Searchselect type="productName" className="select-input" hideCreateButton allowClear />,
              )}
            </Item>
          </Row>
        </ItemList>
        {this.getButton()}
        <Link
          style={{ lineHeight: '30px', height: '28px', color: '#8C8C8C', paddingLeft: 16 }}
          onClick={() => {
            this.props.onReset();
            this.props.form.resetFields();
          }}
        >
          重置
        </Link>
      </FilterSortSearchBar>
    );
  };

  render() {
    const { changeChineseToLocale } = this.context;
    return (
      <Tabs defaultActiveKey="projectTab">
        <TabPane tab={changeChineseToLocale('按项目')} key="projectTab">
          {this.renderFilter()}
        </TabPane>
        {/* <TabPane tab="按订单" key="purchaseTab">{this.renderFilter()}</TabPane> */}
      </Tabs>
    );
  }
}

FilterForProdReportsList.contextTypes = {
  router: PropTypes.object,
  changeChineseToLocale: PropTypes.func,
};

export default withRouter(FilterForProdReportsList);
