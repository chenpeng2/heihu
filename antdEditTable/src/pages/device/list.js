import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD } from 'util/index'

import './index.less'

import { Select, Button, Table, Icon, message, Form } from 'antd';
const { Option } = Select;

// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
  submit = () => {  // 将表单数据传给父组件
    const { form, parent } = this.props;
    parent.getFilterFormMsg(this, form.getFieldsValue())
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { shopList, typeList, codeList } = this.props;
    // 数据转成option组件
    const defaultItem = [<Option key='all'>全部</Option>];
    const shops = defaultItem.concat( shopList.map( (item) => { return <Option key={ item }>{ item }</Option> } ) );
    const types = defaultItem.concat( typeList.map( (item) => { return <Option key={ item }>{ item }</Option> } ) );
    const codes = defaultItem.concat( codeList.map( (item) => { return <Option key={ item }>{ item }</Option> } ) );
    return (
      <Form layout="inline" onSubmit={ this.handleSubmit } className="default-form">
        {/* 选择框支持输入搜索 */}
        <Form.Item label="车间：">
          {getFieldDecorator('workshop')(
            <Select 
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="选择车间" style={{ width: '200px' }}>{ shops }</Select>
          )}
        </Form.Item>
        <Form.Item label="设备类型：">
          {getFieldDecorator('equipmentType')(
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="选择设备类型" style={{ width: '200px' }}>{ types }</Select>
          )}
        </Form.Item>
        <Form.Item label="设备编码：">
          {getFieldDecorator('equipmentCode')(
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
              placeholder="选择设备编码" style={{ width: '200px' }}>{ codes }</Select>
          )}
        </Form.Item>
        <Button onClick={this.submit} className="filter-submit" type="primary">更新</Button>
      </Form>
    );
  }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);

class DeviceList extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      loading: true,  // table loading
      data: [],       // 设备数据
      shopList: [], // 车间列表
      codeList: [], // 设备编码列表
      typeList: [], // 设备型号列表
      columns: [{     // 设备table 列
          title: '#',
          dataIndex: 'index',
          render: (text, record) => {
            return record.key + 1
          },
          width: 60
        }, {
          title: '设备名称',
          dataIndex: 'equipmentName',
          defaultSortOrder: 'descend',
          sorter: (a, b) => a.name - b.name,
          width: '10%'
        }, {
          title: '设备类型',
          dataIndex: 'equipmentType',
          width: '10%'
        }, {
          title: '设备编码',
          dataIndex: 'equipmentCode',
          width: '10%'
        }, {
          title: '车间',
          dataIndex: 'workshop',
          width: '10%'
        }, {
          title: '制造商',
          dataIndex: 'vendor',
          width: '10%'
        }, {
          title: '型号',
          dataIndex: 'model',
          width: '10%'
        }, {
          title: '序列号',
          dataIndex: 'serialNumber',
          width: '10%'
        }, {
          title: '出厂日期',
          dataIndex: 'deliverDate',
          render: text => <span>{ formatterYMD(text) }</span>
        }, {
          title: '入厂日期',
          dataIndex: 'receiptDate',
          render: text => <span>{ formatterYMD(text) }</span>
        },{
          title: '创建日期',
          dataIndex: 'createDate',
          render: text => <span>{ formatterYMD(text) }</span>
        }, {
          title: '',
          dataIndex: 'nextGo',
          render: () => <Icon type="right" />,
          width: 40,
        }]
    }
  }
  getFilterFormMsg(child, formData) {
    this.getDeviceList(formData)
  }
  // 点击设备行进入详情页
  clickRow(record) {
    this.props.history.push('device/' + record.equipmentCode)
  }
  // 获取设备api
  getDeviceList(data) {
    let url = ''
    if(data) {
      for(let key in data) {
        const item = data[key];
        if(item && item !== 'all') {
          const symbol = ( url === '' ? '?' : '&' );
          url += ( symbol + key + '=' + item )
        }
      }
    }
    this.setState({ loading: true })
    request({
      url: `/equipment/getEquipmentList${ url }`,
      method: 'GET',
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.setState({ data: res.data.map( (item, key) =>{
          item.key = key;
          return item
        }), loading: false  })
      },
      error: () => {
        message.error('请求失败！')
        this.setState({ loading: false })
      }
    })
  }

  // 获取车间列表
  getWorkshopList() {
    request({
      url: `/equipment/getWorkshopList`,
      method: 'GET',
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.setState({ shopList: res.data })
      },
      error: () => {
        message.error('请求失败！')
      }
    })
  }
  // 获取设备编码列表
  getEquipmentCodeList() {
    request({
      url: `/equipment/getEquipmentCodeList`,
      method: 'GET',
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.setState({ codeList: res.data })
      },
      error: () => {
        message.error('请求失败！')
      }
    })
  }
  // 获取设备型号列表
  getEquipmentTypeList() {
    request({
      url: `/equipment/getEquipmentTypeList`,
      method: 'GET',
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.setState({ typeList: res.data })
      },
      error: () => {
        message.error('请求失败！')
      }
    })
  }


  componentDidMount() {
    this.getDeviceList(); // 设备列表
    this.getWorkshopList();   // 车间列表
    this.getEquipmentCodeList();    // 设备编码列表
    this.getEquipmentTypeList();    // 设备类型列表
  }
  render() {
    const {columns, data, loading, shopList, typeList, codeList} = this.state;
    return (
      <div>
        <div className="filter-panel">
          <FilterFormBox parent={this} shopList={shopList} typeList={typeList} codeList={codeList}  />
        </div>

        <div className="main-panel">
          <div className="operate">
            <span>设备 ({ data.length })</span>
            {/* <div> */}
              {/* <Button onClick={ () => this.props.history.push('/device/add/new') }>添加设备</Button> */}
              {/* <a href="#" className="sap-icon icon-action-settings"></a> */}
            {/* </div> */}
          </div>
          <Table
            pagination={false}
            loading={loading}
            onRow={(record) => {
              return {
                onClick: this.clickRow.bind(this, record)
              }
            }} 
            columns={columns} 
            dataSource={data} />
        </div>
      </div>
    );
  }
}

export default DeviceList;
