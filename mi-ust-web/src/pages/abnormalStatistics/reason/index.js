import React, { PureComponent } from 'react';
import { Form, Breadcrumb, message, Button } from 'antd';
import EditableTable from 'components/antdEditTable/editTable'
import request from 'util/http'
import { projectUrl } from 'util/userApi'
import * as loginActions from 'redux/actions/loginActionCreators'
import { connect } from "react-redux"
import { bindActionCreators } from "redux"
import { getloginState } from 'redux/selectors/loginSelector'
import ExcelUtil from '@src/components/tableExport/index';
import XLSX from 'static/import.xlsx'
class FilterForm extends React.Component {
    render() {
        return (
            <Breadcrumb separator="">
                <Breadcrumb.Item href={projectUrl + '#/abnormalStatistics/abnormalList'}>异常分析</Breadcrumb.Item>
                <Breadcrumb.Separator />
                <Breadcrumb.Item href={projectUrl + '#/abnormalStatistics/reason'}>异常原因</Breadcrumb.Item>
            </Breadcrumb>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);
class ParamStandMaintenance extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            columns: [{
                title: '异常编号',
                field: 'errorId',
                sorting: false,
                editable:'never',
                render:(text,id,row)=>{
                    const { showPageNum } = this.state
                    const baseSize = (showPageNum-1)*10
                    return showPageNum ? text.tableData.id + 1 + baseSize : null
                }
            }, {
                title: '异常原因',
                field: 'errorName',
            }, {
                title: '异常描述',
                field: 'errorDes',
            }, {
                title: '创建时间',
                field: 'createTime',
                editable:'never'
            }],
            data: [],
            isFetching:true,
            pageSize:10,
            pageNum:1
        }
    }
    componentDidMount(){
        this.getErrorReason()
    }
    //过滤前面有没有&
    filterUrl = (url) => {
        let Urls = url.trim()
        if(Urls.substr(0,1)=='&'){
            Urls =  Urls.substr(1)
        }
        return Urls
    }
    // 获取异常原因
    getErrorReason(params) {
        const pageNum = (params && params.page) ? `&pageNum=${params.page}` : '&pageNum=1'
        const pageSize = (params && params.page_size) ? `&pageSize=${params.page_size}` : '&pageSize=10'
        const pams = this.filterUrl(`${pageNum}${pageSize}`)
        request({
            url: `/errormanager/query?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const { data } = res
                this.setState({ data, isFetching:false, showPageNum: pageNum.split('=')[1]})
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    // 添加异常原因
    addParameter = (param) => {
        const objStr = JSON.stringify(param)
        const data = JSON.parse('['+objStr+']')
        return request({
            url: `/errormanager/manage`,
            method: 'PUT',
            data,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    return res
                }
            },
            error: (err) => {
                message.error('数据出错');
            }
        })
    }
    // 编辑异常原因
    updateParameter = (param,type) => {
        const objStr = JSON.stringify(param)
        let data = JSON.parse('['+objStr+']')
        if(type == 1){
            data = param
        }
        return request({
            url: `/errormanager/manage`,
            method: 'PUT',
            data,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    if(type == 1){
                        message.success('导入成功');
                        this.setState({toFirstPage:true},()=>this.getErrorReason())
                    }
                    return res
                }
            },
            error: (err) => {
                message.error('数据出错');
            }
        })
    }
    switchKey = (i)=>{
        let condition;
        switch(i) {
            case '异常原因':
                condition = 'errorName'
                break;
            case '异常描述':
                condition = 'errorDes'
                break;
            default:
                condition = ''
        } 
        return condition
    }
    importFile = (e)=> {
        let ee = e.target
        ExcelUtil.importExcel(e)
        var timer = setInterval(()=>{
            const fileData = ExcelUtil.importFile()
            if(fileData){
                let files = []
                fileData.map((item,index)=>{
                    let obj = {}
                    for (var i in item){
                        const key = this.switchKey(i)
                        obj[key] = item[i]
                        if(obj.errorId === 'null'){
                            obj.errorId = '0'
                        }
                        if(obj.errorId === 'null'){
                            obj.errorId = '0'
                        }
                    }
                    if(obj.errorName){
                        if(!obj.errorDes){
                            obj.errorDes=''
                        }
                        files.push(obj)
                    }
                })
                ee.value = ''
                this.updateParameter(files,1)
                clearInterval(timer)
            }
        })
    }
    getStandardList = (data)=> {
        this.getErrorReason(data)
    }
    render() {
        let { columns, data, isFetching, pageSize, pageNum, toFirstPage } = this.state;
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
        const { userInfo } = this.props
        let authorities = userInfo.user && userInfo.user.authorities
        let hasMaster = authorities && authorities.filter((item,index)=>{
            return item.authority==='master' || item.authority ==='system'
        })
        hasMaster = hasMaster && hasMaster.length === 0
        const total = data && data.total ? data.total : 0
        return (
            <div className="reason">
                <div className="filter-panel">
                    <FilterFormBox parent={this}/>
                </div>
                <div className="main-panel add-import">
                    <div className="operate" style={{padding:'0px'}}>
                        <div className="flex-space-between">
                            <span className="import">
                                <span><Button type="primary"><a href={XLSX} download='导入模版.xlsx'>下载模板</a></Button></span>
                            </span>
                            <span className="import">
                                <span><Button type="primary">导入</Button></span>
                                <input type='file' accept='.xlsx, .xls' onChange={(e)=>{this.importFile(e)} }/>
                            </span>
                            {/* <span onClick={() => {ExcelUtil.exportExcel(initColumn, data,"异常原因.xlsx",this.state.lookup)}}><Button type="primary">导出</Button></span> */}
                        </div>
                    </div>
                    <EditableTable
                        title={"异常原因（" + total + '）'}
                        hasPaging={true} columns={columns}
                        updateData={hasMaster ? false : this.updateParameter}
                        createData={hasMaster ? false : this.addParameter}
                        data={{list: data?data.result:[], isFetching,pageInfo:{
                            total:total,
                            pageSize:pageSize,
                            page:pageNum
                        }}}
                        deleteData={false}
                        getTableList={this.getStandardList}
                        antdPagination={true}
                        toFirstPage={toFirstPage}
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
const WrappedParamStandMaintenance = Form.create({ name: 'params_search' })(ParamStandMaintenance);
export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(WrappedParamStandMaintenance)
