import React, { PureComponent } from 'react';
import { Table, Checkbox, Breadcrumb, Button, Affix, Select, Anchor, Input, Icon, Tabs, Modal, message } from 'antd';
import Line from '@src/components/chart/multipleLine';
import OneEditTable from '@src/components/antdEditTable/oneEdit';
import FilterData from '@src/components/filterData';
import request from 'util/http'
import Mock from 'mockjs'
const Random = Mock.Random
const { Option } = Select;
const { Link } = Anchor;
const { TabPane } = Tabs;
const {Search}=Input;
class ParamShow extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],
            columns: [
                {
                    title: '#',
                    dataIndex: 'key',
                    width:80
                },
                {
                    title: '起始时间',
                    dataIndex: 'start_time',
                    defaultSortOrder: 'descend',
                    sorter: (a, b) => a.name - b.name,
                },
                {
                    title: '结束时间',
                    dataIndex: 'end_time',
                },
                {
                    title: '产品',
                    dataIndex: 'product_name',
                    render: text => <a>{text}</a>,
                },
                {
                    title: '起始值',
                    dataIndex: 'value',
                },
                {
                    title: '标准范围',
                    dataIndex: 'range_value',
                    render: text => <a>{text}</a>,
                },
                // {
                //     title: '异常原因',
                //     dataIndex: 'abnormalReason',
                // },
                {
                    title: '备注',
                    dataIndex: 'remark',
                }
            ],
            devicesParams:[],
            data: [],
            isShowFilter: true,
            isPingFilters: false,
            visible: false,
            visibleFilter: false,
            defaultTabIndex:0,
            defaultTabContent:''
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
        const {equipmentItem} = this.props.location.state;
        this._getParameterList(equipmentItem.equipmentCode)
    }
    // 获取参数集合
    _getParameterList(equipmentCode) {
        request({
            url: `/parameter/getParameterList?equipmentCode=YDSC049`,
            // url: `/parameter/getParameterList?equipmentCode=${equipmentCode}`,
            method: 'GET',
        }).then( res => {
            if(!res || res.code !== 0) {
                return
            }
            this.setState({devicesParams:res.data},()=>{
                const {defaultTabIndex} = this.state
                this._getRecordList(res.data[defaultTabIndex].equipmentCode,res.data[defaultTabIndex].measurementId)
            })
        })
    }
    exportTabC = (data)=> {
        this.setState({data},()=>{
            //现在去生成tab内容
            const {defaultTabIndex} = this.state
            this.setState({tabC:this.tabContent(this.state.devicesParams[defaultTabIndex])})
        })
    }
    /*取异常记录集合*/
    _getRecordList(equipmentCode,measureId){
        const urlHead="http://rap2api.taobao.org/app/mock/233676"
        const pam = `equipmentCode=${equipmentCode}&measureId=${measureId}`
        request({
            urlHead:urlHead,
            url: `/record/getRecordList?${pam}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data=res.data
                data.forEach((item,index)=>item.key=index)
                //此处需要把tabC的改变暴露出去
                this.exportTabC(data)

            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    /*修改异常记录备注*/
    _updateRemark(data,id,remark){
        const urlHead="http://rap2api.taobao.org/app/mock/233676"
        const pam = `id=${id}&remark=${remark}`
        request({
            urlHead:urlHead,
            url: `/record/updateRemark?${pam}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                // const data=res.data
                // data.forEach((item,index)=>item.key=index)
                // this.setState({data})
                this.exportTabC(data)
            },
            error: () => {
                message.error('请求失败！')
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

    _changeDataSource = (data)=> {
        //去请求保存
        this._updateRemark(data,'323','你好吗')
    }
    tabContent = (devicesParam)=> {
        const {parameterName, measurementId} = devicesParam;
        const {data,columns} = this.state
        return <div className="all-contents">
            <div className="content-item">
                <div className="head2">
                    <span className="title">{parameterName}异常记录(#)</span>
                    <div className="icons">
                        <i className="sap-icon icon-filters" onClick={(e)=>this.showFilterModal(e)}  style={{margin:'3px 10px 0',cursor:'pointer'}}></i>
                        {/*<i className="sap-icon icon-settings"  style={{margin:'3px 5px 0'}}></i>*/}
                    </div>
                </div>
                <div className="cont">
                    <div className="table">
                        {/*<Table columns={columns} dataSource={data} pagination={false}/>*/}
                        <OneEditTable columns={columns} editColumns={['abnormalReason','remark']} changeDataSource={this._changeDataSource} dataSource={data} pagination={false}/>
                    </div>
                </div>
            </div>
            {/*<div className="content-item">*/}
                {/*<div className="head2">*/}
                    {/*<span className="title">{parameterName}趋势(#)</span>*/}
                {/*</div>*/}
                {/*<div className="cont">*/}
                    {/*<div className="chart">*/}
                        {/*<Line/>*/}
                    {/*</div>*/}
                {/*</div>*/}
            {/*</div>*/}
        </div>
    }
    _showFilterModal = (type,filterMap)=> {
        if(type===1){
            //筛选
            const start_time = filterMap.get('start_time');
            const end_time = filterMap.get('end_time');
        }
        this.setState({
            visibleFilter: false,
        });
    }
    tabChange = (e)=> {
        const {devicesParams} = this.state
        this.setState({defaultTabIndex:e})
        this._getRecordList(devicesParams[e].equipmentCode, devicesParams[e].measurementId)
    }
    renderFilters() {
        const { isShowFilter, isPingFilters } = this.state;
        const {columns, data, devicesParams, defaultTabContent, tabC } = this.state;
        const tabIndex=this.props.location.state&&this.props.location.state.tabIndex
        const equipmentItem=this.props.location.state&&this.props.location.state.equipmentItem
        return (
            <div>
                <div className="create-device-page">
                    <div className="fixed-panel">
                        <Breadcrumb>
                            <Breadcrumb.Item><a href="#" onClick={ (e) => { this.props.history.goBack() } }>设备参数分析</a></Breadcrumb.Item>
                            <Breadcrumb.Item>设备参数详情</Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h1>{equipmentItem&&equipmentItem.equipmentName}</h1>
                        </div>
                        <div className="info" style={{display: isShowFilter ? "flex" : "none"}}>
                            <div style={{ width: '80px', height: '80px', background: '#dcdcdc', marginRight: '20px' }}>
                                <img src={Random.image('80x80', '#FF6600')} alt=""/>
                            </div>
                            <div>
                                <div style={{marginBottom: '20px'}}><span>类型:</span>{equipmentItem&&equipmentItem.vendor}</div>
                                <div><span>编码:</span>{equipmentItem&&equipmentItem.equipmentCode}</div>
                            </div>
                        </div>
                    </div>
                    <div className="subtitle-panel data-report">
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
                    <Tabs defaultActiveKey={tabIndex||'1'} onChange={this.tabChange}>
                        {
                            devicesParams.length && devicesParams.map((item,index)=>
                                <TabPane tab={item.measurementId} key={index}>
                                    {tabC}
                                    {/*{this.tabContent({devicesParam:item})}*/}
                                </TabPane>
                            )
                        }
                    </Tabs>
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
                <FilterData visibleFilter={this.state.visibleFilter} showFilterModal={this._showFilterModal}/>
            </div>
        )
    }
    render() {
        const { isShowFilter, isPingFilters } = this.state;
        return (
            <div className="back-color">
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
