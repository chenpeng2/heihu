import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ParetoChart from 'component/charts/pareto'
import Dashboard from 'component/charts/dashboard'
import PieChart from 'component/charts/pie'
import LineChart from 'component/charts/line'
import { message } from 'antd'
import  moment from 'moment'
import request from 'utils/urlHelpers'
class ReportPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            wheelNum: '', //X光检测轮毂数量
            wheelScrapPercent: '', //X光检测报废率
            wheelScrap: '', //X光检测轮毂报废数量
            wheelScrapPareto: {}, //X光检测轮毂报废数量
            wheelScrapPie: [], //报废原因饼状图
            wheelScrapTrend: [], //报废数量趋势折线图
        }
    }
    componentDidMount(){
        this.refreshData()
    }
    refreshData = () => {
        const _this = this
        Promise.all(
            [
                _this.getWheelNum(), //X光检测轮毂数量
                _this.getWheelScrapPercent(), //X光检测报废率
                _this.getWheelScrap(), //X光检测轮毂报废数量
                _this.getWheelScrapPareto(), //报废累计数量帕累托图
                _this.getWheelScrapPie(), //报废原因饼状图
                _this.getWheelScrapTrend() //报废数量趋势折线图
            ]
        ).then(res => {

        }).catch((error) => {
            message.error('数据请求异常！')
        })
    }

    //过滤前面有没有&
    filterUrl = (url) => {
        let Urls = url;
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    getWheelNum = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheel?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelNum: res.data})
            }
        })
    }
    getWheelScrapPercent = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrapPercent?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelScrapPercent: res.data})
            }
        })
    }
    getWheelScrap = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrap?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelScrap: res.data})
            }
        })
    }

    getWheelScrapPareto = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrapPareto?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelScrapPareto: res.data,isWheelScrapPareto:true})
            }
        })
    }

    getWheelScrapPie = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrapPie?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelScrapPie: res.data,isWheelScrapPie:true})
            }
        })
    }
    getWheelScrapTrend = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrapTrend?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelScrapTrend: res.data,isWheelScrapTrend:true})
            }
        })
    }
    render() {
        const { wheelNum, wheelScrapPercent, wheelScrap, wheelScrapPareto, wheelScrapPie, wheelScrapTrend,
            isWheelScrapPareto,isWheelScrapPie,isWheelScrapTrend} = this.state;
        const  nowDate = moment().format('YYYY-MM-DD hh:mm');
        const scrapPercent = wheelScrapPercent ? wheelScrapPercent : 0;
        const qualifiedPercent = wheelScrapPercent ? (1 - wheelScrapPercent) : 0;
        const dashboardList = [{
            name: 'X光检测轮毂数量',
            time: nowDate,
            value: wheelNum?wheelNum:0,
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测合格率',
            time: nowDate,
            value: qualifiedPercent.toFixed(3)*100+'%',
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测轮毂报废数量',
            time: nowDate,
            value: wheelScrap?wheelScrap:0,
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测报废率',
            time: nowDate,
            value: scrapPercent.toFixed(3)*100+'%',
            isImprove: false,
            chanegRange: '10%',
        }]
        return (
            <div>
                <div className="main-panel-light">
                    <Dashboard showArrow = {false}  dashboardList={dashboardList}/>
                    <div className="charts-continer" dir="ltr">
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md10 ms-lg8">
                            <div className="chart-title">
                                报废累计数量帕累托图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <ParetoChart paretoData={wheelScrapPareto} isWheelScrapPareto={isWheelScrapPareto} styleSheet={{ height: '500px', bottom: '120px' }}/>
                        </div>
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md2 ms-lg4">
                            <div className="chart-title">
                                报废原因饼状图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <PieChart wheelScrapPie={wheelScrapPie} isWheelScrapPie={isWheelScrapPie} styleSheet={{ height: '500px' }}/>
                        </div>
                    </div>
                    <div className="charts-continer" dir="ltr">
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                            <div className="chart-title">
                                报废数量趋势折线图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <LineChart wheelScrapTrend={wheelScrapTrend} isWheelScrapTrend={isWheelScrapTrend} styleSheet={{ height: '500px' }}/>
                        </div>
                    </div>
                </div>
            </div>)
    }
}

const mapStateToProps = (state) => {
    return {
        list: state,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(RouteActionCreators, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ReportPage)