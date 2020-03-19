import React from "react"
import * as RouteActionCreators from 'redux/actions/routeActionCreators';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Select, DatePicker, Affix, message, Icon, Popover, Button, List, Modal, Form, Input, Checkbox, Radio, Table, Popconfirm } from 'antd';
import { PrimaryButton } from 'office-ui-fabric-react';
import request from 'utils/urlHelpers';
import MTable from 'component/tables/MaterialTable';
import  moment from 'moment';
import { getloginState } from 'redux/selectors/loginSelector';
import { CircularProgress } from '@material-ui/core';
const { Option } = Select;
const { Search } = Input;
class HubStandard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentView: '',
            viewShow:false,
            viewPopShow:false, //另存为
            viewPopShow2:false, //管理
            isShowFilter: true,
            isPingFilters: false,
            groupTableData: {
                isLoading: true,
            },
            detailData: [],
            wheelType: '',
            pageNum: 1,
            pageSize: 10,
            wheelTypeData: [], //轮毂类型数据
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
            pageId:'1007',
            allViewData:[],
            viewDataIndexId:'',
            viewId:'100007',
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
            "viewId": "100007",
            "pageId": "1007",
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
            "isQuery": "",
            "creator": "",
            "permission": "",
            "xdimension": "",
            "ydimension": ""
        };
        const pams = 'pageId=1007';
        const {viewDataIndexId} = this.state;
        return request({
            url: `/view/getAll?${pams}`,
            method: 'GET'
        }).then(res => {
            if(res && res.code==0){
                const resData = res.data.length?res.data:[defaultView];
                if(resData[0].viewId!=="100007"){
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
        let { pageId, wheelType, pageNum, pageSize }=this.state
        const { userInfo }=this.props
        const userName = userInfo.userName
        const viewName = params.viewName ? params.viewName : ''
        const isDefault = params.isDefault ? 'Y' : 'N'
        const isQuery = params.isQuery ? 'Y' : 'N'
        const permission = params.permission ? 'Y' : 'N'
        return request({
            url: `/view/add`,
            method: 'POST',
            data:{
                barcodeNo: '',
                creator: userName ? userName : '',
                defectType: '',
                imageProcessDatetime: '',
                isDefault:isDefault,
                isQuery:isQuery,
                isStared: 'Y',
                pageId,
                pageNum,
                pageSize,
                permission:permission,
                scrapReason: '',
                viewId: Math.round(Math.random()*1000000),
                viewName:viewName,
                wheelProcessDatetime: '',
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
        let { wheelType, viewItem, pageNum, pageSize }=this.state
        const { creator, barcodeNo, defectType, imageProcessDatetime, wheelProcessDatetime, isDefault, isQuery, isStared, pageId, permission, scrapReason, viewId, viewName, xdimension, ydimension} = viewItem
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
                pageNum,
                pageSize,
                permission,
                scrapReason,
                viewId,
                viewName,
                wheelProcessDatetime,
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
        let Urls = url.trim()
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    /*获取轮毂型号*/
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
    /*表格数据*/
    getDetailData = (params) => {
        let { pageNum, pageSize }=this.state;
        const wheelType = (params && params.wheelType) ? `&wheelType=${params.wheelType}` : ''
        pageNum = `&pageNum=${pageNum}`
        pageSize = `&pageSize=${pageSize}`
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
    /*提交*/
    submitSearch() {
        let { wheelType, pageNum, pageSize} = this.state;
        const searchData = {
            wheelType,
            pageNum,
            pageSize
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
            const {scrapReason, wheelType, viewId, barcodeNo} = viewPage;
            this.setState({scrapReason, wheelType, barcodeNo},()=>{
                //根据是否需要立即更新
                this.setState({viewShow:false})
                if(item.isQuery=='Y'){
                    viewId==100007?this.updateData():this.submitSearch('restore')
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
        const { isShowFilter, wheelTypeData, isPingFilters, wheelType,
            viewData,viewId, columns, dataSource, currentView } = this.state;
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
                {viewId!=="100007"?<Button type="primary" size="small" onClick={this.upDateView}>保存</Button>:null}
                <Button type="primary" size="small" onClick={this.popView}>另存为</Button>
                <Button type="link" size="small" onClick={this.popView2}>管理</Button>
            </div>
        </div>
        return (
            <div className="subtitle-panel detail-data">
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
                </div>
                <div className="filter-content" style={{display: isShowFilter ? "flex" : "none"}}>
                    <div className="filter-item">
                        <p className="lable">轮毂型号:</p>
                        <Select
                            showSearch
                            allowClear={true}
                            style={{ width: 180 }}
                            placeholder="请输入轮毂型号"
                            optionFilterProp="children"
                            value={wheelType?wheelType:undefined}
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
    getTableData = (params)=> {
        this.setState({
            pageNum:params.pageNum + 1,
            pageSize:params.pageSize
        },()=>this.getDetailData(params))
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
                        getData={(pageParam) => this.getTableData(pageParam)}
                    />
                </div>
            </div>)
    }
}
const WrappedHubStandard = Form.create({ name: 'register' })(HubStandard);
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
)(WrappedHubStandard);