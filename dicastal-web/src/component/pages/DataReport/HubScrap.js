import React from "react";
import * as RouteActionCreators from 'redux/actions/routeActionCreators';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import ParetoChart from 'component/charts/pareto';
import Dashboard from 'component/charts/dashboard';
import PieChart from 'component/charts/pie';
import LineChart from 'component/charts/line';
import { Select, DatePicker, Affix, message, Icon, Popover, Button, List, Modal, Form, Input, Checkbox, Radio, Table, Popconfirm } from 'antd';
import { PrimaryButton } from 'office-ui-fabric-react';
import HeatMapChart from 'component/charts/heatMap';
import  moment from 'moment';
import request from 'utils/urlHelpers';
import { getloginState } from 'redux/selectors/loginSelector';
import { CircularProgress } from '@material-ui/core';
const { Option } = Select;
const { Search } = Input;
class HubScrap extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentView: '',
            viewShow:false,
            viewPopShow:false, //另存为
            viewPopShow2:false, //管理
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
            wheelScrapPareto: {}, //报废累计数量帕累托图
            wheelScrapPie: [], //报废原因饼状图
            wheelScrapTrend: [], //报废数量趋势折线图
            paretoData: {}, //报废分布分析
            headMapName:{
                xDimension: 1
            },
            wheelScrapReason: [], //获取报废原因
            viewData:[],
            columns: [
                {
                    title: ()=>(<div style={{opacity:0}}>2</div>),
                    dataIndex: 'isStared',
                    key: 'isStared',
                    width:30,
                    render:(text,row)=>(
                        <i style={{cursor:'pointer'}} className={row.isStared=='Y'?"sap-icon icon-favorite":"sap-icon icon-unfavorite"} onClick={this.editView.bind(this,text,row,3)}></i>
                    )
                },
                {
                    title: '视图名称',
                    dataIndex: 'viewName',
                    key: 'viewName',
                    width:130,
                    render: (text,row) => {
                        const {userInfo}=this.props;
                        const me =userInfo.userName==row.creator;
                        let txt = row.viewName;
                        txt=txt.length>10?txt.substring(0, 10) + '...':txt;
                        return me?<Input placeholder={txt} value={txt} onChange={(e)=>this.changeViewName(e,text,row)}/>
                            :
                            <div className={'td-ellipsis'} title={txt}>{txt}</div>
                    },
                },
                {
                    title: '设为默认',
                    dataIndex: 'isDefault',
                    key: 'isDefault',
                    width:100,
                    render:(text,row)=>{
                        return <Radio checked={row.isDefault=='Y'} onChange={this.editView.bind(this,text,row,0)}></Radio>
                    }
                },
                {
                    title: '立即查询',
                    dataIndex: 'isQuery',
                    key: 'isQuery',
                    width:100,
                    render:(text,row)=>(
                        <Checkbox checked={row.isQuery=='Y'} onChange={this.editView.bind(this,text,row,1)}></Checkbox>
                    )
                },
                {
                    title: '公开',
                    dataIndex: 'permission',
                    key: 'permission',
                    width:80,
                    render: (text,row) => {return <div>{row.permission=='Y'?'公开':'秘密'}</div>},
                },
                {
                    title: '创建者',
                    dataIndex: 'creator',
                    key: 'creator',
                    width:90,
                    render: text => {
                        const {userInfo} =this.props;
                        const name =userInfo.userName==text?'自己':'其他人';
                        return <div>{name}</div>
                    },
                },
                {
                    title: ()=>(<div style={{opacity:0}}>2</div>),
                    dataIndex: 'delete',
                    key: 'delete',
                    width:30,
                    render: (text,row) => {
                        const {userInfo} =this.props;
                        const me =userInfo.userName==row.creator?true:false;
                        if(!me){
                            return null
                        }
                        return <Popconfirm
                            title="真的删除吗？"
                            icon={<Icon type="question-circle-o" style={{ color: 'red' }} />}
                            cancelText={"取消"}
                            okText={"确定"}
                            onConfirm={this.deleteView.bind(this,text,row)}
                        >
                            <Icon type="close-circle" />
                        </Popconfirm>
                    },
                },
            ],
            dataSource: [],
            pageId:'1001',
            allViewData:[],
            viewDataIndexId:'',
            viewId:'100001',
        }
    }
    /*选择视图*/
    changeViewName = (e,text,row)=> {
        let {dataSource}=this.state;
        dataSource[row.key].viewName=e.target.value;
        this.setState({dataSource})
    }
    /*编辑管理视图*/
    editView = (e,row,type,target)=> {
        let {dataSource}=this.state;
        if(type==0){
            dataSource[row.key].isDefault=target.target.checked?'Y':'N';
        }else if(type==1){
            dataSource[row.key].isQuery=target.target.checked?'Y':'N';
        }else{
            const isStared = dataSource[row.key].isStared;
            dataSource[row.key].isStared=isStared=='Y'?'N':'Y';
        }
        this.setState({dataSource})
    }
    componentDidMount(){
        this.refreshData();
        this.getView();
    }
    /*获取视图*/
    getView = (params)=> {
        const defaultView = {
            "viewId": "100001",
            "pageId": "1001",
            "viewName": "标准视图",
            "scrapReason": "",
            "defectType": "",
            "wheelProcessDatetime": "",
            "imageProcessDatetime": "",
            "wheelType": "",
            "barcodeNo": "",
            "pageNum": 1,
            "pageSize": 10,
            "isStared": "Y",
            "isDefault": "",
            "isQuery": "Y",
            "creator": "",
            "permission": "",
            "xdimension": "",
            "ydimension": ""
        };
        const pams = 'pageId=1001'
        const {viewDataIndexId} = this.state;
        return request({
            url: `/view/getAll?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code==0){
                const resData = res.data.length?res.data:[defaultView];
                if(resData[0].viewId!=="100001"){
                    resData.unshift(defaultView)
                }
                resData.forEach((item,index)=>{
                    item.key=index;
                    item.delete='';
                })
                this.setState({dataSource:resData});
                let filterData = resData.filter((item,index)=>{
                    return item.isStared=='Y'
                })
                let viewData=filterData;
                viewData.map((item,index)=>{
                    item.checked=false;
                    if(viewDataIndexId){
                        if(item.viewId==viewDataIndexId) {
                            item.checked = true;
                            this.setState({currentView: item.viewName})
                        }
                    }else{
                        if(index==0){
                            item.checked=true;
                            this.setState({currentView:item.viewName})
                        }
                    }
                })
                this.setState({viewData})
            }
        })
    }
    //新增视图
    addView = (params)=> {
        let { pageId, scrapReason, startTime, endTime, wheelType }=this.state
        const { userInfo }=this.props
        const userName = userInfo.userName
        const viewName = params.viewName ? params.viewName : ''
        const isDefault = params.isDefault ? 'Y' : 'N'
        const isQuery = params.isQuery ? 'Y' : 'N'
        const permission = params.permission ? 'Y' : 'N'
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        if((!startTime && endTime) || (startTime && !endTime)){
            if(!startTime){message.warning('起始时间必填');return}
            if(!endTime){message.warning('结束时间必填');return}
        }
        const wheelProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : (startTime || endTime)
        return request({
            url: `/view/add`,
            method: 'POST',
            data:{
                barcodeNo: '',
                creator: userName ? userName : '',
                defectType: '',
                imageProcessDatetime:'',
                isDefault,
                isQuery,
                isStared: 'Y',
                pageId,
                pageNum: 1,
                pageSize: 10,
                permission,
                scrapReason: scrapReason ? scrapReason : '',
                viewId: Math.round(Math.random()*1000000),
                viewName,
                wheelProcessDatetime: wheelProcessDatetime,
                wheelType: wheelType ? wheelType : '',
                xdimension: '',
                ydimension: '',
            }
        }).then(res => {
            if(res && res.code==0){
                this.getView();
                this.setState({viewPopShow:false})
            }else{
                message.error('新增失败')
            }
        })
    }
    /*更新视图*/
    upDateView = (params)=> {
        let { scrapReason, startTime, endTime, wheelType, viewItem }=this.state
        const {barcodeNo, creator, defectType, imageProcessDatetime, isDefault, isQuery, isStared, pageId, permission, viewId, viewName, xdimension, ydimension} = viewItem
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        if((!startTime && endTime) || (startTime && !endTime)){
            if(!startTime){message.warning('起始时间必填');return}
            if(!endTime){message.warning('结束时间必填');return}
        }
        const wheelProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : ""
        return request({
            url: `/view/update`,
            method: 'PUT',
            data:{
                barcodeNo,
                creator,
                defectType,
                imageProcessDatetime,
                isDefault,
                isQuery,
                isStared,
                pageId,
                pageNum: 1,
                pageSize: 10,
                permission,
                scrapReason: scrapReason ? scrapReason : '',
                viewId,
                viewName,
                wheelProcessDatetime: wheelProcessDatetime,
                wheelType: wheelType ? wheelType : '',
                xdimension,
                ydimension,
            }
        }).then(res => {
            if(res && res.code==0){
                this.getView();
                this.setState({viewShow:false})
            }else{
                message.error('保存失败')
            }
        })
    }
    /*更新管理视图*/
    upDateViewList = (params)=> {
        const { dataSource }=this.state
        return request({
            url: `/view/updateList`,
            method: 'PUT',
            data:dataSource
        }).then(res => {
            if(res && res.code==0){
                this.getView();
                this.setState({viewPopShow2:false})
            }else{
                message.error('保存失败')
            }
        })
    }
    /*删除视图*/
    deleteView = (text,row)=> {
        return request({
            url: `/view/delete`,
            method: 'DELETE',
            data:{
                pageId:row.pageId,
                viewId:row.viewId
            }
        }).then(res => {
            if(res && res.code==0){
                this.getView();
                this.setState({viewPopShow2:false})
            }else{
                message.error('删除失败')
            }
        })
    }
    /*管理视图搜索*/
    searchView = (value)=> {
        let {dataSource} = this.state;
        const newData = dataSource.filter((item,index)=>{
            return item.viewName.indexOf(value) > -1
        })
        this.setState({dataSource:newData})
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
    /*获取报废原因*/
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
        let Urls = url.trim()
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    /*报废分布*/
    getWheelScrapDistribution = (params) => {
        let {scrapReason,startTime,endTime,wheelType} =this.state
        startTime = startTime?moment(startTime).format('YYYY-MM-DD'):'';
        endTime = endTime?moment(endTime).format('YYYY-MM-DD'):'';
        if((!startTime && endTime) || (startTime && !endTime)){
            if(!startTime){message.warning('起始时间必填');return}
            if(!endTime){message.warning('结束时间必填');return}
        }
        const wheelProcessDatetime = (startTime && endTime)? startTime + ',' + endTime : ""
        const pams = this.filterUrl(`${scrapReason}${wheelProcessDatetime}${wheelType}`)
        return request({
            url: `/wheelScrap/wheelScrapDistribution?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code==0){
                this.setState({paretoData: res.data, isParetoData:true})
            }
        })
    }
    /*获取轮毂类型*/
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
    /*X光检测轮毂数量*/
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
    /*X光检测报废率*/
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
    /*X光检测轮毂报废数量*/
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
    /*报废累计数量帕累托图*/
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
    /*报废原因饼状图*/
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
    /*报废数量趋势折线图*/
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
    /*选择报废原因*/
    onChangeReason(val) {
        this.setState({
            scrapReason: val,
        })
    }
    /*提交*/
    submitSearch(restore) {
        let { scrapReason, startTime, endTime, wheelType } = this.state;
        if(!restore){
            if(!startTime){message.warning('起始时间必填');return}
            if(!endTime){message.warning('结束时间必填');return}
        }
        this.setState({
            wheelNum:'',wheelScrapPercent:'',wheelScrap:'',
            wheelScrapPareto:[],wheelScrapPie:[], wheelScrapTrend:[],paretoData:{}
        })
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
    /*显示隐藏*/
    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter, isPingFilters } = this.state
        if(isPingFilters){return}
        this.setState({
            isShowFilter: !isShowFilter
        })
    }
    /*钉死视图*/
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
    /*选择开始时间*/
    onStartChange = value => {
        this.setState({
            startTime: value,
        });
    }
    /*选择结束时间*/
    onEndChange = value => {
        this.setState({
            endTime: value,
        });
    }
    /*校验开始时间*/
    disabledStartDate = startTime => {
        const { endTime } = this.state;
        if (!startTime || !endTime) {
            return false;
        }
        return startTime.valueOf() > endTime.valueOf();
    };
    /*校验结束时间*/
    disabledEndDate = endTime => {
        const { startTime } = this.state;
        if (!endTime || !startTime) {
            return false;
        }
        return endTime.valueOf() <= startTime.valueOf();
    };
    /*选择轮毂类型*/
    wheelChange = (value) => {
        this.setState({wheelType : value})
    }
    /*显示隐藏视图*/
    handleClick (){
        this.setState({viewShow:!this.state.viewShow})
    }
    /*单击选择视图*/
    chooseView = (item,index)=> {
        let {viewData} =this.state;
        viewData.forEach((item)=>{
            item.checked=false;
        })
        viewData[index].checked=true;
        this.setState({viewData},()=>{
            const viewPage = viewData[index];
            const {viewId} = viewPage;
            this.setState({viewId,currentView:viewPage.viewName,viewItem:viewPage});
        })
    }
    /*双击选择视图*/
    chooseView2 = (item,index)=> {
        let {viewData} =this.state;
        viewData.forEach((item)=>{
            item.checked=false;
        })
        viewData[index].checked=true;
        this.setState({viewData,viewDataIndexId:viewData[index].viewId},()=>{
            //选完具体的视图  跳转
            //跳转的参数如下
            const viewPage = viewData[index];
            const {scrapReason, wheelProcessDatetime, wheelType, viewId} = viewPage;
            const timeArr = wheelProcessDatetime.split(',');
            let startTime=timeArr[0];
            let endTime=timeArr[1];
            if(startTime){
                startTime=moment(startTime)
            }
            if(endTime){
                endTime=moment(endTime)
            }

            this.setState({scrapReason, startTime, endTime, wheelType},()=>{
                //根据是否需要立即更新
                this.setState({viewShow:false})
                if(item.isQuery=='Y'){
                    viewId==100001?this.updateData():this.submitSearch('restore')
                }
            });
        })
    }
    /*弹出新增视图*/
    popView = ()=> {
        this.setState({viewShow:false},()=>{this.setState({viewPopShow:true})})
    }
    /*弹出管理视图*/
    popView2 = ()=> {
        this.setState({viewShow:false},()=>{this.setState({viewPopShow2:true})})
    }
    /*取消新增视图*/
    cancleView = ()=> {
        this.setState({viewPopShow:false})
    }
    /*提交新增视图*/
    handleSubmit = (e)=> {
        e.preventDefault();
        this.props.form.validateFields((err, fieldsValue) => {
            if (err) {
                return;
            }
            this.addView(fieldsValue)
            console.log('Received values of form: ', fieldsValue);
        });
    }
    /*保存管理视图*/
    saveView2 = ()=> {
        this.upDateViewList()
    }
    /*取消管理视图*/
    cancleView2 = ()=> {
        this.setState({viewPopShow2:false})
    }
    renderFilters() {
        const { getFieldDecorator } = this.props.form;
        const { isShowFilter, startTime, endTime, wheelTypeData, isPingFilters,wheelScrapReason,wheelType,scrapReason,
            viewData,viewId, columns, dataSource, currentView } = this.state;
        const filterCondition = [{name:'轮毂型号',value:wheelType},
            {name:'起始检测日期',value:startTime?moment(startTime).format('YYYY-MM-DD'):''},
            {name:'结束检测日期',value:endTime?moment(endTime).format('YYYY-MM-DD'):''},
            {name:'报废原因',value:scrapReason}];
        const popContent =<div>
            <div className="pop-content">
                <List
                    dataSource={viewData}
                    renderItem={(item,index) => (
                        <div style={item.checked?{background:'rgba(232,242,251,1)'}:{}} onClick={this.chooseView.bind(this,item,index)} onDoubleClick={this.chooseView2.bind(this,item,index)}>
                            <List.Item>
                                {item.viewName}
                            </List.Item>
                        </div>
                    )}
                >
                </List>
            </div>
            <div className="pop-footer">
                {viewId!=="100001"?<Button type="primary" size="small" onClick={this.upDateView}>保存</Button>:null}
                <Button type="primary" size="small" onClick={this.popView}>另存为</Button>
                <Button type="link" size="small" onClick={this.popView2}>管理</Button>
            </div>
        </div>
        return (
            <div className="subtitle-panel data-report">
                <div className="subtitle-header">
                    <Popover
                        placement="bottom"
                        overlayClassName="view-pop"
                        title={<div style={{textAlign:'center'}}>我的视图</div>}
                        content={popContent}
                        trigger="click"
                        visible={this.state.viewShow}
                    >
                        <div className="ant-dropdown-link" ref="dropdown" href="#" onClick={(e)=>this.handleClick(e)}>
                            {currentView?currentView:<CircularProgress size="20px"/>}<span style={{marginRight:6}}></span><Icon type="down" />
                        </div>
                    </Popover>
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
                </div>
                <div className="filter-content" style={{display: isShowFilter ? "flex" : "none"}}>
                    <div className="filter-item">
                        <p className="lable">轮毂型号:</p>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: 180 }}
                            placeholder="请输入轮毂型号"
                            value={wheelType?wheelType:undefined}
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
                            value={scrapReason?scrapReason:undefined}
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
                <Modal
                    title={<div style={{textAlign:'center'}}>我的视图</div>}
                    className="modal-view"
                    closable={false}
                    centered={true}
                    visible={this.state.viewPopShow}
                    footer={null}
                >
                    <Form  onSubmit={this.handleSubmit}>
                        <div style={{padding:'0 24px'}}>
                            <Form.Item label="视图名称:">
                                {getFieldDecorator('viewName', {
                                    rules: [{ required: true, message: '请输入视图名称' }],
                                })(
                                    <Input placeholder="请输入视图名称" style={{ width: 200 }}/>,
                                )}
                            </Form.Item>
                            <Form.Item>
                                {getFieldDecorator('isDefault', {
                                    valuePropName: 'checked',
                                    initialValue: true,
                                })(<Checkbox>设为默认</Checkbox>)}
                            </Form.Item>
                            <Form.Item>
                                {getFieldDecorator('isQuery', {
                                    valuePropName: 'checked',
                                    initialValue: false,
                                })(<Checkbox>立即查询</Checkbox>)}
                            </Form.Item>
                            <Form.Item>
                                {getFieldDecorator('permission', {
                                    valuePropName: 'checked',
                                    initialValue: false,
                                })(<Checkbox>公开</Checkbox>)}
                            </Form.Item>
                        </div>
                        <Form.Item>
                            <div className="pop-footer">
                                <Button type="primary" size="small" htmlType="submit">保存</Button>
                                <Button type="link" size="small" onClick={this.cancleView}>取消</Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal
                    title={<div style={{textAlign:'center'}}>管理视图</div>}
                    className="modal-view2"
                    width="650px"
                    closable={false}
                    centered={true}
                    visible={this.state.viewPopShow2}
                    footer={
                        <div className="pop-footer">
                            <Button type="primary" size="small" onClick={this.saveView2}>保存</Button>
                            <Button type="link" size="small" onClick={this.cancleView2}>取消</Button>
                        </div>
                    }
                >
                    <Search
                        placeholder="搜索"
                        onSearch={this.searchView}
                    />
                    <div style={{padding:'0 24px'}}>
                        <Table dataSource={dataSource} columns={columns} pagination={false} scroll={{ y: 240 }}/>
                    </div>
                </Modal>
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
            name: 'X光检测数量',
            time: nowDate,
            value: wheelNum?wheelNum:0,
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测合格率',
            time: nowDate,
            value: (qualifiedPercent*100).toFixed(1)+'%',
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测报废数量',
            time: nowDate,
            value: wheelScrap?wheelScrap:0,
            isImprove: true,
            chanegRange: '10%',
        },{
            name: 'X光检测报废率',
            time: nowDate,
            value: (scrapPercent*100).toFixed(1)+'%',
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
const WrappedHubScrap = Form.create({ name: 'register' })(HubScrap);
const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
        list: state,
        userInfo

    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(RouteActionCreators, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(WrappedHubScrap)
