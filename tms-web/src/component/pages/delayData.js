import React from "react"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as  QCDataActionCreator from 'redux/actions/QCDataActionCreators'
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { getInputDataListState, gettableSettings, getlogListState } from 'redux/selectors/QCDataSelector'
import moment from 'moment'
import LogDialog from '../tables/commonLogDialog'
import Header from 'component/common/Header'
import MaterialTableDemo from 'component/tables/editableTable'
import TextField from '@material-ui/core/TextField'
import request from 'utils/urlHelpers'
import IntegrationDownshift from 'component/common/searchInput'
import { paramsToString, addFiltersToParam } from 'utils/formatHelper'
import FilterTab from 'component/tables/filterTab'

class delayDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            codeType: true,
            defaultDataParams: {
                page: 1,
                page_size: 100,
                sort: 'created_day',
                direaction: 'desc',
            },
            filterData: {},
            tableData: {
                isFetching: true,
            },
            logListData: {
                isFetching: true,
            },
        }
        this.columns = [
            {
                title: 'Design No.',
                field: 'designNo',
                issearch: 'true',
                isMust: true,
                render: value => {
                    return value.designNo
                },
                editComponent: props => {
                    return (
                        <IntegrationDownshift
                            defaultInputValue={props.rowData.designNo}
                            suggestions={this.state.designNoList}
                            onChangeInput={value => {
                                if (value) {
                                    props.rowData.designNo = value
                                    props.onRowDataChange(props.rowData)
                                }

                            }
                            }
                        />
                    )
                }
            }, {
                title: 'Date',
                field: 'createdDay',
                isMust: true,
                align: 'center',
                render: (value) => {
                    return value.createdDay.replace(RegExp('-', 'g'), '/')
                },
                defaultSort: 'desc',
                editComponent: props => {
                    return (
                        <TextField
                            id="date"
                            type="date"
                            defaultValue={props.rowData.createdDay}
                            value={props.rowData.createdDay}
                            onChange={e => {
                                if (moment(e.target.value) - moment(new Date()) > 0) {
                                    alert('请输入不大于今天的时间')
                                } else {
                                    props.onChange(e.target.value)
                                }
                            }
                            }
                        />
                    )
                }
            }, {
                title: 'Factory Name',
                field: 'factoryEn',
                disabled: true,
                isMust: false,
                align: 'left',
                defaultSort: 'desc',
                editable: false
            }, {
                title: '# of Shipment Extensions',
                field: 'shipmentExt',
                isMust: false,
            }, {
                title: 'Delay Reason/Quater/Region',
                field: 'reason',
                isMust: false,
            }, {
                title: 'Dealy Total Qty',
                field: 'totalQty',
                align: 'right',
                type: 'numeric'
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

    componentWillMount() {
        request({
            url: `/programmasterdata/designnos`,
            method: 'GET',
            success: res => {
                const list = res.data
                const selectList = []
                list && list.forEach(item => {
                    selectList.push({ 'label': item })
                })
                this.setState({
                    designNoList: selectList,
                })
            }
        })
        request({
            url: `/factories/factorynames`,
            method: 'GET',
            success: res => {
                const list = res.data
                const selectList = []
                list && list.forEach(item => {
                    selectList.push({ 'label': item.factoryEn })
                })
                this.setState({
                    factoryList: selectList,
                })
            }
        })
    }
    createInputData = (newData) => {
        return request({
            url: `/delays`,
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
            url: `/delays?${paramsToString(params)}`,
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
                    alert('数据出错了')
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
            url: `/delays/${ids}`,
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
            url: `/delays/${ids}`,
            method: 'DELETE',
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
            url: `/delayhistories?oId=${key}`,
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

    searchDesignNo = (str) => {
        this.props.inputActions.getDesignNoList(str)
    }

    closeLogListModal = () => {
        this.setState({
            showLogList: false,
        })
    }

    getLogListColumns() {
        const columns = [
            {
                title: 'Design No.',
                field: 'designNo',
                align: 'center',
                width: '15%',
            },
            {
                title: 'Date',
                field: 'createdDay',
                align: 'left',
                width: '8%'
            },
            {
                title: 'Factory Name',
                field: 'factoryEn',
                align: 'left',
                cellStyle: {
                    width: '10%'
                }
            }, {
                title: '# of Shipment Extensions',
                field: 'shipmentExt',
                align: 'right',
            }, {
                title: 'Delay Reason/Quater/Region',
                field: 'reason',
                align: 'right',
            }, {
                title: 'Dealy Total Qty',
                field: 'totalQty',
                align: 'right',
            }, {
                title: '填报人',
                field: 'userName',
            }, {
                title: '填报日期',
                field: 'updatedAt',
                align: 'center',
                defaultSortOrder: 'descend',
            }
        ]
        return columns
    }

    render() {
        const { settingData } = this.props
        const { designNoList, logListData, tableData,  defaultDataParams } = this.state
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
                <div className="main-panel-light delay-data">
                    <FilterTab getTableList={this.getTableList} selectList={['designNo','date','factoryName']} defaultDataParams={defaultDataParams}/>
                    <MaterialTableDemo
                        columns={columns}
                        data={tableData}
                        title={`主数据维护 生产延期信息维护`}
                        searchable={false}
                        width={'600px'}
                        designNoList={designNoList}
                        createData={this.createInputData}
                        updateData={this.updateTableList}
                        deleteData={this.deleteTableList}
                        getTableList={this.getTableList}
                        tableType={'delayData'}
                        direction={'desc'}
                        hasDefaultDate={true}
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
    const logListData = getlogListState(state)
    const tableData = getInputDataListState(state)
    const settingData = gettableSettings(state)
    return {
        tableData,
        settingData,
        logListData,
    }
}

const mapDispatchToProps = (dispatch) => {
    const inputActions = bindActionCreators(QCDataActionCreator, dispatch)
    const routeActions = bindActionCreators(RouteActionCreators, dispatch)
    return {
        inputActions,
        routeActions
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(delayDataPage);