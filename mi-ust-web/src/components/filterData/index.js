import React, { PureComponent } from 'react';
import { Form, Input, Select, Button, Table, Icon, Affix, DatePicker, Checkbox, Modal } from 'antd';
import Immutable from 'immutable'
const { Search } = Input;
const { Option } = Select;
const NullObj = {
    start_time:null,
    end_time:null,
    produceOrder:'',
    reason:''
}
class FilterData extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            filterIndex:0,
            filterMap:Immutable.fromJS(NullObj)
        }
    }
    chooseIndex = (index)=> {
        this.setState({filterIndex:index})
    }
    changeStartTime = (e)=>{
        const {filterMap}=this.state;
        this.setState({filterMap:filterMap.set('start_time',e)})
    }
    changeEndTime = (e)=>{
        const {filterMap}=this.state;
        this.setState({filterMap:filterMap.set('end_time',e)})
    }
    changeProduceOrder = (e)=>{
        const {filterMap}=this.state;
        this.setState({filterMap:filterMap.set('produceOrder',e)})
    }
    changeReason = (e)=>{
        const {filterMap}=this.state;
        this.setState({filterMap:filterMap.set('reason',e)})
    }
    filterContent = ()=> {
        const children = [<Option key="1">车间1</Option>, <Option key="2">车间2</Option>];
        let dom;
        const {filterMap}=this.state
        const produceOrder = filterMap.get('produceOrder')
        const reason = filterMap.get('reason')
        if(this.state.filterIndex===0){
             dom = <div className="contents">
                <div className="item flex-space-between">
                    <div>过滤对象</div>
                </div>
                <div className="item flex-space-between">
                    <div>起始异常查询时间：</div>
                    <DatePicker size="small" value={filterMap.get('start_time')} suffixIcon={<i className="sap-icon icon-appointment-2"></i>} placeholder="起始时间" onChange={this.changeStartTime}/>
                </div>
                <div className="item flex-space-between">
                    <div>截止异常查询时间：</div>
                    <DatePicker size="small" value={filterMap.get('end_time')} suffixIcon={<i className="sap-icon icon-appointment-2"></i>} placeholder="截止时间" onChange={this.changeEndTime}/>
                </div>
                <div className="item flex-space-between">
                    <div>生产订单：</div>
                    <Select
                        size="small"
                        placeholder="请选择生产订单"
                        style={{ width: 163 }}
                        onChange={this.changeProduceOrder}
                        value={produceOrder?produceOrder:undefined}
                    >
                        {children}
                    </Select>
                </div>
                <div className="item flex-space-between">
                    <div>异常原因：</div>
                    <Select
                        size="small"
                        placeholder="请选择异常原因"
                        style={{ width: 163 }}
                        onChange={this.changeReason}
                        value={reason?reason:undefined}
                    >
                        {children}
                    </Select>
                </div>
            </div>
        }else{
            dom = <div className="contents">
                <div className="item flex-space-between">
                    <div><Checkbox/>全选（2/8）</div>
                </div>
                <div className="item flex-space-between">
                    <div><Checkbox/>List1</div>
                </div>
                <div className="item flex-space-between">
                    <div><Checkbox/>List2</div>
                </div>
                <div className="item flex-space-between">
                    <div><Checkbox/>List3</div>
                </div>
                <div className="item flex-space-between">
                    <div><Checkbox/>List4</div>
                </div>
            </div>
        }
        return dom
    }
    reSet = ()=> {
        this.setState({filterMap:Immutable.fromJS(NullObj)})
    }
    handleCancel = e => {
        this.setState({
            visible: false,
        });
    };
    handleFilter = e => {
        const {filterMap} = this.state
        this.props.showFilterModal(1,filterMap)
    };
    handleFilterCancel = e => {
        const {filterMap} = this.state
        this.props.showFilterModal(0,filterMap)
    };

    render() {
        const {filterIndex} = this.state
        const {visibleFilter} = this.props
        return (
            <Modal
                className="edit-modal filter-edit-modal"
                closable={false}
                centered={true}
                visible={visibleFilter}
                footer={<div className="footer">
                    <div onClick={this.handleFilter}>确定</div>
                    <div style={{color:'#0854A1'}} onClick={this.handleFilterCancel}>取消</div>
                </div>}
            >
                <div className="filter-data">
                    <div className="header flex-space-between">
                        <div className="tab">
                            <i className={filterIndex===0?"sap-icon icon-table-column active":"sap-icon icon-table-column"} onClick={()=>this.chooseIndex(0)}></i>
                            <i className={filterIndex===1?"sap-icon icon-table-column active":"sap-icon icon-filters"} onClick={()=>this.chooseIndex(1)}></i>
                        </div>
                        <span>{filterIndex===0?'过滤器':'定义列属性'}</span>
                        <Button type="primary" onClick={this.reSet}>重置</Button>
                    </div>
                    {this.filterContent()}
                </div>
            </Modal>
        );
    }
}
export default FilterData;
