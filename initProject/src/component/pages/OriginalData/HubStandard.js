import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Select, Affix, message } from 'antd'
import { PrimaryButton } from 'office-ui-fabric-react';
import request from 'utils/urlHelpers'
import MTable from 'component/tables/MaterialTable'
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
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        const pageNum = params ? `&pageNum=${params.pageNum}` : '&pageNum=1'
        const pageSize = params ? `&pageSize=${params.pageSize}` : '&pageSize=10' //此处需要和调用的地方都是写10条
        const pams = this.filterUrl(`${wheelType}${pageNum}${pageSize}`)
        this.setState({
            isLoading: true,
        })
        return request({
            url: `/wheelQuery/wheelStandard?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code === 0){
                let detailData = {}
                detailData.total=res.data.total;
                detailData.wheelDetectionImageList=res.data.dicastalWheelStandardList;
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
        let { wheelType, pageNum, pageSize} = this.state;
        const searchData = {
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

    wheelChange = (value) => {
        this.setState({wheelType : value})
    }

    renderFilters() {
        const { isShowFilter, wheelTypeData, isPingFilters, wheelType } = this.state
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
                    <PrimaryButton
                        allowDisabledFocus={true}
                        text="更新"
                        onClick={this.submitSearch.bind(this)}
                    />
                </div>
                <div className="filter-content" style={{display: isShowFilter ? "none" : "flex"}}>
                    <div className="filter-item" style={{color:'#666',fontSize: 14}}>
                        筛选条件: <span>{wheelType?wheelType:'暂无'}</span>
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
                            { title: '轮毂型号', field: 'wheelType'},
                            { title: '当前使用标准', field: 'curUsedStandard' },
                            { title: '标准最大面积', field: 'standardMaxArea'},
                            { title: '标准最大长度', field: 'standardMaxLength'},
                            { title: '标准滑动评价区域最大缺陷面积', field: 'standardSlipArea' },
                            { title: '标准滑动评价区域大小', field: 'standardSlipSize'},
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