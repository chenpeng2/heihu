import React from "react"
import { connect } from "react-redux";
import LogDialog from '../tables/commonLogDialog'
import Header from 'component/common/Header'
import MaterialTableDemo from 'component/tables/editableTable'
import request from 'utils/urlHelpers'
import { gettableSettings } from 'redux/selectors/QCDataSelector'
import { paramsToString, addFiltersToParam } from 'utils/formatHelper'
import FilterTab from 'component/tables/filterTab'

class factoryDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            codeType: true,
            defaultDataParams: {
                page: 1,
                page_size: 100,
                sort: 'factory_cn',
                direaction: 'asc',
            },
            tableData: {
                isFetching: true,
            },
            filterData: {},
            logListData: {
                isFetching: true,
            }
        }
        this.columns = [
            {
                title: '工厂名称',
                field: 'factoryCn',
                align: 'left',
                width: '8%',
                editable: 'never',
                defaultSort: 'asc',
            },
            {
                title: 'Vendor Name',
                field: 'vendorName',
            },
            {
                title: 'Factory Name',
                field: 'factoryEn',
            }, {
                title: 'Factory City',
                field: 'factoryCity',
            }, {
                title: '填报记录',
                field: 'inputHistory',
                editable: 'never',
                sorting: false,
                render: value => {
                    return (
                        value.id ?
                            <a
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
            url: `/factories`,
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
            url: `/factories?${paramsToString(params)}`,
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
            url: `/factories/${ids}`,
            method: 'PUT',
            data: {
                ...data,
            },
            sucees: res => {
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
            url: `/factories/${ids}`,
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
            url: `/factoryhistories?oId=${key}`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                   this.setState({
                    logListData: {
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
                title: '工厂名称',
                field: 'factoryCn',
                width: '8%'
            }, {
                title: 'Vendor Name',
                field: 'vendorName',
            }, {
                title: 'Factory Name',
                field: 'factoryEn',
            }, {
                title: 'Factory City',
                field: 'factoryCity',
            }, {
                title: '填报人',
                field: 'userName',
            }, {
                title: '填报日期',
                field: 'updatedAt',
                defaultSortOrder: 'descend',
                render: value => {
                    return value.updatedAt.split('.')[0]
                }
            }
        ]
        return columns
    }

    render() {
        const { settingData, } = this.props
        const { designNoList, tableData, logListData, defaultDataParams } = this.state
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
                    <FilterTab getTableList={this.getTableList} selectList={['factoryCn', 'vendorName','factoryEn', 'factoryCity']} defaultDataParams={defaultDataParams}/>
                    <MaterialTableDemo
                        columns={columns}
                        data={tableData}
                        title={`主数据维护 工厂信息维护`}
                        searchable={false}
                        width={'600px'}
                        designNoList={designNoList}
                        createData={false}
                        updateData={this.updateTableList}
                        deleteData={this.deleteTableList}
                        getTableList={this.getTableList}
                        tableType={'factoryData'}
                        direaction={'desc'}
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
    return {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(factoryDataPage);