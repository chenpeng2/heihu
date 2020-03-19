import React, { PureComponent } from 'react';
import request from 'util/http';

import { Table, Checkbox, Breadcrumb, Button, Input, Popconfirm, Select, message  } from 'antd';
import EditableTable from 'components/antdEditTable/editFormTableDeviceParams'
const { Option } = Select
// 等于：e
// 不等于：ue
// 大于：g
// 大于等于：ge
// 小于：l
// 小于等于：le
// 范围内：bt
class DeviceDetail extends PureComponent {
  constructor(props) {
    super(props)
    const params = this.props.match.params;  // url params
    const level = [
        <Option key='e'>等于</Option>,
        <Option key='ue'>不等于</Option>,
        <Option key='g'>大于</Option>,
        <Option key='ge'>大于等于</Option>,
        <Option key='l'>小于</Option>,
        <Option key='le'>小于等于</Option>,
        <Option key='bt'>范围内</Option>
    ];
    this.state = {
        standardName: params.name, // 标准组名字
        equipmentCode: params.equipID,  //设备编号
        productCode: params.productID,  // 产品编号
        columns: [{
            title: '#',
            dataIndex: 'index'
          }, {
            title: <span><span className="required-mark">*</span>参数名称</span>,
            dataIndex: 'standardName',
            required: true,
          }, {
            title: <span><span className="required-mark">*</span>Measurement ID</span>,
            dataIndex: 'measurementId',
            required: true,
          }, {
            title: <span><span className="required-mark">*</span>条件</span>,
            dataIndex: 'condition',
            inputtype: 'select',
            options: level,
            editable: true,
            required: true,
          }, {
            title: <span><span className="required-mark">*</span>数值1(默认必填)</span>,
            dataIndex: 'value1',
            editable: true,
            required: true,
          }, {
            title: '数值2',
            dataIndex: 'value2',
            editable: true,
          },{
            title: '操作',
            dataIndex: 'operate',
        }],
        data: [],

        editingKey:'',
        measureIdArr:[]
    }
  }

  getStandardList(equip, pro) {
    request({
      url: `/standard/getStandardList?equipmentCode=${ equip }&productCode=${ pro }`,
      method: 'GET',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      this.setState({ data: res.data.map( (item, key) =>{
        item.key = key; item.index = key + 1;
        return item
      }), loading: false  })
    })
  }

  deleteStandard(standardName) {
    request({
      url: `/standard/deleteStandardGroup?standardName=${ standardName }`,
      method: 'DELETE',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      this.props.history.go(-1)
    })
  }

  componentDidMount() {
    const { equipmentCode, productCode } = this.state;
    this.getStandardList(equipmentCode, productCode);
  }
  updateParameter(param, callback) {
        request({
            url: `/standard/updateStandardList`,
            method: 'POST',
            data: param,
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                callback && callback()
            },
            error: () => {
                message.error('请求失败');
            }
        })
  }
  _setDataSource = (data,editingKey,type,changeTable)=> {
      if(changeTable==='changeTable'){
          let {columns}=this.state
          if(data[editingKey].condition==='bt'){
              columns[5].title=<span><span className="required-mark">*</span>数值2</span>
              columns[5].required=true
              this.setState({columns})
          }
          this.setState({data})
          return
      }
      // 模拟添加成功前台添加
      this.setState({data,editingKey:''})
      if(type!=='nosave'){
          // 添加和更新，去请求刷新下measureIdArr
          const param = {},oneArr = []
          const newData = data[editingKey]
          param.condition=newData.condition
          param.createDate=new Date()
          param.equipmentCode=newData.equipmentCode
          param.measurementId=newData.productCode
          param.standardId=newData.standardId
          param.standardName=newData.standardName
          param.value1=newData.value1
          param.value2=newData.value2
          oneArr.push(param)
          this.updateParameter(oneArr)
      }
  }
  getRowItem(key) {
        return {
            key: key,
            index:key+1,
            condition: "ge",
            createDate: "2019-10-12T02:50:41.429+0000",
            equipmentCode: "YDSC049",
            measurementId: "hhh",
            productCode: "6C1011211032008",
            standardId: 53,
            standardName: "standard_test",
            value1: "10",
            value2: ""
        }
  }
  // 添加参数行
  addRow(e) {
        e && e.preventDefault();
        const { data } = this.state;
        this.setState({
            data: [...data, this.getRowItem(data.length)],
        },()=>{
            this.setState({editingKey:this.state.data.length-1})
        });
  }
  render() {
    const { standardName, equipmentCode, productCode, columns, data } = this.state;
    return (
      <div className="create-device-page">
        <div className="fixed-panel">
          <Breadcrumb>
            <Breadcrumb.Item><a href="#" onClick={ (e) => { this.props.history.goBack() } }>管理标准</a></Breadcrumb.Item>
            <Breadcrumb.Item>设备参数标准</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <h1>{ standardName }</h1>
              <div className="btn-group">
                <Button onClick={ () => this.props.history.push('/standard/add/a') } type="primary">创建标准</Button>
                <Popconfirm
                  title="确定删除标准?"
                  onConfirm={ () => { this.deleteStandard(standardName) }  }
                  okText="确定"
                  cancelText="取消"
                >
                  <Button>删除</Button>
                </Popconfirm>
            </div>
          </div>
        </div>
        <div className="title">基础信息</div>
        <section className="basic-info">
            <div className="item">
                <div>标准名称:</div>
                { standardName }
            </div>
            <div className="item">
                <div>设备:</div>
                { equipmentCode }
            </div>
            <div className="item">
                <div>产品:</div>
                { productCode }
            </div>
        </section>
        <div className="title">参数标准</div>
        <div className="main-panel">
          <div className="operate">
            <span>参数标准 ({ data.length })</span>
          </div>
          {/*<Table */}
            {/*pagination={false} */}
            {/*columns={columns} */}
            {/*dataSource={data} />*/}
            <EditableTable editingKey={this.state.editingKey} setDataSource={this._setDataSource}  dataSource={ data } columns={ columns }></EditableTable>
        </div>
      </div>
    );
  }
}

export default DeviceDetail;