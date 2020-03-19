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
class ReportPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowFilter: true,
            isPingFilters: false,

            defectType: '',
            startTime: '',
            endTime: '',
            wheelTypeData: [], //轮毂类型数据
            wheelType: '', //轮毂类型
            wheelImage: '', //X光检测图片数量
            wheelDefectPercent: '', //X光检测图片缺陷比例
            wheelDefectImage: '', //X光检测图片缺陷数量
            wheelDefectPareto: {}, //缺陷累计数量帕累托图
            wheelDefectPie: [], //缺陷原因饼状图
            wheelDefectTrend: [], //缺陷数量趋势折线图
            paretoData: [], //缺陷分布分析
            headMapName: {},
            wheelDefectTypeData: [], //缺陷类型数据
        }
    }
    componentDidMount(){
        this.refreshData()
    }
    refreshData = () => {
        const _this = this
        Promise.all(
            [
                _this.getWheelImage(), //X光检测图片数量
                _this.getWheelDefectPercent(), //X光检测图片缺陷比例
                _this.getWheelDefectImage(), //X光检测图片缺陷数量
                _this.getWheelDefectPareto(), //缺陷累计数量帕累托图
                _this.getWheelDefectPie(), //缺陷原因饼状图
                _this.getWheelDefectTrend(), //缺陷数量趋势折线图
                _this.getWheelType(), //获取轮毂型号
                _this.getWheelDefectDistribution(), //缺陷分布分析
                _this.getWheelDefectType() //获取缺陷类型数据
            ]
        ).then(res => {
            this.setState({
                setDefaultSelect: false,
            })
        }).catch((error) => {
            message.error('数据请求异常！')
        })
    }
    getWheelDefectType = () => {
        return request({
            url: `/wheelQuery/wheelDefectType`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                this.setState({wheelDefectTypeData: res.data})
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
    getWheelDefectDistribution = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelDefectDistribution?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                this.setState({paretoData: res.data,isParetoData:true})
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
                _this.getWheelImage(params), //X光检测图片数量
                _this.getWheelDefectPercent(params), //X光检测图片缺陷比例
                _this.getWheelDefectImage(params), //X光检测图片缺陷数量
                _this.getWheelDefectPareto(params), //缺陷累计数量帕累托图
                _this.getWheelDefectPie(params), //缺陷原因饼状图
                _this.getWheelDefectTrend(params), //缺陷数量趋势折线图
                _this.getWheelType(params), //获取轮毂型号
                _this.getWheelDefectDistribution() //缺陷分布分析
            ]
        ).then(res => {

        }).catch((error) => {
            message.error('数据请求异常！')
        })

    }
    getWheelImage = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelImage?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelImage: res.data})
            }
        })
    }
    getWheelDefectPercent = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelDefectPercent?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelDefectPercent: res.data})
            }
        })
    }
    getWheelDefectImage = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelDefectImage?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelDefectImage: res.data})
            }
        })
    }
    getWheelDefectPareto = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelDefectPareto?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelDefectPareto: res.data,isWheelDefectPareto:true})
            }
        })
    }
    getWheelDefectPie = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelDefectPie?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelDefectPie: res.data,isWheelDefectPie:true})
            }
        })
    }
    getWheelDefectTrend = (params) => {
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pams = this.filterUrl(`${defectType}${imageProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelDefect/wheelDefectTrend?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res.code==0){
                this.setState({wheelDefectTrend: res.data,isWheelDefectTrend:true})
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
            defectType: val,
        })
    }

    submitSearch() {
        let { defectType, startTime, endTime, wheelType } = this.state
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        const imageProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : (startTime || endTime)
        const searchData = {
            defectType,
            imageProcessDatetime,
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
        const { isShowFilter, startTime, endTime, wheelTypeData, wheelDefectPareto, isPingFilters,wheelDefectTypeData, wheelType, defectType } = this.state;
        const filterCondition = [{name:'轮毂型号',value:wheelType},
            {name:'起始检测日期',value:startTime?moment(startTime).format('YYYY-MM-DD'):''},
            {name:'结束检测日期',value:endTime?moment(endTime).format('YYYY-MM-DD'):''},
            {name:'缺陷类型',value:defectType}];
        return (
            <div className="subtitle-panel data-report">
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
                        <p className="lable">缺陷类型:</p>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: 180 }}
                            placeholder="请输入缺陷类型"
                            optionFilterProp="children"
                            onChange={this.onChangeReason.bind(this)}
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {wheelDefectTypeData?
                                wheelDefectTypeData.map((item, index) => <Option key={index} value={item}>{item}</Option>)
                                :null}
                        </Select>
                    </div>
                    <PrimaryButton
                        allowDisabledFocus={true}
                        text="更新"
                        onClick={this.submitSearch.bind(this)}
                    />
                </div>
                <div className="filter-content" style={{display: isShowFilter ? "none" : "flex"}}>
                    <div className="filter-item" style={{color:'#666',fontSize: 14}}>
                        筛选条件: {filterCondition.map((item, index) => {
                        return <span key={index}>{item.name+':'+(item.value?item.value:'暂无')};</span>
                    })}
                    </div>
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
        const { isPingFilters, wheelImage, wheelDefectPercent, wheelDefectImage, wheelDefectPareto, wheelDefectPie, wheelDefectTrend, paretoData, headMapName,
            isWheelDefectPareto,isWheelDefectPie,isWheelDefectTrend,isParetoData} = this.state;
        const  nowDate = moment().format('YYYY-MM-DD hh:mm');
        const scrapPercent = wheelDefectPercent ? wheelDefectPercent : 0;
        const qualifiedPercent = wheelDefectPercent ? (1 - wheelDefectPercent) : 0;
        const dashboardList = [{
            name: 'X光检测图片数量',
            time: nowDate,
            value: wheelImage?wheelImage:0,
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测图片合格率',
            time: nowDate,
            value: qualifiedPercent.toFixed(3)*100+'%',
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测图片缺陷数量',
            time: nowDate,
            value: wheelDefectImage?wheelDefectImage:0,
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测图片缺陷比例',
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
                                缺陷累计数量帕累托图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <ParetoChart paretoData={wheelDefectPareto} isWheelScrapPareto={isWheelDefectPareto} styleSheet={{ height: '500px' }}/>
                        </div>
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md2 ms-lg4">
                            <div className="chart-title">
                                缺陷原因饼状图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <PieChart wheelScrapPie={wheelDefectPie} isWheelScrapPie={isWheelDefectPie} styleSheet={{ height: '500px' }}/>
                        </div>
                    </div>
                    <div className="charts-continer" dir="ltr">
                        <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                            <div className="chart-title">
                                缺陷数量趋势折线图
                                <p className="time-text">{nowDate}</p>
                            </div>
                            <LineChart wheelScrapTrend={wheelDefectTrend} isWheelScrapTrend={isWheelDefectTrend} styleSheet={{ height: '500px' }}/>
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