import React, { PureComponent } from 'react';
import { Form, Input, Select, Button, Table, Icon, Affix, message, Popconfirm } from 'antd';
import './index.less';
import request from 'util/http'
import { formatterYMD } from 'util/index'
import Edit from '@material-ui/icons/Edit';
import Remove from '@material-ui/icons/Remove';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
const { Option } = Select;
class ParamStandMaintenance extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      pager: { pageSize: 10, defaultPageSize: 10, size: 'small', showQuickJumper: true },
      loading: true,
      columns: [
        {
          title: '设备名称',
          dataIndex: 'equipmentName',
        },
        {
          title: '设备编号',
          dataIndex: 'equipmentCode',
        },
        {
          title: '产品名称',
          dataIndex: 'productName',
        },
        {
          title: '产品编号',
          dataIndex: 'productCode',
        },
        {
          title: '操作',
          dataIndex: 'operate',
          width: 100,
          align: 'center',
          render: (text, record) => 
            <span>
              <a style={{marginRight: '20px'}}><Edit/></a>
              <Popconfirm title="确认删除吗?" okText="确认" cancelText="取消" onConfirm={(e) => this.deleteStandard(e,record)} onCancel={(e)=>e.stopPropagation()}>
                <a onClick={(e)=>e.stopPropagation()}><DeleteOutline/></a>
              </Popconfirm>
            </span>
        }
      ],
      data: [],
      equipmentCodeList: [],
      productCodeList: [],
      isShowFilter: true,
      isPingFilters: false,
    }
  }

  deleteStandard(e,record) {
      e.stopPropagation()
      request({
      url: `/standard/deleteStandardGroup?equipmentCode=${record.equipmentCode}&productCode=${record.productCode}`,
      method: 'DELETE',
      success: res => {
        if (!res || res.code !== 0) {
          return
        } else {
          this.getStandardGroupList(1)
        }
      },
      error: () => {
        message.error('请求失败！')
      }
   })
  }

  handleSubmit = (e) => {
    e && e.preventDefault();
    const { equipmentCode, productCode } = this.props.form.getFieldsValue()
    this.getStandardGroupList(1, equipmentCode && equipmentCode.trim(), productCode && productCode.trim())
  }
  changeFilter(e) {
    e.stopPropagation()
    const { isShowFilter, isPingFilters } = this.state
    if (isPingFilters) { return }
    this.setState({
      isShowFilter: !isShowFilter
    })
  }

  pingFilters() {
    const { isPingFilters } = this.state
    this.setState({
      isPingFilters: !isPingFilters,
    })
  }

  getEquipmentCodeList() {
    request({
      url: `/equipment/getEquipmentCodeList`,
      method: 'GET',
      success: res => {
        if (!res || res.code !== 0) {
          return
        }
        this.setState({ equipmentCodeList: res.data })
      },
      error: () => {
        message.error('请求失败！')
      }
    })
  }


  getProductCodeList() {
    request({
      url: `/product/getProductCodeList`,
      method: 'GET',
    }).then(res => {
      if (!res || res.code !== 0) {
        return
      }
      this.setState({ productCodeList: res.data })
    })
  }

  renderFilters() {
    const { isShowFilter, isPingFilters, equipmentCodeList, productCodeList } = this.state;
    const { getFieldDecorator } = this.props.form;
    const defaultItem = [<Option key=' '>全部</Option>];
    const equipmentList = defaultItem.concat(equipmentCodeList.map((item) => { return <Option key={item}>{item}</Option> }));
    const productList = defaultItem.concat(productCodeList.map((item) => { return <Option key={item}>{item}</Option> }));
    return (
      <div className="filter-panel">
        <div className="flex-container" style={{ display: isShowFilter ? "flex" : "none" }}>
          <Form layout="inline" onSubmit={this.handleSubmit}>
            <Form.Item label="设备编码：">
              {getFieldDecorator('equipmentCode')(
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder="选择设备编码：" style={{ width: '200px' }}>{equipmentList}</Select>
              )}
            </Form.Item>
            <Form.Item label="产品编码：">
              {getFieldDecorator('productCode')(
                <Select
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                  placeholder="选择产品编码：" style={{ width: '200px' }}>{productList}</Select>
              )}
            </Form.Item>
            <Form.Item label={<div></div>} colon={false}>
              <Button className="filter-submit" type="primary" htmlType="submit">查询</Button>
            </Form.Item>
          </Form>
        </div>
      </div>

    )
  }

  clickRow(record) {
    this.props.history.push(`standard/params/${record.equipmentCode}/${record.productCode}`)
  }

  getStandardGroupList(pageNum, equipmentCode, productCode) {
    this.setState({ loading: true })
    const pageSize = this.state.pager.defaultPageSize;
    request({
      url: `/standard/getStandardGroupList?pageNum=${pageNum}&pageSize=${pageSize}${equipmentCode ? ('&equipmentCode=' + equipmentCode) : ''}${productCode ? ('&productCode=' + productCode) : ''}`,
      method: 'GET',
    }).then(res => {
      if (!res || res.code !== 0) {
        return
      }
      const data = res.data;
      const pager = { ...this.state.pager };
      pager.total = data.total;
      this.setState({
        data: data.standardGroupList.map((item, key) => {
          item.key = (pageNum - 1) * pageSize + key;
          return item
        }), loading: false, total: data.total, pager
      })
    })
  }

  handleTableChange = (page) => {
    const pager = { ...this.state.pager };
    pager.current = page.current;
    this.setState({
      pager,
    });
    this.getStandardGroupList(pager.current);
  };

  componentDidMount() {
    this.getStandardGroupList(1)
    this.getEquipmentCodeList()
    this.getProductCodeList()
  }

  render() {
    const { columns, data, isPingFilters, pager, loading, total } = this.state;
    return (
      <div className="param-stand-maintenance">
        {isPingFilters ?
          <Affix offsetTop={0}>
            {this.renderFilters()}
          </Affix> :
          <div> {this.renderFilters()} </div>
        }
        <div className="main-panel">
          <div className="operate">
            <span>策略组列表 ({total})</span>
            <div>
              <Button onClick={() => this.props.history.push('/standard/add/new')}>
                <Icon type="plus" />
                创建策略组
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            loading={loading}
            onRow={(record) => {
                return {
                  onClick: this.clickRow.bind(this, record)
                }
            }}
            dataSource={data}
            onChange={this.handleTableChange}
            pagination={pager.total>pager.defaultPageSize?pager:false} />
        </div>
      </div>
    );
  }
}
const WrappedParamStandMaintenance = Form.create({ name: 'params_search' })(ParamStandMaintenance);
export default WrappedParamStandMaintenance;
