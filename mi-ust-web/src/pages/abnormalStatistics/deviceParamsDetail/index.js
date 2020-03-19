import React, { PureComponent } from 'react';
import { Breadcrumb, Affix, Input, Icon, Tabs, Modal, message } from 'antd';
import EditTable from 'components/antdEditTable/editTable'
import request from 'util/http'
import {setCookie,getCookie} from 'util/userApi'
const { TabPane } = Tabs;
class ParamShow extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],
            picture: null,
            columns: [
                {
                    title: '#',
                    field: 'key',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '起始时间',
                    field: 'startTime',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '结束时间',
                    field: 'endTime',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '产品',
                    field: 'productName',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '条件',
                    field: 'condition1',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '起始值',
                    field: 'rangeValue',
                    editable: 'never',
                    sorting: false
                },
                {
                    title: '标准范围',
                    field: 'value',
                    editable: 'never',
                    sorting: false
                },
                // {
                //     title: '异常原因',
                //     field: 'abnormalReason',
                // },
                {
                    title: '备注',
                    field: 'remark',
                    sorting: false
                }
            ],
            devicesParams:[],
            data: [],
            isShowFilter: true,
            isPingFilters: false,
            visible: false,
            visibleFilter: false,
            defaultTabIndex:0,
            defaultTabContent:'',
            measurementIdArr:[],
            isLoading:true,

            pageSize:10,
            pageNum:1,
            measureId:''
        }
    }
    changeFilter(e) {
        e.stopPropagation()
        const { isShowFilter, isPingFilters } = this.state
        if(isPingFilters){return}
        this.setState({
            isShowFilter: !isShowFilter
        })
    }
    componentDidMount(){
        let locationState = this.props.location.state
        if(!locationState){
            locationState=JSON.parse(getCookie('locationState'))
            this.setState({locationState})
        }
        setCookie('locationState',JSON.stringify(locationState),1)
        const equipmentItem = locationState.equipmentItem
        this._getParameterList(equipmentItem.equipmentCode, this.state.pageNum,this.state.pageSize);
        this.getDeviceDetail(equipmentItem.equipmentCode)
    }
    // componentWillUnmount(){
    //     //考虑到浏览器返回前进按钮
    //     setCookie('locationState','',1)
    // }
    // 获取参数集合
    _getParameterList(equipmentCode,pageNum,pageSize) {
        request({
            url: `/parameter/getParameterList?equipmentCode=${equipmentCode}`,
            method: 'GET',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            const measurementId=[]
            res.data.length && res.data.map((item,index)=>{
                measurementId.push(item.measurementId)
            })
            this.setState({devicesParams:res.data,measurementIdArr:measurementId},()=>{
                //去设置defaultTabIndex
                const mesaureId= this.state.measureId || ( this.props.location.state && this.props.location.state.tabIndex) || this.state.locationState.tabIndex
                const tabIndex = measurementId.indexOf(mesaureId)
                this.setState({defaultTabIndex: tabIndex, measureId: res.data[tabIndex] && res.data[tabIndex].measurementId},()=>{
                    if(res.data[tabIndex]) this._getRecordList(res.data[tabIndex].equipmentCode,pageNum,pageSize)
                })

            })
        })
    }
    exportTabC = (data)=> {
        const newData = Object.assign({},data)
        newData.exceptionRecordList && newData.exceptionRecordList.map((item,index)=>{
            item.startTime=item.startTime?item.startTime.substr(0,10):item.startTime
            item.endTime=item.endTime?item.endTime.substr(0,10):item.endTime
        })
        this.setState({data:newData,isLoading:false},()=>{
            //现在去生成tab内容
            const {defaultTabIndex} = this.state
            this.setState({tabC:this.tabContent(this.state.devicesParams[defaultTabIndex])})
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
    // 获取设备 图片
    getDeviceDetail(id) {
        request({
            url: `/equipment/getEquipment?equipmentCode=${id}`,
            method: 'GET',
        }).then(res => {
            if (!res || res.code !== 0) {
                return
            }
            this.setState({ picture: res.data.picture })
        })
    }
    /*取异常记录集合*/
    _getRecordList(equipmentCode,pageNum,pageSize){
        const {measureId} = this.state
        const Code = equipmentCode ? `equipmentCode=${equipmentCode}` : '';
        const Id = measureId ? `&measureId=${measureId}` : '';
        const Num = pageNum || pageNum===0  ? `&pageNum=${pageNum}` : '';
        const Size = pageSize ? `&pageSize=${pageSize}` : '';
        const pam = this.filterUrl(`${Code}${Id}${Num}${Size}`)
        request({
            url: `/record/getRecordList?${pam}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data=res.data
                data.exceptionRecordList.length>0&&data.exceptionRecordList.forEach((item,index)=>{
                    const {value1,value2}=item
                    let value,condition
                    if(value1){
                        if(value2){
                            value=value1+'~'+value2
                        }else{
                            value=value1+'~'+value1
                        }
                    }
                    switch(item.condition) {
                        case 'e':
                            condition='等于'
                            break;
                        case 'ue':
                            condition='不等于'
                            break;
                        case 'g':
                            condition='大于'
                            break;
                        case 'ge':
                            condition='大于等于'
                            break;
                        case 'l':
                            condition='小于'
                            break;
                        case 'le':
                            condition='小于等于'
                            break;
                        default:
                            condition='范围内'
                    }
                    item.key=index+1
                    item.value=value
                    item.condition1=condition
                })
                //此处需要把tabC的改变暴露出去
                this.exportTabC(data)

            },
            error: () => {
                message.error('请求失11败！')
            }
        })
    }
    pingFilters() {
        const { isPingFilters } = this.state
        this.setState({
            isPingFilters: !isPingFilters,
        })
    }
    showModal = () => {
        this.setState({
            visible: true,
        });
    };
    showFilterModal = () => {
        this.setState({
            visibleFilter: true,
        });
    };
    handleCancel = e => {
        this.setState({
            visible: false,
        });
    };

    // _changeDataSource = (data)=> {
    //     //去请求保存
    //      this._updateRemark(data,'','')
    // }
    /*修改异常记录备注*/
    updateParameter = (data)=>{
        //去修改异常记录
        // const urlHead="http://rap2api.taobao.org/app/mock/233676"
        const pam = `id=${data.id}&remark=${data.remark}`
        return request({
            url: `/record/updateRemark?${pam}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    initParameterList = (params)=>{
        //去初始化
        const {equipmentItem} = this.props.location.state || this.state.locationState;
        const {page,page_size}=params
        this.setState({pageNum:page,pageSize:page_size},()=>{
            this._getParameterList(equipmentItem.equipmentCode,page,page_size)
        })
    }
    tabContent = (devicesParam)=> {
        const {parameterName, measurementId} = devicesParam;
        const {data, columns, isLoading,pageNum,pageSize} = this.state
        let len = data&&data.exceptionRecordList.length>0?data.exceptionRecordList.length:''
        len = len ? '('+ len +')' : ''
        return <div className="all-contents">
            <div className="content-item">
                {/*<div className="head2">*/}
                    {/*<span className="title">{parameterName}异常记录(#)</span>*/}
                    {/*<div className="icons">*/}
                        {/*<i className="sap-icon icon-filters" onClick={(e)=>this.showFilterModal(e)}  style={{margin:'3px 10px 0',cursor:'pointer'}}></i>*/}
                        {/*/!*<i className="sap-icon icon-settings"  style={{margin:'3px 5px 0'}}></i>*!/*/}
                    {/*</div>*/}
                {/*</div>*/}
                <div className="cont">
                    <div className="table">
                        <EditTable title={`${parameterName}异常记录${len}`}
                                   hasDefaultDate={true}
                                   hasPaging={data.exceptionRecordList && data.exceptionRecordList.length>0?true:false}
                                   columns={ columns }
                                   updateData={this.updateParameter}
                                   createData={false}
                                   data={{list: data.exceptionRecordList?data.exceptionRecordList:[], isFetching:isLoading,pageInfo:{
                                       total:data.total?data.total:0,
                                       pageSize:pageSize,
                                       page:pageNum
                                   }}}
                                   deleteData={null}
                                   getTableList={this.initParameterList}
                                   preserveRefreshTable={true}
                        >
                        </EditTable>
                    </div>
                </div>
            </div>
        </div>
    }
    // _showFilterModal = (type,filterMap)=> {
    //     if(type===1){
    //         //筛选
    //         const start_time = filterMap.get('start_time');
    //         const end_time = filterMap.get('end_time');
    //     }
    //     this.setState({
    //         visibleFilter: false,
    //     });
    // }
    tabChange = (e)=> {
        const {devicesParams} = this.state
        this.setState({defaultTabIndex:e, measureId: devicesParams[e] && devicesParams[e].measurementId},()=>{
            const {pageNum,pageSize}=this.state
            this._getRecordList(devicesParams[e].equipmentCode, pageNum,pageSize)
        })
    }
    renderFilters() {
        const { isShowFilter, isPingFilters, picture, locationState } = this.state;
        const { devicesParams, defaultTabIndex, tabC, measurementIdArr } = this.state;
        const mesaureId=this.props.location.state && this.props.location.state.tabIndex || (locationState && locationState.tabIndex)
        const tabIndex = measurementIdArr.length && measurementIdArr.indexOf(mesaureId)
        const equipmentItem=this.props.location.state&&this.props.location.state.equipmentItem
        return (
            <div>
                <div className="create-device-page">
                    <div className="fixed-panel">
                        <Breadcrumb>
                            <Breadcrumb.Item><a href="#" onClick={ (e) => { this.props.history.goBack() } }>异常事件</a></Breadcrumb.Item>
                            <Breadcrumb.Item>异常记录</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{ display: 'flex', justifyContent: 'space-between',marginTop: '10px' }}>
                            <h1>{equipmentItem&&equipmentItem.equipmentName}</h1>
                        </div>
                        <div className="info" style={{display: isShowFilter ? "flex" : "none"}}>
                            <div style={{ width: '80px', height: '80px', background: '#dcdcdc', marginRight: '20px' }}>
                                { picture && picture !== 'null' ? <img alt={'设备图片'} src={picture} style={{ height: '100%' }} /> : <span  style={{ textAlign: 'center', marginTop:'28px', width: '80px', display: 'block' }} >没有图片</span>}
                            </div>
                            <div>
                                <div style={{marginBottom: '20px'}}><span>类型:</span>{equipmentItem&&equipmentItem.vendor}</div>
                                <div><span>编码:</span>{equipmentItem&&equipmentItem.equipmentCode}</div>
                            </div>
                        </div>
                    </div>
                    <div className="subtitle-panel data-report" style={{position:'relative'}}>
                        <div className="bottom-botton-panel">
                            <div className="button-panel">
                                <div className="button" onClick={(e)=>this.changeFilter(e)}>
                                    {isShowFilter ? <i className="sap-icon icon-arrow-up"></i> : <i className="sap-icon icon-arrow-down"></i>}
                                </div>
                                {isShowFilter
                                    &&<div className="button" onClick={this.pingFilters.bind(this)}>
                                        {isPingFilters?<i className="sap-icon icon-push-pin-on"></i>:<i className="sap-icon icon-push-pin"></i>}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="all-tabs">
                    {devicesParams.length?
                        <Tabs defaultActiveKey={JSON.stringify(defaultTabIndex || tabIndex)} onChange={this.tabChange}>
                            {devicesParams.map((item, index) => (
                                    <TabPane tab={<div style={{textAlign:'center'}}><div>{item.parameterName}</div><div>{'（'+item.measurementId+'）'}</div></div>} key={JSON.stringify(index)}>
                                        {tabC}
                                    </TabPane>
                                ))
                            }
                        </Tabs>
                        :''
                    }
                </div>
                <Modal
                    className="edit-modal"
                    closable={false}
                    centered={true}
                    visible={this.state.visible}
                    footer={<div style={{color:'#0854A1'}} onClick={this.handleCancel}>取消</div>}
                >
                    <div>
                        <Input placeholder="Search"
                               suffix={
                                   <Icon type="search" />
                               }
                               style={{ width: '90%',margin:'0 0 12px 5%',cursor:'pointer' }}
                        />
                        />
                    </div>
                </Modal>
                {/*<FilterData visibleFilter={this.state.visibleFilter} showFilterModal={this._showFilterModal}/>*/}
            </div>
        )
    }
    render() {
        const { isPingFilters } = this.state;
        return (
            <div className="device-param-detail">
                { isPingFilters ?
                    <Affix offsetTop={0}>
                        {this.renderFilters()}
                    </Affix> :
                    <div>{this.renderFilters()}</div>
                }
            </div>

        );
    }
}

export default ParamShow;
