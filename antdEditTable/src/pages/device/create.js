import React, { PureComponent } from 'react';
import request from 'util/http'

import UploadPicture from './components/uploadPic'

import EditableTable from 'components/antdEditTable/editFormTable'

import { Input, DatePicker, Table, Select, Checkbox, Breadcrumb, Button, message  } from 'antd';
const { Option } = Select;

class DeviceCreate extends PureComponent {
  constructor(props) {
    super(props)
    const params = this.props.match.params;  // url params
    const mID = this.getMeasureID();
    const level = [<Option key='0'>重要</Option>, <Option key='1'>次要</Option>, <Option key='2'>一般</Option>];
    this.state = {
        type: params.type,  // 创建 or 编辑 or 复制
        id: params.id,  // 被编辑 or 被复制 的设备id

        device: {
          equipmentName: null,  // 设备名称
          equipmentType: '挤出机',  // 设备类型
          equipmentCode: null,  // 编码
          workshop: null,  // 车间
          vendor: null, // 制造商
          model: null, // 型号
          serialNumber: null, //序列号
          deliverDate: null, // 出厂日期
          receiptDate: null, // 入厂日期
          picture: null
        },

        selectedRowKeys: [],
        columns: [{
            title: '#',
            editable: false,
            dataIndex: 'num'
          }, {
            title: <span><span className="required-mark">*</span>参数名称</span>,
            required: true,
            dataIndex: 'parameterName'
          }, {
            title: <span><span className="required-mark">*</span>Measurement ID</span>,
            inputtype: 'select',
            options: mID,
            dataIndex: 'measurementId',
          }, {
            title: '参数单位',
            dataIndex: 'unit',
          }, {
            title: <span><span className="required-mark">*</span>重要程度</span>,
            inputtype: 'select',
            options: level,
            dataIndex: 'importance',
          }, {
            title: '监控',
            inputtype: 'check',
            dataIndex: 'isMonitor',
          }, {
            title: '成组显示',
            dataIndex: 'groupName',
          }],
        data: [this.getRowItem(0)]
    }
  }

  getMeasureID() {
    let id = ['extrusion_speed', 'screw_speed', 'traction_speed', 'melt_temperature', 'melt_pressure'];
    id.forEach( (item, key) => {
      id[key] = <Option key={ item }>{ item }</Option>
    } )
    for(let i = 1; i <= 20; i++) {
      id.push(<Option key={  'temperature' + i }>{ 'temperature' + i }</Option>)
    }
    return id
  }

  getRowItem(key) {
    return {
        key: key,
        num: key,
        parameterName: '',
        measurementId: 'extrusion_speed',
        unit: '',
        importance: '0',
        isMonitor: true,
        groupName: ''
    }
  }

  addRow(e) {
        e && e.preventDefault();
        const { data } = this.state;
        this.setState({
            data: [...data, this.getRowItem(data.length)]
        });
  }

  deleteRow(e) {
    e && e.preventDefault();
    const { selectedRowKeys } = this.state;
    selectedRowKeys.sort()
    let { data } = this.state;
    for(let i = selectedRowKeys.length - 1; i >= 0; i--) {
        data.splice(selectedRowKeys[i], 1)
    }
    data.forEach( (item, key) => {
        item.key = key
    } )
    this.setState({ data: [...data], selectedRowKeys: [] })
  }

  handleInputChange = (e, key) => {
    const item = {}; item[key] = e.target ? e.target.value : e;
    let device = Object.assign({}, this.state.device, item )
    this.setState({ device })
  }

  addDevice(callback) {
    request({
      url: `/equipment/addEquipment`,
      method: 'POST',
      data: this.state.device,
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        callback && callback(res.data)
      },
      error: () => { 
        message.error('请求失败');
      }
    })
  }

  addParam(param, equipmentCode) {
    request({
      url: `/parameter/addParameterList`,
      method: 'POST',
      data: param.map( (item) => { item.equipmentCode = equipmentCode; return item }),
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.props.history.go(-1)
      },
      error: () => { 
        message.error('请求失败');
        this.props.history.go(-1)
      }
    })
  }

  submit() {
      const { device, data } = this.state;
      console.log(this.refs.paramForm.state.formSource)
      const param = this.refs.paramForm.state.formSource;
      const file = this.refs.picture.state.fileList; // 上传的图片
      const picture = file[0] && file[0].thumbUrl;  // 图片base64
      this.setState({ device: Object.assign({}, device, { picture }) }, () => {
        this.addDevice( (code) => {
          this.addParam( param, code )
        })
      })
  }
  render() {
    const {columns, data, selectedRowKeys, type, id } = this.state;
    const { device } = this.state;
    const { history } = this.props;
    const deviceType = [<Option key='挤出机'>挤出机</Option>, <Option key='烘料罐'>烘料罐</Option>]
    return (
      <div className="create-device-page">
        <div className="fixed-panel">
            <Breadcrumb>
                <Breadcrumb.Item><a href="#" onClick={ (e) => { history.go(type !== 'add' ? -2 : -1) } }>管理设备</a></Breadcrumb.Item>
                {
                    type === 'add' ? <Breadcrumb.Item>设备</Breadcrumb.Item> : ''
                }
                {
                    type !== 'add'  ? <Breadcrumb.Item><a  href="#" onClick={ (e) => { history.goBack() } }>设备</a></Breadcrumb.Item> : ''
                }
                {
                    type === 'edit' ? <Breadcrumb.Item>编辑设备</Breadcrumb.Item> : ''
                }
            </Breadcrumb>
            {
                type !== 'add'  ? <h1 style={{ marginTop: '10px' }}>{ id }</h1> : <h1 style={{ marginTop: '10px' }}>添加设备</h1>
            }
        </div>
        <div className="fixed-panel slot">
            <a href="#">首要信息</a>
            <a href="#">基础信息</a>
            <a href="#">设备参数</a>
        </div>
        <section className="basic-info">
            <div className="item">
                <div className="label"><span className="required-mark">*</span>设备名称:</div>
                <Input defaultValue={ device.equipmentName } onChange={ (e) => { this.handleInputChange(e, 'equipmentName') } } />
                { device.equipmentName === '' ? <div className="errorMsg">请输入设备名称</div> : '' }
            </div>
            <div className="item">
                <div className="label"><span className="required-mark">*</span>类型:</div>
                <Select onChange={ (value) => { this.handleInputChange(value, 'equipmentType') }  } defaultValue="挤出机" style={{ width: '100%' }}>{ deviceType }</Select>
            </div>
            <div className="item">
                <div className="label"><span className="required-mark">*</span>编码:</div>
                <Input defaultValue={ device.equipmentCode } onChange={ (e) => { this.handleInputChange(e, 'equipmentCode') } } />
                { device.equipmentCode === '' ? <div className="errorMsg">请输入编码</div> : '' }
            </div>
        </section>
        <div className="title">基础信息</div>
        <section className="basic-info">
            <div className="item">
                <div className="label">车间:</div>
                <Input defaultValue={ device.workshop } onChange={ (e) => { this.handleInputChange(e, 'workshop') } } />
            </div>
            <div className="item">
                <div className="label">制造商:</div>
                <Input defaultValue={ device.vendor } onChange={ (e) => { this.handleInputChange(e, 'vendor') } } />
            </div>
            <div className="item">
                <div className="label">型号:</div>
                <Input defaultValue={ device.model } onChange={ (e) => { this.handleInputChange(e, 'model') } } />
            </div>
            <div className="item">
                <div className="label">序列号:</div>
                <Input defaultValue={ device.serialNumber } onChange={ (e) => { this.handleInputChange(e, 'serialNumber') } } />
            </div>
            <div className="item">
                <div className="label">出厂日期:</div>
                <DatePicker onChange={ (date, dateString) => this.handleInputChange(date._d, 'deliverDate') } format="YYYY-MM-DD" placeholder="出厂日期" />
            </div>
            <div className="item">
                <div className="label">入厂日期：</div>
                <DatePicker onChange={ (date, dateString) => this.handleInputChange(date._d, 'receiptDate') } format="YYYY-MM-DD" placeholder="入厂日期" />
            </div>
            <div className="item full">
                <div className="label">图片：</div>
                <UploadPicture ref="picture" />
            </div>
        </section>
        <div className="title">设备参数</div>
        <div className="main-panel" style={{ marginBottom: '40px' }}>
          <div className="operate">
            <span>参数列表 (5)</span>
            <div>
                <a onClick={ (e) => { this.addRow(e) } } href="#">添行</a>
                <a onClick={  (e) => { this.deleteRow(e) } } href="#">删除</a>
            </div>
          </div>
          <EditableTable ref="paramForm" dataSource={ data } columns={ columns }></EditableTable>
        </div>
        <div className="footer">
          <Button onClick={ (e) => { this.submit() } } type="primary">保存</Button>
          <Button onClick={ (e) => { this.submit() } } type="default">取消</Button>
        </div>
      </div>
    );
  }
}

export default DeviceCreate;
