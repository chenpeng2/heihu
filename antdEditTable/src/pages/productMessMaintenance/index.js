import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD } from 'util/index'

import {Button, Table, Icon, Form, Select } from 'antd';

const { Option } = Select;

class FilterForm extends React.Component {
  submit = () => {
    const { form, parent } = this.props;
    parent.getFilterFormMsg(this, form.getFieldsValue())
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { codeList } = this.props.parent.state;
    // 数据转成option组件
    const defaultItem = [<Option key='all'>全部</Option>];
    const codes = defaultItem.concat( codeList.map( (item) => { return <Option key={ item }>{ item }</Option> } ) );
    return (
      <Form layout="inline" onSubmit={ this.handleSubmit } className="default-form">
        <Form.Item label="产品编码：">
          {getFieldDecorator('productCode')(
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="选择产品编码" style={{ width: '200px' }}>{ codes }</Select>
          )}
        </Form.Item>
        <Button onClick={this.submit} className="filter-submit" type="primary">更新</Button>
      </Form>
    );
  }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);

class ProductList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      total: '',
      codeList: [],
      pager: {defaultPageSize: 15},
      columns: [{
          title: '#',
          dataIndex: 'index',
          render: (text, record) => {
            return record.key + 1
          },
        }, {
          title: '产品编号',
          dataIndex: 'productCode',
          // defaultSortOrder: 'descend',
          // sorter: (a, b) => a.name - b.name,
        }, {
          title: '产品名称',
          dataIndex: 'productName',
        }, {
          title: '产品类型',
          dataIndex: 'productType',
        }, {
          title: '产品单位',
          dataIndex: 'productUnit',
        }, {
          title: '创建时间',
          dataIndex: 'produceDate',
          render: text => <span>{ formatterYMD(text) }</span>
        }, {
          title: '',
          dataIndex: 'nextGo',
          render: () => <Icon type="right" />,
          width: 40,
        }
      ],
      data: []
    }
  }

  filterSubmit() {
    this.setState({ loading: true });
    setTimeout(() => {
     this.setState({ loading: false });
    }, 500)
 }

  getFilterFormMsg(child, formData) {
    if(formData.productCode === 'all') {
      this.getProductList(1);
      return
    }
    this.getProduct(formData.productCode)
  }
  clickRow(record) {
    this.props.history.push('product/' + record.productCode )
  }

  getProductCodeList() {
    request({
      url: `/product/getProductCodeList`,
      method: 'GET',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      this.setState({ codeList: res.data })
    })
  }

  getProduct(code) {
    this.setState({ loading: true })
    request({
      url: `/product/getProduct?productCode=${ code }`,
      method: 'GET',
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        const data = res.data; data['key'] = 0;
        const pager = { ...this.state.pager };
        pager.total = data.total;
        this.setState({ data: [data], loading: false, total: 1, pager })
      },
      error: () => { alert('request 失败') }
    })
  }

  handleTableChange = (page) => {
    const pager = { ...this.state.pager };
    pager.current = page.current;
    this.setState({
      pager,
    });
    this.getProductList(pager.current);
  };

  getProductList(pageNum) {
    this.setState({ loading: true })
    const pageSize = this.state.pager.defaultPageSize;
    request({
      url: `/product/getProductList?pageNum=${pageNum}&pageSize=${ pageSize }`,
      method: 'GET',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      const data = res.data;
      const pager = { ...this.state.pager };
      pager.total = data.total;
      this.setState({ data: data.productList.map( (item, key) =>{
        item.key = (pageNum - 1)*pageSize + key;
        return item
      }), loading: false, total: data.total, pager  })
    })
  }

  componentDidMount() {
    this.getProductCodeList();
    this.getProductList(1)
  }

  render() {
    const {columns, data, loading, total, pager} = this.state;
    return (
      <div>
        <div className="filter-panel">
          <FilterFormBox parent={this} />
        </div>

        <div className="main-panel">
          <div className="operate">
            <span>产品 ({ total })</span>
            {/* <div>
              <Button onClick={ () => this.props.history.push('/product/add/new') }>创建产品</Button>
            </div> */}
          </div>
          <Table
            pagination={ pager }
            loading={loading}
            onRow={(record) => {
              return {
                onClick: this.clickRow.bind(this, record)
              }
            }}
            onChange={this.handleTableChange}
            columns={columns} 
            dataSource={data} />
        </div>
      </div>
    );
  }
}

export default ProductList;
