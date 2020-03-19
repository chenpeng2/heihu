import React from "react"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as  inputDataActionCreator from 'redux/actions/QCDataActionCreators'
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { gettableSettings } from 'redux/selectors/QCDataSelector'
import LogDialog from '../tables/commonLogDialog'
import Header from 'component/common/Header'
import MaterialTableDemo from 'component/tables/editableTable'
import request from 'utils/urlHelpers'
import { paramsToString, addFiltersToParam } from 'utils/formatHelper'
import SearchTab from 'component/tables/searchTab'

class projectTypeDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            codeType: true,
            defaultDataParams: {
                page: 1,
                page_size: 100,
                sort: 'project_type',
                direaction: 'asc'
            },
            tableData: {
                isFetching: true,
            },
            filterData: {},
            logListData: {
                isFetching: true,
            },
        }
        this.columns = [
            {
                title: 'Project Type',
                field: 'projectType',
                defaultSort: 'asc',
            }, {
                title: '填报记录',
                field: 'inputHistory',
                editable: 'never',
                sorting: false,
                render: value => {
                    return (
                        value.id ? <a
                            onClick={() => this.viewLogList(value.id)}
                            className="table-button"
                        >  查看
                </a> :
                            <a disabled={true}>查看</a>
                    )
                }
            }
        ]
    }

    componentDidMount() {
        const params = this.state.defaultDataParams
        this.getTableList(params)
    }

    createInputData = (newData) => {
        return request({
            url: `/projecttypes`,
            method: 'POST',
            data: {
                ...newData,
            },
            success: res => {
                if (res && res.code !== 0) {
                    alert(res.msg)
                } else {
                    return res
                }
            }
        })
    }

    getTableList = (params) => {
        const { defaultDataParams, tableData, filterData } = this.state
        const { page_size } = params
        for (let i in params) {
            if (!['page','page_size','sort','direaction'].includes(i)) {
                filterData[i] = params[i]
            }
        }
        params = addFiltersToParam(filterData, params)
        defaultDataParams.page_size = page_size
        tableData.isFetching = true
        this.setState({
            filterData,
            tableData,
            defaultDataParams
        })
        return request({
            url: `/projecttypes?${paramsToString(params)}`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    this.setState({
                        tableData: {
                            list: res.data,
                            isFetching: false,
                            pageInfo: {
                                pageCount: res.pageCount,
                                page: res.pageNo,
                                pageSize: res.pageSize,
                                total: res.totalRecord,
                            }
                        }
                    })
                } else {
                    alert('请求数据失败')
                    this.setState({
                        tableData: {
                            isFetching: false,
                        }
                    })
                }
            }
        })
    }

    refreshTable = () => {
        const params = this.state.defaultDataParams
        this.getTableList(params)
    }

    updateTableList = (data) => {
        const ids = Object.keys(data).join(',')
        return request({
            url: `/projecttypes/${ids}`,
            method: 'PUT',
            data: {
                ...data,
            },
            success: res => {
                if (res && res.code !== 0) {
                    alert(res.msg)
                } else {
                    return res
                }
            }
        })
    }


    deleteTableList = (ids) => {
        return request({
            url: `/projecttypes/${ids}`,
            method: 'DELETE',
            success: res => {
                if (!res) {
                    alert('数据错误')
                }
            }
        })
    }

    viewLogList = (key) => {
        this.setState({
            showLogList: true,
            logListData: {
                isFetching: true,
            }
        })
        return request({
            url: `/projecttypehistories?oId=${key}`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                   this.setState({
                    logListData:{
                        list: res.data
                    } 
                   })
                }
            }
        })
    }

    closeLogListModal = () => {
        this.setState({
            showLogList: false,
        })
    }

    getLogListColumns() {
        const columns = [
            {
                title: 'Project Type',
                field: 'projectType',
            }, {
                title: '填报人',
                field: 'userName',
                align: 'right'
            }, {
                title: '填报日期',
                field: 'updatedAt',
                align: 'center',
                defaultSortOrder: 'descend',
                render: value => {
                    return value.updatedAt.split('.')[0]
                }
            }
        ]
        return columns
    }

    render() {
        const { settingData } = this.props
        const { logListData, tableData, defaultDataParams } = this.state
        const { showLogList } = this.state
        const columns = this.columns.filter(column => {
            if (settingData) {
                return settingData.columns.includes(column.field) || column.isMust
            } else {
                return column
            }
        }
        )
        return (
            <div>
                <Header />
                <div className="main-panel-light">
                    <SearchTab searchName={'projectType'} defaultDataParams={defaultDataParams} getTableList={this.getTableList}/>
                    <MaterialTableDemo
                        columns={columns}
                        data={tableData}
                        title={`主数据维护 Project Type 信息维护`}
                        searchable={false}
                        width={'600px'}
                        createData={this.createInputData}
                        updateData={this.updateTableList}
                        deleteData={this.deleteTableList}
                        getTableList={this.getTableList}
                        tableType={'projectType'}
                        direaction={'asc'}
                        sort={'project_type'}
                    />
                    {
                        showLogList &&
                        <LogDialog
                            logList={logListData}
                            getColumns={this.getLogListColumns}
                            defaultVisible={this.state.showLogList}
                            closeModal={this.closeLogListModal}
                        />
                    }
                </div>
            </div>)
    }
}

const mapStateToProps = (state) => {
    const settingData = gettableSettings(state)
    return {
        settingData,
    }
}

const mapDispatchToProps = (dispatch) => {
    const inputActions = bindActionCreators(inputDataActionCreator, dispatch)
    const routeActions = bindActionCreators(RouteActionCreators, dispatch)
    return {
        inputActions,
        routeActions
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(projectTypeDataPage);