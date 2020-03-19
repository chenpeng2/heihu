import React from 'react'
//引入路由
import {Route, Switch, Redirect} from 'react-router-dom'
//设备
import DeviceList from 'pages/device/list'
// import DeviceCreate from 'pages/device/create'
import DeviceDetail from 'pages/device/detail'

import ProductMessMaintenance from 'pages/productMessMaintenance/index' //产品信息维护
import productMessDetail from 'pages/productMessMaintenance/detail'
// import ProductMessCreate from 'pages/productMessMaintenance/create'

import ParamStandMaintenance from 'pages/paramStandMaintenance/index' //参数标准维护
import ParamStandCreate from 'pages/paramStandMaintenance/create';
import ParamStandDetail from 'pages/paramStandMaintenance/detail'

// import ViewParamStandMaintenance from 'pages/paramStandMaintenance/viewPage/index' //参数标准维护--viewPage
// import EditParamStandMaintenance from 'pages/paramStandMaintenance/editPage/index' //参数标准维护--editPage
import AbnormalStatistics from 'pages/abnormalStatistics/index' //异常参数统计
import ParamShow from 'pages/abnormalStatistics/paramShow' //异常参数统计--参数呈现
import AbnormalList from 'pages/abnormalStatistics/abnormalList' //异常列表
import Reason from 'pages/abnormalStatistics/reason' //异常原因
import AlertLog from 'pages/abnormalStatistics/alertLog' //告警记录
import DeviceParams from 'pages/abnormalStatistics/deviceParams' //异常设备参数分析
import DeviceParamsDetail from 'pages/abnormalStatistics/deviceParamsDetail' //异常设备参数分析详情
import RealTimeMonitoring from 'pages/abnormalStatistics/realTimeMonitoring' //异常设备参数分析监控
import EquipmentMonitoring from 'pages/equipmentMonitoring' //通知--设备监控
import '@src/static/style/index.less' //公共样式
class ContentMain extends React.Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route exact path="/device" component={DeviceList} />
                    {/* <Route exact path="/device/:type/:id" component={DeviceCreate} /> */}
                    <Route exact path="/device/:id" name="deviceDetail" component={DeviceDetail} />

                    <Route exact path="/product" component={ProductMessMaintenance} />
                    <Route exact path="/product/:id" component={productMessDetail} />
                    {/* <Route exact path="/product/:type/:id" component={ProductMessCreate} /> */}

                    <Route exact path="/standard" component={ParamStandMaintenance} />
                    <Route exact path="/standard/:type/:id" component={ParamStandCreate} />
                    <Route exact path="/standard/params/:equipID/:productID" component={ParamStandDetail} />

                    {/* <Route path="/paramStandMaintenance/editPage" component={EditParamStandMaintenance} /> */}
                    {/* <Route path="/paramStandMaintenance/viewPage" component={ViewParamStandMaintenance} /> */}
                    {/* <Route path="/paramStandMaintenance" component={ParamStandMaintenance} /> */}
                    {/*异常参数页面*/}
                    <Route path="/abnormalStatistics/paramShow" component={ParamShow} />
                    <Route path="/abnormalStatistics/abnormalList" component={AbnormalList} />
                    <Route path="/abnormalStatistics/reason" component={Reason} />
                    <Route path="/abnormalStatistics/alertLog" component={AlertLog} />
                    <Route path="/abnormalStatistics/deviceParams" component={DeviceParams} />
                    <Route path="/abnormalStatistics/deviceParamsDetail" component={DeviceParamsDetail} />
                    <Route path="/abnormalStatistics/realTimeMonitoring" component={RealTimeMonitoring} />
                    <Route path="/abnormalStatistics" component={AbnormalStatistics} />
                    {/*通知-设备监控*/}
                    <Route path="/equipmentMonitoring" component={EquipmentMonitoring} />
                    <Redirect path="/" to="/device" />
                </Switch>
            </div>
        )
    }
}

export default ContentMain