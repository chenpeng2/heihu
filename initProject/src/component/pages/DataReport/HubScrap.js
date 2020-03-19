import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ParetoChart from 'component/charts/pareto'
import Dashboard from 'component/charts/dashboard'
import PieChart from 'component/charts/pie'
import LineChart from 'component/charts/line'
import { Select, DatePicker, Affix, message } from 'antd'
import { PrimaryButton } from 'office-ui-fabric-react';
import HeatMapChart from 'component/charts/heatMap'
import  moment from 'moment'
import request from 'utils/urlHelpers'
const { Option } = Select;
// const viewList = [{
//     name: '标准视图',
//     id: 1,
//     isDefault: false,
// },{
//     name: '视图1',
//     id: 2,
//     isDefault: false,
// },{
//     name: '视图2',
//     id: 3,
//     isDefault: false,
// }]


class ReportPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            // currentView: '标准视图',
            isShowFilter: true,
            isPingFilters: false,

            scrapReason: '',
            startTime: '',
            endTime: '',
            wheelTypeData: [], //轮毂类型数据
            wheelType: '', //轮毂类型
            wheelNum: '', //X光检测轮毂数量
            wheelScrapPercent: '', //X光检测报废率
            wheelScrap: '', //X光检测轮毂报废数量
            wheelScrapPareto: {}, //X光检测轮毂报废数量
            wheelScrapPie: [], //报废原因饼状图
            wheelScrapTrend: [], //报废数量趋势折线图
            paretoData: [], //报废分布分析
            headMapName:{
                xDimension: 1
            },
            wheelScrapReason: [], //获取报废原因
        }
    }
    // changeView(e,view) {
    //     e.stopPropagation()
    //     $('.ant-dropdown').addClass('ant-dropdown-hidden')
    //     if (view && view.name) {
    //         this.setState({
    //             currentView: view.name,
    //         })
    //     }
    //
    // }
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
                _this.getWheelScrapTrend(), //报废数量趋势折线图
                _this.getWheelType(), //获取轮毂型号
                _this.getWheelScrapDistribution(), //报废分布分析
                _this.getWheelScrapReason() //报废分布分析
            ]
        ).then(res => {

        }).catch((error) => {
            message.error('数据请求异常！')
        })
    }
    getWheelScrapReason = (params) => {
        return request({
            url: `/wheelQuery/wheelScrapReason`,
            method: 'GET'
        }).then(res => {
            if(res && res.code==0){
                this.setState({wheelScrapReason: res.data})
            }
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
    getWheelScrapDistribution = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrapDistribution?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code==0){
                this.setState({paretoData: res.data, isParetoData:true})
            }
        })
    }
    getWheelType = () => {
        return request({
            url: `/wheelQuery/wheelType`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                this.setState({wheelTypeData: res.data})
            }
        })
    }
    updateData = (params) => {
        const _this = this
        Promise.all(
            [
                _this.getWheelNum(params), //X光检测轮毂数量
                _this.getWheelScrapPercent(params), //X光检测报废率
                _this.getWheelScrap(params), //X光检测轮毂报废数量
                _this.getWheelScrapPareto(params), //报废累计数量帕累托图
                _this.getWheelScrapPie(params), //报废原因饼状图
                _this.getWheelScrapTrend(params), //报废数量趋势折线图
                _this.getWheelType(params), //获取轮毂型号
                _this.getWheelScrapDistribution() //报废分布分析
            ]
        ).then(res => {

        }).catch((error) => {
            message.error('数据请求异常！')
        })
    }
    getWheelNum = (params) => {
        const scrapReason = (params && params.scrapReason) ? `scrapReason=${params.scrapReason}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheel?${scrapReason}${pams}`,
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
                this.setState({wheelScrapPareto: res.data, isWheelScrapPareto:true})
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
                this.setState({wheelScrapPie: res.data, isWheelScrapPie:true})
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
                this.setState({wheelScrapTrend: res.data, isWheelScrapTrend:true})
            }
        })
    }
    onChange(val) {
        this.setState({
            number: val,
        })
    }

    onChangeReason(val) {
        this.setState({
            scrapReason: val,
        })
    }

    submitSearch() {
        let { scrapReason, startTime, endTime, wheelType } = this.state
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        const wheelProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : (startTime || endTime)
        const searchData = {
            scrapReason,
            wheelProcessDatetime,
            wheelType
        }
        this.updateData(searchData)
    }

    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter, isPingFilters } = this.state
        if(isPingFilters){return}
        this.setState({
            isShowFilter: !isShowFilter
        })
    }

    pingFilters() {
        const { isPingFilters } = this.state
        this.setState({
            isPingFilters: !isPingFilters,
        })
    }

    stopPagation = (event) => {
        var e=event || window.event;
        if (e && e.stopPropagation){
            e.stopPropagation();
        } else{
            e.cancelBubble=true;
        }
    }
    onStartChange = value => {
        this.setState({
            startTime: value,
        });
    }
    onEndChange = value => {
        this.setState({
            endTime: value,
        });
    }
    disabledStartDate = startTime => {
        const { endTime } = this.state;
        if (!startTime || !endTime) {
            return false;
        }
        return startTime.valueOf() > endTime.valueOf();
    };

    disabledEndDate = endTime => {
        const { startTime } = this.state;
        if (!endTime || !startTime) {
            return false;
        }
        return endTime.valueOf() <= startTime.valueOf();
    };
    wheelChange = (value) => {
        this.setState({wheelType : value})
    }
    renderFilters() {
        const { isShowFilter, startTime, endTime, wheelTypeData, wheelScrapPareto, isPingFilters,wheelScrapReason, wheelType, scrapReason } = this.state;
        const filterCondition = [{name:'轮毂型号',value:wheelType},
            {name:'起始检测日期',value:startTime?moment(startTime).format('YYYY-MM-DD'):''},
            {name:'结束检测日期',value:endTime?moment(endTime).format('YYYY-MM-DD'):''},
            {name:'报废原因',value:scrapReason}];
        return (
            <div className="subtitle-panel data-report">
                {/*<div className="subtitle-header" onClick={(e)=>this.changeFilter(e)}>*/}
                {/*<Dropdown overlay={menu} trigger={['click']}>*/}
                {/*<a className="ant-dropdown-link" ref="dropdown" href="#" onClick={(e)=>this.handleClick(e)}>*/}
                {/*{this.state.currentView} <Icon type="down" />*/}
                {/*</a>*/}
                {/*</Dropdown>*/}
                {/*<div onClick={this.stopPagation}>*/}
                {/*<PrimaryButton*/}
                {/*allowDisabledFocus={true}*/}
                {/*text="按钮"*/}
                {/*style={{width: 69,height: 26,borderRadius: 4}}*/}
                {/*/>*/}
                {/*<PrimaryButton*/}
                {/*allowDisabledFocus={true}*/}
                {/*text="按钮"*/}
                {/*style={{width: 69,height: 26,borderRadius: 4}}*/}
                {/*/>*/}
                {/*<Icon type="shrink"></Icon>*/}
                {/*</div>*/}
                {/*</div>*/}
                <div className="filter-content" style={{display: isShowFilter ? "flex" : "none"}}>
                    <div className="filter-item">
                        <p className="lable">轮毂型号:</p>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: 180 }}
                            placeholder="请输入轮毂型号"
                            optionFilterProp="children"
                            onChange={this.wheelChange.bind(this)}
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {wheelTypeData.length?
                                wheelTypeData.map((item, index) => <Option key={index} value={item}>{item}</Option>)
                                :null}
                        </Select>
                    </div>
                    <div className="filter-item">
                        <p className="lable">起始检测日期:</p>
                        <DatePicker
                            disabledDate={this.disabledStartDate}
                            format="YYYY-MM-DD"
                            value={startTime?startTime:null}
                            placeholder="Start"
                            onChange={this.onStartChange}
                        />
                    </div>
                    <div className="filter-item">
                        <p className="lable">结束检测日期:</p>
                        <DatePicker
                            disabledDate={this.disabledEndDate}
                            format="YYYY-MM-DD"
                            value={endTime?endTime:null}
                            placeholder="End"
                            onChange={this.onEndChange}
                        />
                    </div>
                    <div className="filter-item">
                        <p className="lable">报废原因:</p>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: 180 }}
                            placeholder="请输入报废原因"
                            optionFilterProp="children"
                            onChange={this.onChangeReason.bind(this)}
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {wheelScrapReason?
                                wheelScrapReason.map((item, index) => <Option key={index} value={item}>{item}</Option>)
                                :null}
                        </Select>
                    </div>
                    <PrimaryButton
                        allowDisabledFocus={true}
                        text="更新"
                        onClick={this.submitSearch.bind(this)}
                    />
                </div>
                <div className="bottom-botton-panel">
                    <div className="button-panel">
                        <div className="button" onClick={(e)=>this.changeFilter(e)}>
                            {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}

                        </div>
                        <div className="button" onClick={this.pingFilters.bind(this)}>
                            {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { isPingFilters, wheelNum, wheelScrapPercent, wheelScrap, wheelScrapPareto, wheelScrapPie, wheelScrapTrend, paretoData, headMapName,
            isWheelScrapPareto,isWheelScrapPie,isWheelScrapTrend,isParetoData} = this.state;
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
                { isPingFilters ?
                    <Affix offsetTop={0}>
                        {this.renderFilters()}
                    </Affix> :
                    <div> { this.renderFilters()} </div>
                }

                <div className="main-panel-light">
                    <Dashboard showArrow = {false}  dashboardList={dashboardList}/>
                    <div className="charts-continer" dir="ltr">
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md10 ms-lg8">
                            <div className="chart-title">
                                报废累计数量帕累托图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <ParetoChart paretoData={wheelScrapPareto} isWheelScrapPareto={isWheelScrapPareto} styleSheet={{ height: '500px', bottom: '120px'}}/>
                        </div>
                        <div className="chart-item-continer ms-Grid-col ms-sm2 ms-md2 ms-lg4">
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
                    <div className="charts-continer" dir="ltr">
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                            <div className="chart-title">
                                报废分布
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <HeatMapChart paretoData={paretoData} isParetoData={isParetoData} headMapName={headMapName} styleSheet={{ height: '500px' }}/>
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
