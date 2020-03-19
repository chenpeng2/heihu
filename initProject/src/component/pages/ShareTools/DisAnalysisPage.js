import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ScatterChart from 'component/charts/scatter'
import { Select, DatePicker, Affix, message } from 'antd'
import { PrimaryButton } from 'office-ui-fabric-react';
import  moment from 'moment'
import HeatMapChart from 'component/charts/heatMap'
import request from 'utils/urlHelpers'
const { Option } = Select;
class AnalysisPage extends React.Component {
    UNSAFE_componentWillMount() {
        this.props.history.listen(route => {
          this.props.changeRoute(route.pathname)
        })
    }

    constructor(props) {
        super(props)
        this.state = {
            isShowFilter: true,
            isPingFilters: false,

            timeFilterData: [], //时间筛选器数据
            wheelTypeData: [], //获取轮毂型号
            wheelDefectTypeData: [], //获取缺陷类型

            defectType: '',
            startTime: '',
            endTime: '',
            wheelType: '', //轮毂类型
            xDimension: 1,
            yDimension: 2,
            headMapName:{}
        }
    }
    componentDidMount(){
        this.refreshData()
    }
    refreshData = () => {
        const _this = this
        Promise.all(
            [
                _this.getDetailData(),
                _this.getTimeFilter(), //获取时间筛选器数据
                _this.getWheelType(), //获取轮毂型号
                _this.getwheelDefectTypeData() //获取缺陷类型
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
    getwheelDefectTypeData = () => {
        return request({
            url: `/wheelQuery/wheelDefectType`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                this.setState({wheelDefectTypeData: res.data})
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
    getTimeFilter = () => {
        return request({
            url: `/analysis/timeFilter`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                this.setState({timeFilterData: res.data,isTimeFilterData:true})
            }
        })
    }
    getDetailData = (params) => {
        let { xDimension, yDimension } = this.state;
        const defectType = (params && params.defectType) ? `defectType=${params.defectType}` : ''
        const wheelProcessDatetime = (params && params.wheelProcessDatetime) ? `&wheelProcessDatetime=${params.wheelProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        //如果X轴比Y轴大，那交换
        const xDimens = xDimension > yDimension ? `&xDimension=${yDimension}` : `&xDimension=${xDimension}`
        const yDimens = xDimension > yDimension ? `&yDimension=${xDimension}` : `&yDimension=${yDimension}`
        const pams = this.filterUrl(`${defectType}${wheelProcessDatetime}${wheelType}${xDimens}${yDimens}`)
        return request({
            url: `/analysis/distributionAnalysis?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code==0){
                this.setState({paretoData: res.data,isParetoData:true,headMapName: {xDimension, yDimension}})
            }
        })
    }
    updateData = (params) => {
        const _this = this
        Promise.all(
            [
                _this.getDetailData(params)
            ]
        ).then(res => {

        }).catch((error) => {
            message.error('数据请求异常！')
        })
    }
    submitSearch() {
        let { defectType, startTime, endTime, wheelType, xDimension, yDimension } = this.state
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        const wheelProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : (startTime || endTime)
        const searchData = {
            defectType,
            wheelProcessDatetime,
            wheelType,
            xDimension,
            yDimension
        }
        if(xDimension == yDimension){message.error('X轴和Y轴不能一样!');return}
        this.updateData(searchData)
    }
    onChange(val) {
        this.setState({
            number: val,
        })
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
      onChangeReason(val) {
        this.setState({
            defectType: val,
        })
      }
    renderFilters() {
        const { isShowFilter, startTime, endTime, wheelTypeData, wheelDefectTypeData, isPingFilters, wheelType, defectType } = this.state;
        const filterCondition = [{name:'轮毂型号',value:wheelType},
                {name:'起始检测日期',value:startTime?moment(startTime).format('YYYY-MM-DD'):''},
                {name:'结束检测日期',value:endTime?moment(endTime).format('YYYY-MM-DD'):''},
            {name:'缺陷类型',value:defectType}];
        return (
            <div className="subtitle-panel detail-data">
                <div className="filter-content" style={{display: isShowFilter ? "flex" : "none"}}>
                    <div className="filter-item">
                        <p className="lable">轮毂型号:</p>
                        <Select
                        showSearch
                        allowClear={true}
                        style={{ width: 180 }}
                        placeholder="请输入轮毂型号"
                        optionFilterProp="children"
                        onChange={this.onChange.bind(this)}
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
                            {wheelDefectTypeData.length?
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
                            <img src={require('../../../asstes/images/arrow-blue.png')}/>
                        </div>
                        <div className="button" onClick={this.pingFilters.bind(this)}>
                            {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                        </div>
                    </div>
                </div>
        </div>
        )
    }
    onChangeXAxis(type){
       this.setState({xDimension:type})
    }
    onChangeYAxis(type){
        this.setState({yDimension:type})
    }
    changeTime = (params, type) => {
        if(type == 1){
            //去初始化开始结束时间
            this.setState({startTime:moment(params.xDimension[0]),endTime:moment(params.xDimension[1])})
            return
        }
        let parms = params.batch[0].selected[0].dataIndex;
        if(!parms.length){
            this.setState({startTime: null, endTime: null})
            return
        }
        const dataFirstIndex = parms[0];
        const dataLastIndex = parms.length && parms[parms.length - 1];
        const { timeFilterData } = this.state;
        const startT = timeFilterData.xDimension[dataFirstIndex];
        const endT = timeFilterData.xDimension[dataLastIndex];
        this.setState({startTime: moment(startT), endTime: moment(endT)})
    }

    render() {
        const { isPingFilters, timeFilterData, paretoData, headMapName,isParetoData,isTimeFilterData } = this.state
        const xArr = ['轮毂类型','缺陷类型','报废原因','缺陷所在区域'], yArr = ['轮毂类型','缺陷类型','报废原因','缺陷所在区域','最大面积','最大长度','滑动评价区域最大缺陷面积']
        return (
        <div>
            { isPingFilters ? 
            <Affix offsetTop={0}>
                {this.renderFilters()}
            </Affix> :  
            <div> { this.renderFilters()} </div>
            }
           
            <div className="main-panel-light analysis">
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <div className="chart-title clearfix">
                            <div className="flt-left">
                                X轴:
                                <Select
                                    showSearch
                                    style={{ width: 180, height:26, margin: '0 15px' }}
                                    placeholder={xArr[0]}
                                    optionFilterProp="children"
                                    onChange={this.onChangeXAxis.bind(this)}
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {xArr.map((item,index)=>
                                         <Option key={index} value={index+1}>{item}</Option>
                                    )}
                                </Select>
                            </div>
                            <div className="flt-left">
                                Y轴:
                                <Select
                                    showSearch
                                    style={{ width: 180, height:26, margin: '0 15px' }}
                                    placeholder={yArr[1]}
                                    optionFilterProp="children"
                                    onChange={this.onChangeYAxis.bind(this)}
                                    filterOption={(input, option) =>
                                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {yArr.map((item,index)=>
                                        <Option key={index} value={index+1}>{item}</Option>
                                    )}
                                </Select>
                            </div>
                            {/* <p className="time-text">2019-06-12</p> */}
                        </div>
                        <HeatMapChart paretoData={paretoData} isParetoData={isParetoData} headMapName={headMapName} styleSheet={{ height: '500px'}}/>
                    </div>
                </div>
                <div className="charts-continer" dir="ltr">
                    <div className="chart-item-continer ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <div className="chart-title clearfix">
                            <div className="flt-left">
                                时间选择器
                            </div>
                        </div>
                        <ScatterChart chooseTime={this.state} hotData={timeFilterData} isParetoData={isTimeFilterData} changeTime={this.changeTime} styleSheet={{ height: '300px'}}/>
                    </div>
                </div>
            </div>
        </div>
        )
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
)(AnalysisPage);