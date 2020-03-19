import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Select, DatePicker, Affix, message, Input } from 'antd'
import { PrimaryButton } from 'office-ui-fabric-react';
import request from 'utils/urlHelpers'
import MTable from 'component/tables/MaterialTable'
import  moment from 'moment'
const { Option } = Select;
class DetailDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isShowFilter: true,
            isPingFilters: false,
            groupTableData: {
                isLoading: true,
            },
            detailData: [],
            barcodeNo: '',
            startTime: '',
            endTime: '',
            wheelType: '',
            pageNum: 1,
            pageSize: 10,
            wheelTypeData: [] //轮毂类型数据
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
                _this.getWheelType() //获取轮毂型号
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
    getDetailData = (params) => {
        const barcodeNo = (params && params.barcodeNo) ? `barcodeNo=${params.barcodeNo}` : ''
        const imageProcessDatetime = (params && params.imageProcessDatetime) ? `&imageProcessDatetime=${params.imageProcessDatetime}` : ''
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pageNum = params ? `&pageNum=${params.pageNum}` : '&pageNum=1'
        const pageSize = params ? `&pageSize=${params.pageSize}` : '&pageSize=10' //此处需要和调用的地方都是写10条
        const pams = this.filterUrl(`${barcodeNo}${imageProcessDatetime}${wheelType}${pageNum}${pageSize}`)
        this.setState({
            isLoading: true,
        })
        return request({
            url: `/wheelQuery/wheelImage?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                let detailData = {}
                detailData.total=res.data.total;
                detailData.wheelDetectionImageList=res.data.wheelDetectionImageList;
                this.setState({
                    detailData,
                    isLoading: false,
                })
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
        let { barcodeNo, startTime, endTime, wheelType, pageNum, pageSize} = this.state;
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        const imageProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : (startTime || endTime)
        const searchData = {
            barcodeNo,
            imageProcessDatetime,
            wheelType,
            pageNum,
            pageSize
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
    changeCode = (e) => {
       this.setState({barcodeNo : e.target.value})
    }

    renderFilters() {
        const { isShowFilter, startTime, endTime, wheelTypeData, isPingFilters, wheelType, barcodeNo } = this.state;
        const filterCondition = [{name:'轮毂型号',value:wheelType},
            {name:'起始检测日期',value:startTime?moment(startTime).format('YYYY-MM-DD'):''},
            {name:'结束检测日期',value:endTime?moment(endTime).format('YYYY-MM-DD'):''},
            {name:'轮毂二维码',value:barcodeNo}];
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
                        {/* <DatePicker onChange={this.changeDate.bind(this)}size={'default'} /> */}
                    </div>
                    <div className="filter-item">
                        <p className="lable">轮毂二维码:</p>
                        <Input size="small" placeholder="请输入二维码" onChange={this.changeCode}/>
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
        const { isPingFilters, detailData } = this.state
        return (
            <div className="detail-data">
                { isPingFilters ?
                    <Affix offsetTop={0}>
                        {this.renderFilters()}
                    </Affix> :
                    <div> { this.renderFilters()} </div>
                }

                <div className="main-panel-light">
                    <MTable
                        columns={[
                            { title: '图片ID', field: 'imageId'},
                            { title: '图片处理时间', field: 'imageProcessDatetime'},
                            { title: '轮毂ID', field: 'wheelId'},
                            { title: '二维码编号', field: 'barcodeNo'},
                            { title: '轮毂型号', field: 'wheelType'},
                            { title: '识别结果', field: 'result'},
                            { title: '缺陷类型', field: 'defectType'},
                            { title: '报废原因', field: 'scrapReason'},
                            { title: '最大面积', field: 'maxArea'},
                            { title: '最大长度', field: 'maxLength'},
                            { title: '滑动评价区域最大缺陷面积', field: 'slipArea'},
                            { title: '缺陷所在区域', field: 'defectLocation'},
                            { title: '图片序号', field: 'inum'},
                            { title: '检测步骤', field: 'vnum'},
                        ]}
                        rows={detailData}
                        className="big-table"
                        canAction={false}
                        isLoading={this.state.isLoading}
                        getData={(pageParam) => this.getDetailData(pageParam)}
                    />
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
)(DetailDataPage);