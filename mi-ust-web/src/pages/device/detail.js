import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD } from 'util/index'

import { Table, Breadcrumb, Button, message, Select, Popconfirm, Checkbox } from 'antd';
import EditTable from 'components/antdEditTable/editTable'
const { Option } = Select

class DeviceDetail extends PureComponent {
    constructor(props) {
        super(props)
        const params = this.props.match.params;  // url params
        const mID = this.getMeasureID();
        this.mID = mID;
        const level = { '0': '重要', '1': '次要', '2': '一般' };
        this.state = {
            mode: 0,  // 1编辑模式
            id: params.id, // 设备编号
            detail: {},   // 设备数据
            existParamLen: 0,
            paramList: [],
            isFetching: true,
            data: [],
            columns: [
                {
                    title: '参数名称',
                    field: 'parameterName',
                    disabled: true,
                    isMust: false,
                    sorting: false,
                    editComponent: props => (
                        <input
                            value={props.value}
                            onChange={e => { props.onChange(e.target.value) }}
                        />
                    )
                }, {
                    title: 'Measurement ID',
                    field: 'measurementId',
                    disabled: true,
                    isMust: true,
                    sorting: false,
                    lookup: {},
                }, {
                    title: '参数单位',
                    field: 'unit',
                    sorting: false,
                    editComponent: props => (
                        <input
                            value={props.value}
                            onChange={e => { props.onChange(e.target.value) }}
                        />
                    )
                }, {
                    title: '重要程度',
                    field: 'importance',
                    sorting: false,
                    lookup: level
                }
            ],
            editingKey: 0,
            hideBtn: false,
            measureIdArr: []
        }
    }
    // 获取设备详情
    getDeviceDetail(id) {
        request({
            url: `/equipment/getEquipment?equipmentCode=${id}`,
            method: 'GET',
        }).then(res => {
            if (!res || res.code !== 0) {
                return
            }
            this.setState({ detail: res.data })
        })
    }
    // 获取设备的参数列表
    getParameterList(id) {
        request({
            url: `/parameter/getParameterList?equipmentCode=${id}`,
            method: 'GET',
        }).then(res => {
            if (!res || res.code !== 0) {
                return
            }
            const format = res.data.map((item, key) => {
                item.key = key;
                return item
            });
            this.setState({
                paramList: format,
                isFetching: false,
                data: format,
                existParamLen: format.length,
                editingKey: ''
            }, () => {
                let measureIdArr = [];
                const { data } = this.state
                data.map((item, index) => {
                    measureIdArr.push(item.measurementId)
                })
                this.setState({ measureIdArr })
            })
        })
    }
    // 删除设备
    deleteDevice(id) {
        request({
            url: `/equipment/deleteEquipment?equipmentCode=${id}`,
            method: 'DELETE',
        }).then(res => {
            if (!res || res.code !== 0) {
                return
            }
            this.props.history.go(-1)
        })
    }

    getAllMeasurment = () => {
        const { columns } = this.state
        request({
            url: `/parameter/getAllParam`,
            method: 'GET'
        }).then(res => {
            if (res && res.data) {
                const measurementList = res.data
                measurementList.forEach(item => {
                    columns[1].lookup[item] = item
                })
                this.setState({
                    columns,
                })
            }
        })
    }

    addParameter = (param) => {
        const { detail } = this.state
        const { equipmentCode } = detail
        param.equipmentCode = equipmentCode
        if (!param.measurementId) {
            alert('请选择 measurementId 再提交')
            return
        }
        const moduleParam = {
            parameterName:param.parameterName?param.parameterName:'',
            unit:param.unit?param.unit:'',
            importance:param.importance?param.importance:''
        }
        const data = [{ ...param ,...moduleParam}]
        return request({
            url: `/parameter/addParameterList`,
            method: 'POST',
            data,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
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

    // 删除参数
    deleteParameter = (id) => {
        return request({
            url: `/parameter/deleteParameter?parameterId=${id}`,
            method: 'DELETE',
            success: res => {
                if (!res || res.code !== 0) {
                    return
                } else {
                    return res
                }
            },
            error: (err) => {
                message.error('网络请求错误');
            }
        })
    }

    getMeasureID() {
        let id = ['extrusion_speed', 'screw_speed', 'traction_speed', 'melt_temperature', 'melt_pressure'];
        id.forEach((item, key) => {
            id[key] = <Option key={key}>{item}</Option>
        })
        for (let i = 0; i <= 19; i++) {
            id.push(<Option key={i + 5}>{'temperature' + i}</Option>)
        }
        return id
    }

    initParameterList = () => {
        const { id } = this.state;
        this.getParameterList(id);  //设备参数
        this.getAllMeasurment();
    }

    componentDidMount() {
        const { id } = this.state;
        this.getDeviceDetail(id); // 设备详情
        this.initParameterList();  //设备参数
    }

    updateParameter(param) {
        return request({
            url: `/parameter/updateParameter`,
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

    _setDataSource = (data, editingKey) => {
        // 模拟添加成功前台添加
        this.setState({ data, editingKey: '' })
        // 添加和更新，去请求刷新下measureIdArr
        const param = {}, oneArr = []
        const newData = data[editingKey]
        param.equipmentCode = newData.equipmentCode
        param.groupName = newData.groupName
        param.importance = newData.importance
        param.isMonitor = newData.isMonitor
        param.measurementId = newData.measurementId
        param.parameterId = newData.parameterId
        param.parameterName = newData.parameterName
        param.unit = newData.unit
        oneArr.push(param)
        this.updateParameter(oneArr)
    }

    _hideBtn = (type) => {
        if (type === 'show') {
            this.setState({ hideBtn: false })
        } else {
            this.setState({ hideBtn: true })
        }
    }

    render() {
        const { columns, detail, paramList, mode, data, hideBtn, measureIdArr, isFetching } = this.state;
        return (
            <div className="create-device-page">
                <div className="fixed-panel">
                    <Breadcrumb>
                        <Breadcrumb.Item><a href="#" onClick={(e) => { this.props.history.goBack() }}>设备管理</a></Breadcrumb.Item>
                        <Breadcrumb.Item>设备</Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                        <h1>{detail.equipmentName}</h1>
                    </div>
                    <div className="info">
                        <div style={{ height: '80px', background: '#dcdcdc', marginRight: '20px' }}>
                            {detail.picture && detail.picture !== 'null' ? <img alt={'设备图片'} src={detail.picture} style={{ height: '100%' }} /> : <span  style={{ textAlign: 'center', marginTop:'28px', width: '80px', display: 'block' }} >没有图片</span>}
                        </div>
                        <div>
                            <div style={{ marginBottom: '20px' }}><span>类型：</span>{detail.equipmentType}</div>
                            <div><span>编码：</span>{detail.equipmentCode}</div>
                        </div>
                    </div>
                </div>
                <div style={{ height: 'calc(100% - 198px)', overflowY: 'auto' }}>
                    <div className="title">基础信息</div>
                    <section className="basic-info">
                        <div className="item">
                            <div>车间:</div>
                            {detail.workshop ? detail.workshop : '--'}
                        </div>
                        <div className="item">
                            <div>制造商:</div>
                            {detail.vendor ? detail.vendor : '--'}
                        </div>
                        <div className="item">
                            <div>型号:</div>
                            {detail.model ? detail.model : '--'}
                        </div>
                        <div className="item">
                            <div>序列号:</div>
                            {detail.serialNumber ? detail.serialNumber : '--'}
                        </div>
                        <div className="item">
                            <div>出厂日期:</div>
                            {detail.deliverDate ? formatterYMD(detail.deliverDate) : '--'}
                        </div>
                        <div className="item">
                            <div>入厂日期：</div>
                            {detail.receiptDate ? formatterYMD(detail.receiptDate) : '--'}
                        </div>
                    </section>
                    <div className="title">设备参数</div>
                    <div className="main-panel">
                        <EditTable
                            title={"参数列表（" + paramList.length + '）'}
                            hasDefaultDate={true}
                            hasPaging={false}
                            columns={columns}
                            updateData={this.updateParameter}
                            createData={this.addParameter}
                            data={{ list: paramList, isFetching }}
                            deleteData={this.deleteParameter}
                            getTableList={this.initParameterList}
                        >
                        </EditTable>
                    </div>
                </div>
            </div>
        );
    }
}

export default DeviceDetail;