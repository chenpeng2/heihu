import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD } from 'util/index'

import { Table, Breadcrumb, Button, message, Select, Popconfirm, Checkbox } from 'antd';
import EditableTable from 'components/antdEditTable/editFormTableDevice'
const { Option } = Select

class DeviceDetail extends PureComponent {
    constructor(props) {
        super(props)
        const params = this.props.match.params;  // url params
        const mID = this.getMeasureID();
        this.mID=mID;
        const level = [<Option key='0'>重要</Option>, <Option key='1'>次要</Option>, <Option key='2'>一般</Option>];
        this.state = {
            mode: 0,  // 1编辑模式
            id: params.id, // 设备编号
            detail: {},   // 设备数据
            existParamLen: 0,
            paramList: [],
            data: [],
            columns_mode1: [{
                title: '#',
                dataIndex: 'index',
                render: (text, record) => {
                    return record.key + 1
                }
            }, {
                title: <span><span className="required-mark">*</span>参数名称</span>,
                editable: true,
                dataIndex: 'parameterName',
                required: true,
            }, {
                title: <span><span className="required-mark">*</span>Measurement ID</span>,
                inputtype: 'select',
                editable: true,
                options: mID,
                dataIndex: 'measurementId',
                required: true,
            }, {
                title: '参数单位',
                editable: true,
                dataIndex: 'unit',
            }, {
                title: <span><span className="required-mark">*</span>重要程度</span>,
                editable: true,
                inputtype: 'select',
                options: level,
                dataIndex: 'importance',
                required: true,
            }, {
                title: '监控',
                editable: true,
                inputtype: 'check',
                dataIndex: 'isMonitor',
            }, {
                title: '成组显示',
                editable: true,
                dataIndex: 'groupName',
            }, {
                title: '操作',
                dataIndex: 'operate',
            }],
            columns: [{   //参数table列
                title: '#',
                dataIndex: 'index',
                width: '10%',
                render: (text, record) => {
                    return record.key + 1
                }
            }, {
                title: '参数名称',
                dataIndex: 'parameterName',
                width: '25%',
                editable: true,
            }, {
                title: 'Measurement ID',
                dataIndex: 'measurementId',
                width: '30%',
                editable: true,
            }, {
                title: '监控',
                dataIndex: 'isMonitor',
                render: (text, record) => {
                    return <Checkbox disabled defaultChecked={ Boolean(record.isMonitor) } />
                },
                editable: true,
            }, {
                title: '组名',
                dataIndex: 'groupName',
                render: (text, record) => {
                    return record.groupName ? record.groupName : '--'
                },
            }, {
                title: '操作',
                dataIndex: 'operate',
                render: (text, record) => {
                    return <Popconfirm title="确认删除吗?" onConfirm={() => this.deleteParameter(record.parameterId) }>
                      <a>删除</a>
                    </Popconfirm>
                }
            }],
            editingKey:0,
            hideBtn:false,
            measureIdArr:[]
        }
    }
    // 获取设备详情
    getDeviceDetail(id) {
        request({
            url: `/equipment/getEquipment?equipmentCode=${ id }`,
            method: 'GET',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            this.setState({ detail: res.data })
        })
    }
    // 获取设备的参数列表
    getParameterList(id) {
        request({
            url: `/parameter/getParameterList?equipmentCode=${ id }`,
            method: 'GET',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            const format = res.data.map( (item, key) =>{
                item.key = key;
                return item
            });
            this.setState({
                paramList: format,
                data: format,
                existParamLen: format.length,
                editingKey:''
            },()=>{
                let measureIdArr = [];
                const {data} = this.state
                data.map((item,index)=>{
                    measureIdArr.push(item.measurementId)
                })
                this.setState({measureIdArr})
            })
        })
    }
    // 删除设备
    deleteDevice(id) {
        request({
            url: `/equipment/deleteEquipment?equipmentCode=${ id }`,
            method: 'DELETE',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            this.props.history.go(-1)
        })
    }

    addParameter(param, equipmentCode, callback) {
        request({
            url: `/parameter/addParameterList`,
            method: 'POST',
            data: param.map( (item) => { item.equipmentCode = equipmentCode; return item }),
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

    // 删除参数
    deleteParameter(id) {
        request({
            url: `/parameter/deleteParameter?parameterId=${ id }`,
            method: 'DELETE',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            this.initParameterList();
        })
    }

    getRowItem(key) {
        const {measureIdArr} = this.state
        const newMid=this.mID.filter((item,index)=>{
            if(measureIdArr.indexOf(JSON.stringify(index))===-1 ){
                return true
            }
        })
        return {
            key: key,
            parameterName: '',
            measurementId: newMid[0].key,
            unit: '',
            importance: '0',
            isMonitor: true,
            groupName: ''
        }
    }

    getMeasureID() {
        let id = ['extrusion_speed', 'screw_speed', 'traction_speed', 'melt_temperature', 'melt_pressure'];
        id.forEach( (item, key) => {
            id[key] = <Option key={ key }>{ item }</Option>
        } )
        for(let i = 0; i <= 19; i++) {
            id.push(<Option key={i+5}>{ 'temperature' + i }</Option>)
        }
        return id
    }

    // 添加参数行
    addRow(e) {
        e && e.preventDefault();
        const { data } = this.state;
        this.setState({
            data: [...data, this.getRowItem(data.length)],
        },()=>{
            this.setState({editingKey:this.state.data.length-1,hideBtn:true})
        });
    }

    // 删除参数行
    deleteRow(key) {
        let { data } = this.state;
        const index = data.findIndex((item) => key === item.key);
        data.splice(index, 1);
        this.setState({ data: [...data] });
    }

    initParameterList() {
        const { id } = this.state;
        this.getParameterList(id);  //设备参数
    }

    componentDidMount() {
        const { id } = this.state;
        this.getDeviceDetail(id); // 设备详情
        this.initParameterList();  //设备参数
    }
    // _changeMode = (e)=> {
    //     this.setState({mode:0})
    // }
    updateParameter(param, callback) {
        request({
            url: `/parameter/updateParameter`,
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
    _setDataSource = (data,editingKey)=> {
        // 模拟添加成功前台添加
        this.setState({data,editingKey:''})
        // 添加和更新，去请求刷新下measureIdArr
        const param = {},oneArr = []
        const newData = data[editingKey]
        param.equipmentCode=newData.equipmentCode
        param.groupName=newData.groupName
        param.importance=newData.importance
        param.isMonitor=newData.isMonitor
        param.measurementId=newData.measurementId
        param.parameterId=newData.parameterId
        param.parameterName=newData.parameterName
        param.unit=newData.unit
        oneArr.push(param)
        this.updateParameter(oneArr)
    }
    _hideBtn = (type)=> {
        if(type==='show'){
            this.setState({hideBtn:false})
        }else{
            this.setState({hideBtn:true})
        }
    }
    render() {
        const {columns, columns_mode1, detail, paramList, mode, data, hideBtn,measureIdArr } = this.state;
        return (
            <div className="create-device-page">
              <div className="fixed-panel">
                <Breadcrumb>
                  <Breadcrumb.Item><a href="#" onClick={ (e) => { this.props.history.goBack() } }>管理设备</a></Breadcrumb.Item>
                  <Breadcrumb.Item>设备</Breadcrumb.Item>
                </Breadcrumb>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                  <h1>{ detail.equipmentName }</h1>
                  <div className="btn-group">
                    <Button onClick={ () => this.setState({ mode: 1 }) } type="primary">编辑</Button>
                      {/* <Popconfirm
                  title="确定删除该设备?"
                  onConfirm={ () => { this.deleteDevice(id) }  }
                  okText="确定"
                  cancelText="取消"
                >
                  <Button>删除</Button>
                </Popconfirm> */}
                  </div>
                </div>
                <div className="info">
                  <div style={{ width: '80px', height: '80px', background: '#dcdcdc', marginRight: '20px' }}>
                      { detail.picture && detail.picture !== 'null' ? <img alt={ detail.picture } src={ detail.picture } style={{ width: '100%' }} /> : null }
                  </div>
                  <div>
                    <div style={{marginBottom: '20px'}}><span>类型：</span>{ detail.equipmentType }</div>
                    <div><span>编码：</span>{ detail.equipmentCode }</div>
                  </div>
                </div>
              </div>
              <div style={{ height: 'calc(100% - 198px)', overflowY: 'auto' }}>
                <div className="title">基础信息</div>
                <section className="basic-info">
                  <div className="item">
                    <div>车间:</div>
                      { detail.workshop ? detail.workshop : '--' }
                  </div>
                  <div className="item">
                    <div>制造商:</div>
                      { detail.vendor ? detail.vendor : '--' }
                  </div>
                  <div className="item">
                    <div>型号:</div>
                      { detail.model ? detail.model: '--' }
                  </div>
                  <div className="item">
                    <div>序列号:</div>
                      { detail.serialNumber ? detail.serialNumber : '--' }
                  </div>
                  <div className="item">
                    <div>出厂日期:</div>
                      { detail.deliverDate ? formatterYMD(detail.deliverDate) : '--' }
                  </div>
                  <div className="item">
                    <div>入厂日期：</div>
                      { detail.receiptDate ? formatterYMD(detail.receiptDate) : '--' }
                  </div>
                </section>
                <div className="title">设备参数</div>
                <div className="main-panel">
                  <div className="operate">
                    <span>参数列表 ({ paramList.length })</span>
                      { mode === 1 ? <div>
                        <a style={{ marginRight: '20px' }} disabled={hideBtn||measureIdArr.length==this.mID.length} onClick={ (e) => { this.addRow(e) } } href="#">添加一行</a>
                      </div>: '' }
                  </div>
                    { mode === 1 ?
                        <EditableTable hideBtn={this._hideBtn} editingKey={this.state.editingKey} setDataSource={this._setDataSource}  dataSource={ data } columns={ columns_mode1 }></EditableTable> :
                        <Table pagination={false} dataSource={ paramList } columns={ columns } /> }
                </div>
              </div>
            </div>
        );
    }
}

export default DeviceDetail;