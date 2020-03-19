import React, { PureComponent } from 'react';
import request from 'util/http';

import { Table, Checkbox, Breadcrumb, Button, Input, Popconfirm, Select, message } from 'antd';
import EditableTable from 'components/antdEditTable/editTable'
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
    const level = {
      'e': '等于',
      'ue': '不等于',
      'g': '大于',
      'ge': '大于等于',
      'l': '小于',
      'le': '小于等于',
      'bt': '范围内'
    }
    this.state = {
      standardName: params.name, // 标准组名字
      equipmentCode: params.equipID,  //设备编号
      productCode: params.productID,  // 产品编号
      columns: [{
        title: <span><span className="required-mark">*</span>参数名称</span>,
        field: 'parameterName',
        editable: 'never',
        sorting: false,
      }, {
        title: <span><span className="required-mark">*</span>Measurement ID</span>,
        field: 'measurementId',
        editable: 'never'
      }, {
        title: <span><span className="required-mark">*</span>条件</span>,
        field: 'condition',
        lookup: level,
        sorting: false,
      }, {
        title: <span><span className="required-mark">*</span>数值1(默认必填)</span>,
        field: 'value1',
        type: 'numeric'
      }, {
        title: '数值2',
        field: 'value2',
        type: 'numeric'
      }],
      data: [],
      editingKey: '',
      measureIdArr: [],
      isFetching: true,
    }
  }

  getStandardList = () => {
    const { equipmentCode, productCode } = this.state;
    request({
      url: `/standard/getStandardList?equipmentCode=${equipmentCode}&productCode=${productCode}`,
      method: 'GET',
    }).then(res => {
      if (!res || res.code !== 0) {
        return
      }
      this.setState({
        isFetching: false,
        data: res.data.map((item, key) => {
          item.key = key; item.index = key + 1;
          return item
        }),
      })
    })
  }

 

  componentDidMount() {
    this.getStandardList();
  }

  updateParameter(param) {
    return request({
      url: `/standard/updateStandardList`,
      method: 'POST',
      data: [param],
      success: res => {
        if (!res || res.code !== 0) {
          return
        } else {
          return res
        }
      },
      error: (err) => {
        if (err.response.data.code === -2) {
          message.error('数据出错，请检查填写数据');
        } else {
          message.error('网络请求错误');
        }
      }
    })
  }
  _setDataSource = (data, editingKey, type, changeTable) => {
    if (changeTable === 'changeTable') {
      let { columns } = this.state
      if (data[editingKey].condition === 'bt') {
        columns[5].title = <span><span className="required-mark">*</span>数值2</span>
        columns[5].required = true
        this.setState({ columns })
      }
      this.setState({ data })
      return
    }
    // 模拟添加成功前台添加
    this.setState({ data, editingKey: '' })
    if (type !== 'nosave') {
      // 添加和更新，去请求刷新下measureIdArr
      const param = {}, oneArr = []
      const newData = data[editingKey]
      param.condition = newData.condition
      param.createDate = new Date()
      param.equipmentCode = newData.equipmentCode
      param.measurementId = newData.productCode
      param.standardId = newData.standardId
      param.standardName = newData.standardName
      param.value1 = newData.value1
      param.value2 = newData.value2
      oneArr.push(param)
      this.updateParameter(oneArr)
    }
  }
  getRowItem(key) {
    return {
      key: key,
      index: key + 1,
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
    }, () => {
      this.setState({ editingKey: this.state.data.length - 1 })
    });
  }
  render() {
    const { standardName, equipmentCode, productCode, columns, data, isFetching } = this.state;
    return (
      <div className="create-device-page">
        <div className="fixed-panel">
          <Breadcrumb>
            <Breadcrumb.Item><a href="#" onClick={(e) => { this.props.history.goBack() }}>报警策略</a></Breadcrumb.Item>
            <Breadcrumb.Item>策略组</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <div className="btn-group">
            </div>
          </div>
        </div>
        <div className="title">策略组信息</div>
        <section className="basic-info">
          <div className="item">
            <div>设备:</div>
            {equipmentCode}
          </div>
          <div className="item">
            <div>产品:</div>
            {productCode}
          </div>
        </section>
        <div className="title">详情</div>
        <div className="main-panel">
          <EditableTable
            title={"报警策略列表（" + data.length + '）'}
            hasPaging={false} columns={columns}
            updateData={this.updateParameter}
            createData={false}
            data={{ list: data, isFetching }}
            deleteData={false}
            getTableList={this.getStandardList}
          />
        </div>
      </div>
    );
  }
}

export default DeviceDetail;