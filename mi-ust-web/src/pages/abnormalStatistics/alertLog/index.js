import React, { PureComponent, useState, useEffect } from 'react';
import { Form, Input, Select, Button, message, DatePicker, Modal, Badge, Tag } from 'antd';
import ExcelUtil from '@src/components/tableExport/index';
import EditableTable from 'components/antdEditTable/editTable'
import request from 'util/http'
import * as loginActions from 'redux/actions/loginActionCreators'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { getloginState } from 'redux/selectors/loginSelector'
const { Option } = Select;
// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
    submit = () => {  // 将表单数据传给父组件
        const { form, parent } = this.props;
        parent.getFilterFormMsg(this, form.getFieldsValue())
    };
    componentDidMount(){
        this.getErrorReason()
    }
    // 获取异常原因
    getErrorReason(params) {
        request({
            url: `/errormanager/query?pageNum=1`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const { data } = res
                this.props.parent.getReason(data.result)
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    disabledStartTime = (current)=> {
        const { form } = this.props
        const endTime = form.getFieldValue('endTime')
        return current && current > endTime;
    }
    disabledEndTime = (current)=> {
        const { form } = this.props
        const startTime = form.getFieldValue('startTime')
        return current && current < startTime;
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { typeList, codeList } = this.props;
        // 数据转成option组件
        const defaultItem = [<Option key='all'>全部</Option>];
        const types = defaultItem.concat( typeList.map( (item) => { return <Option key={ item }>{ item }</Option> } ) );
        return (
            <Form layout="inline" className="default-form">
                <Form.Item label="设备名称：">
                    {getFieldDecorator('equipmentCode')(
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="选择异常设备" style={{ width: '200px' }}>{ types }</Select>
                    )}
                </Form.Item>
                <Form.Item label="处理状态">
                    {getFieldDecorator('hasWarned')(
                        <Select
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            placeholder="选择处理状态" style={{ width: '200px' }}>
                                <Option key='0'>全部</Option>
                                <Option key='1'>未处理</Option>
                                <Option key='2'>已处理</Option>
                            </Select>
                    )}
                </Form.Item>
                <Form.Item label="订单号：">
                    {getFieldDecorator('taskCode')(
                        <Input placeholder="选择订单号" />
                    )}
                </Form.Item>
                <Button onClick={this.submit} className="filter-submit" type="primary">查询</Button>
            </Form>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);
class ParamStandMaintenance extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            selectedRows: [],
            columns: [{
                title: '告警时间',
                field: 'ts',
                editable: 'never',
            }, {
                title: '设备编码',
                field: 'equipmentCode',
                editable: 'never',
            }, {
                title: '设备参数',
                field: 'measurementId',
                editable: 'never',
            }, {
                title: '处理状态',
                field: 'hasWarned',
                editable: 'never',
                render:(text)=>{
                    let errorStatus = text.dealt, color, borderColor, backColor;
                    if(errorStatus){
                        errorStatus = '已处理'
                        color = '#6FD8BE'
                        backColor = '#F7FFFD'
                        borderColor = '#C1FDE1'
                    }else{
                        errorStatus = '未处理'
                        color = '#A7A4DA'
                        backColor = '#FCFBFF'
                        borderColor = '#E8E6FF'
                    }
                    return <Tag style={{color:color,backgroundColor:backColor,borderColor:borderColor}}>{errorStatus}</Tag>
                }
            }, {
                title: '处理人',
                field: 'handler',
                editable: 'never',
            }, {
                title: '订单号',
                field: 'taskCode',
                editable: 'never',
            }, {
                title: '处理时间',
                field: 'lastUpdate',
                editable: 'never',
            }, {
                title: '条件',
                field: 'condition',
                render: (text)=> {
                    let condition;
                    switch(text.condition) {
                        case 'e':
                            condition = '等于'
                            break;
                        case 'ue':
                            condition = '不等于'
                            break;
                        case 'g':
                            condition = '大于'
                            break;
                        case 'ge':
                            condition = '大于等于'
                            break;
                        case 'l':
                            condition = '小于'
                            break;
                        case 'le':
                            condition = '小于等于'
                            break;
                        default:
                            condition = '范围内'
                    } 
                    return condition
                },
                editable: 'never',
            }, {
                title: '数值1',
                field: 'value1',
                editable: 'never',
            }, {
                title: '数值2',
                field: 'value2',
                editable: 'never',
            }, {
                title: '实际值',
                field: 'value',
                editable: 'never',
            }, {
                title: '备注',
                field: 'comment',
                editComponent: (props)=>{
                    const causeList = props.rowData.causeList
                    if(causeList && (causeList.indexOf(0) > -1 || causeList.indexOf('0') > -1)){
                        return  <input
                                    value={props.value}
                                    onChange={e => { props.onChange(e.target.value) }}
                                />
                    }
                    return null
                },
                render:(text)=>{
                    const comment = text.comment
                    if(text.causeList && text.causeList.indexOf(0) === -1){
                        return null
                    }
                    return comment
                }
            }, {
                title: '异常原因',
                field: 'causeList',
                editComponent: props => {
                    let value = props.value, valueArr = []
                    const { resultData } = this.state
                    const children = resultData && resultData.length > 0 ? resultData.map((item,index)=><Option key={item.errorId} style={item.errorId === 0 ? {color:'#00af98'} : {}}>{item.errorName}</Option>) : null
                    if(value && value.length > 0){
                        value.map((item,index) => {
                            valueArr.push(String(item))
                        })
                    }
                    return  <Select
                                className='cause-list'
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="请选择异常原因!"
                                defaultValue={valueArr}
                                onChange={e => props.onChange(e)}
                            >
                                {children}
                            </Select>
                },
                render:(text)=>{
                    const causeList = text.causeList
                    const { lookup } = this.state
                    let str = ''
                    lookup && causeList && causeList.length > 0 ? causeList.map((item,index)=> {
                        if(str){
                            str = str + '&' + lookup[item]
                        }else{
                            str = str + lookup[item]
                        }
                    }) : ''
                    return str
                }
            }],
            data: [],
            EquipmentCodeList: [],
            EquipmentParams: [],
            isFetching:true,
            editingKey: '',
            isShowFilter: true,
            isPingFilters: false,
            device: {
                number: null,  // 设备名称
                type: null,  // 设备类型
                time: null,  // 编码
            },
            deleteModal:false,
            pageSize:10,
            pageNum:1
        }
    }
    isEditing = record => record.key === this.state.editingKey;
    edit(key) {
        this.setState({ editingKey: key });
    }
    componentDidMount(){
        this.getEquipmentCodeList();
        const {state}=this.props.location
        let equipmentItem = state && state.equipmentItem
        let tabIndex = state && state.tabIndex
        let params = {}
        if(equipmentItem){
            params.equipmentCode=equipmentItem.equipmentCode
            params.measureId=tabIndex
        }
        this.getWarningRecordList(params)
    }
    //过滤前面有没有&
    filterUrl = (url) => {
        let Urls = url.trim()
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    getEquipmentCodeList = ()=> {
        request({
            url: `/equipment/getEquipmentCodeList`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const { data } = res
                this.setState({ EquipmentCodeList: data })
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    getWarningRecordList = (params)=> {
        const equipmentCodeList = (params && params.equipmentCodeList) ? `&equipmentCodeList=${params.equipmentCodeList}` : '&equipmentCodeList=YDSC049'
        let isDealt = ''
        if(params && params.hasWarned === '1'){
            isDealt='false'
        }else if(params && params.hasWarned === '2'){
            isDealt='true'
        }  
        isDealt=isDealt ? `&isDealt=${isDealt}` : ''
        const orderByImportance = (params && params.orderByImportance) ? `&orderByImportance=${params.orderByImportance}` : ''
        const pageNum = (params && params.page) ? `&pageNum=${params.page}` : '&pageNum=1'
        const pageSize = (params && params.page_size) ? `&pageSize=${params.page_size}` : '&pageSize=10'
        const pams = this.filterUrl(`${equipmentCodeList}${isDealt}${orderByImportance}${pageNum}${pageSize}`)
        request({
            url: `/warning/list?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                let { data } = res
                this.setState({ data, isFetching:false})
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
    initColumn = (columns)=> {
        let newColumns=columns;
        newColumns.map((item,index)=>{
            newColumns[index].key=item.field;
        })
        return newColumns
    }
    importFile = (e)=> {
        ExcelUtil.importExcel(e)
        var timer = setInterval(()=>{
            if(ExcelUtil.importFile()){
                clearInterval(timer)
            }
        })
    }
    getStandardList = (data)=> {
        this.getWarningRecordList(data)
    }
    getFilterFormMsg(child, formData) {
        this.getWarningRecordList(formData);
    }
    updateErrorRecordList = (params)=> {
        const userInfo = this.props.userInfo
        const handler = userInfo.user && userInfo.user.username
        let { id, causeList, comment, errorStatus } = params
        return request({
            url: `/errorrecord/updaterecord`,
            method: 'PUT',
            data:{
                id,
                causeList,
                comment,
                errorStatus,
                handler,
            },
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    message.success('更新成功！');
                    return res
                }
            },
            error: () => {
                message.error('数据出错');
            }
        })
    }
    getReason = (data)=> {
        let newObj = {}
        data.map((item,index)=>{
            newObj[item.errorId] = item.errorName
        })
        this.setState({lookup:newObj,resultData:data})
    }
    render() {
        let { columns, data, isFetching, pageSize, pageNum, EquipmentCodeList } = this.state;
        columns = columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            };
        });
        const initColumn = this.initColumn(columns)
        const total = data && data.total ? data.total : 0
        return (
            <div className="reason">
                <div className="filter-panel">
                    <FilterFormBox parent={this} typeList={EquipmentCodeList} />
                </div>
                <div className="main-panel">
                    <div className="operate" style={{padding:'0px'}}>
                        <div className="flex-space-between">
                            {/* <span className="import">
                                <span><Button type="primary">导入</Button></span>
                                <input type='file' accept='.xlsx, .xls' onChange={(e)=>{this.importFile(e)} }/>
                            </span> */}
                            {/* <span onClick={() => {ExcelUtil.exportExcel(initColumn, data.warningList,"异常原因.xlsx",this.state.lookup)}}><Button type="primary">导出</Button></span> */}
                        </div>
                    </div>
                    <EditableTable
                        title={"告警记录（" + total + '）'}
                        hasPaging={true} columns={columns}
                        updateData={false}
                        createData={false}
                        data={{list: data?data.warningList:[], isFetching,pageInfo:{
                            total:total,
                            pageSize:pageSize,
                            page:pageNum
                        }}}
                        deleteData={false}
                        getTableList={this.getStandardList}
                        antdPagination={true}
                    />
                </div>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
        userInfo
    }
  }
  
  const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
  }
  const WrappedParamStandMaintenance = Form.create({ name: 'time_related_controls' })(ParamStandMaintenance);
  export default connect(
    mapStateToProps,
    mapDispatchToProps,
  )(WrappedParamStandMaintenance)
