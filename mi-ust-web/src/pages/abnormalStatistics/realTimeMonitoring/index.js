import React, { PureComponent } from 'react';
import { Spin, Empty } from 'antd';
import request from 'util/http'
class RealTimeMonitoring extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            devices:[],
            devicesParams:[],
            isLoading:true,
        }
    }
    componentDidMount(){
        this._getWorkShop()
    }
    //过滤前面有没有&
    filterUrl = (url) => {
        let Urls = url.trim()
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    // 获取车间
    _getWorkShop = (parma)=> {
        request({
            url: `/equipment/getWorkshopList`,
            method: 'GET',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            this.setState({workShopArr:res.data},()=>{
                const parmas={
                    equipmentCode:'',
                    equipmentName:'',
                    equipmentType:'',
                    model:'',
                    serialNumber:'',
                    vendor:'',
                    workshop:''
                }
                this._getDevices(parmas)
            })
        })
    }
    compare = (property)=> {
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value1 - value2;
        }
    }
    // 获取设备列表
    _getDevices = (parma)=> {
        const params=parma
        const equipmentCode = (params && params.equipmentCode) ? `equipmentCode=${params.workshop}` : '';
        const equipmentName = (params && params.equipmentName) ? `&equipmentName=${params.equipmentName}` : '';
        const equipmentType = (params && params.equipmentType) ? `&equipmentType=${params.equipmentType}` : '';
        const model = (params && params.model) ? `&model=${params.model}` : '';
        const serialNumber = (params && params.serialNumber) ? `&serialNumber=${params.serialNumber}` : '';
        const vendor = (params && params.vendor) ? `&vendor=${params.vendor}` : ''
        const workshop = (params && params.workshop) ? `&workshop=${params.workshop}` : ''
        const pams = this.filterUrl(`${equipmentCode}${equipmentName}${equipmentType}${model}${serialNumber}${vendor}
        ${workshop}`)
        let newA=[];
        request({
            url: `/equipment/getEquipmentList?${pams}`,
            method: 'GET',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            this.setState({devices:res.data},()=>{
                //现在该获取对应的设备参数
                // 获取参数集合
                res.data.map((item,index)=>{
                    request({
                        url: `/parameter/getParameterList?equipmentCode=${item.equipmentCode}`,
                        method: 'GET',
                    }).then( res1 => {
                        if(!res1 || res1.code !== 0) {
                            return
                        }
                        newA.push({data:res1.data,index:index})
                        newA = newA.sort(this.compare('index'))
                        setTimeout(()=>{
                            this.setState({devicesParams:newA})
                            if(index==this.state.devices.length-1){
                                this.setState({isLoading:false})
                            }
                        },200)
                    })
                })
            })
        })
    }
    //点击进入设备参数页
    toDeviceParamsDetail(measurementId,item) {
        if(!measurementId) return
        this.props.history.push({pathname:'/abnormalStatistics/abnormalList',state:{tabIndex:measurementId,equipmentItem:item}})
    }
    getList = (devicesParams,index)=> {
        devicesParams[index] && devicesParams[index].map((item,index)=>{
            return <li className="flex-space-between"><div>{item.parameterName}</div><div>9</div></li>
        })
    }
    render() {
        const { devices, devicesParams, isLoading }=this.state;
        return (
            <div className="param-stand-maintenance real-time-monitoring">
                {/* <div className="header flex-space-between">
                    <div className="lef">
                        <div className="l">
                            <span>{devices.length}</span>
                            <span>全部设备</span>
                        </div>
                    </div>
                </div> */}
                <div className="contents clearfix">
                    <div className="l">
                        <span>{devices.length}</span>
                        <span>全部设备</span>
                    </div>
                    <div>
                        {devices.length>0 && devices.map((item,index)=>{
                            return <div key={index} className="item float-lef">
                                <div className="head">
                                    <div className="card-header flex-flex-start" onClick={()=>this.toDeviceParamsDetail(devicesParams[index].data[0] && devicesParams[index].data[0].measurementId, item)}>
                                        {/* <div className="avator">
                                        <img src={item.picture} alt="无图"/>
                                    </div> */}
                                        <div>
                                            <p>{item.equipmentName}</p>
                                            {/*<p>生产订单：<span>{item.serialNumber}</span></p>*/}
                                        </div>
                                    </div>
                                    <div className="list-header flex-space-between">
                                        <div>参数类型</div>
                                        {/*<div>异常次数</div>*/}
                                    </div>
                                </div>
                                <div className="content">
                                    <div className="list">
                                        <ul>
                                            {
                                                (devicesParams.length == devices.length && devicesParams.length > 0 && devicesParams[index].data.length > 0)?
                                                    devicesParams[index].data.map((itm,index)=>{
                                                        return <li key={index} className="flex-space-between" onClick={()=>this.toDeviceParamsDetail(itm.measurementId,item)}>
                                                            <div>{itm.parameterName}</div>
                                                            <div>{itm.measurementId}</div>
                                                        </li>
                                                    }):
                                                    (isLoading?<Spin size="large" />:<div style={{marginTop:120}}><Empty/></div>)
                                            }
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
export default RealTimeMonitoring;
