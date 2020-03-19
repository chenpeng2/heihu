import React, { PureComponent } from 'react';
import { Form, Input, Select, Button, Table, Icon, Affix, Tabs, Spin, Empty } from 'antd';
import Mock from 'mockjs';
import request from 'util/http'
import Moment from 'moment'
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

class RealTimeMonitoring extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            workShop:'0',
            devices:[],
            devicesParams:[],
            isLoading:true,
            workShopArr:[]
        }
    }
    componentDidMount(){
        this._getWorkShop()
        const parmas={
            equipmentCode:'',
            equipmentName:'',
            equipmentType:'',
            model:'',
            serialNumber:'',
            vendor:'',
            workshop:'0'
        }
        this._getDevices(parmas)
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
            this.setState({workShopArr:res.data})
        })
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
                        // url: `/parameter/getParameterList?equipmentCode=${equipmentCode}`,
                        method: 'GET',
                    }).then( res1 => {
                        if(!res1 || res1.code !== 0) {
                            return
                        }
                        newA.push(res1.data)
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
    tabChange(index){
        this.setState({workShop:index},()=>{
            const params = {
                equipmentCode:'',
                equipmentName:'',
                equipmentType:'',
                model:'',
                serialNumber:'',
                vendor:'',
                workshop:index
            }
            this._getDevices(params)
        })
    }
    //点击进入设备参数页
    toDeviceParamsDetail(item) {
        this.props.history.push({pathname:'/abnormalStatistics/deviceParamsDetail',state:{tabIndex:0,equipmentItem:item}})
    }
    getList = (devicesParams,index)=> {
            devicesParams[index] && devicesParams[index].map((item,index)=>{
                return <li className="flex-space-between"><div>{item.parameterName}</div><div>9</div></li>
            })
    }
    render() {
        const {workShop,devices, devicesParams, isLoading, workShopArr}=this.state;
        return (
            <div className="param-stand-maintenance real-time-monitoring">
                <div className="header flex-space-between">
                    <div className="lef">
                        <div className="l">
                            <span>{devices.length}</span>
                            <span>全部设备</span>
                        </div>
                        <div className="tabs flex-flex-start">
                            {
                                workShopArr.length&&workShopArr.map((item,index)=>{
                                    return <div key={index} className={workShop==item?"item active":"item"} onClick={()=>this.tabChange(item)}>
                                        <p><i className="sap-icon icon-factory"></i><span className="badge">8</span></p>
                                        <span>{index===0?"车间A":"车间B"}</span>
                                    </div>
                                })
                            }
                        </div>
                    </div>
                    <div className="rig">
                        {Moment(new Date()).format('hh:mm DD-MM-YYYY')}
                    </div>
                </div>
                <div className="contents clearfix">

                        <div>
                            {devices.length>0 && devices.map((item,index)=>{
                                return <div key={index} className="item float-lef" onClick={()=>this.toDeviceParamsDetail(item)}>
                                    <div className="card-header flex-flex-start">
                                        <div className="avator">
                                            <img src={item.picture} alt="无图"/>
                                        </div>
                                        <div>
                                            <p>{item.equipmentName}</p>
                                            <p>生产订单：<span>{item.serialNumber}</span></p>
                                        </div>
                                    </div>
                                    <div className="content">
                                        <div className="list-header flex-space-between">
                                            <div>参数类型</div>
                                            <div>异常次数</div>
                                        </div>
                                        <div className="list">
                                            <ul>
                                                {
                                                    (devicesParams.length > 0 && devicesParams[index] && devicesParams[index].length > 0)?
                                                    devicesParams[index].map((item,index)=>(
                                                        <li key={index} className="flex-space-between"><div>{item.parameterName}</div><div>9</div></li>
                                                    )):
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
