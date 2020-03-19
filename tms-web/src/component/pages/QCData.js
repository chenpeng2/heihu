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
import { tableStyles, addFiltersToParam, paramsToString } from 'utils/formatHelper'
import FilterTab from 'component/tables/filterTab'
import IntegrationDownshift from 'component/common/searchInput'
class QCDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            codeType: true,
            defaultDataParams: {
                page: 1,
                page_size: 100,
                direaction: 'desc',
            },
            filterData: {}
        }
        this.columns = [
            {
                title: '填报日期',
                field: 'createdDay',
                isMust: true,
                align: 'center',
                cellStyle: {
                    ...tableStyles.cellStyle,
                    width: '170px',
                },
                headerStyle: {
                    ...tableStyles.headerStyle,
                    width: '170px',
                },
                render: (value) => {
                    return value.createdDay.replace(RegExp('-', 'g'), '/')
                },
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
            },
            {
                title: 'Design No.',
                field: 'designNo',
                issearch: 'true',
                isMust: true,
                cellStyle: {
                    ...tableStyles.cellStyle,
                },
                headerStyle: tableStyles.headerStyle,
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
                                    request({
                                        url: `/programmasterdata?design_no=${value}`,
                                        method: 'GET',
                                    }).then(res => {
                                        if (res.data) {
                                            const otherData = res.data[0]
                                            props.rowData.designNo = otherData.designNo
                                            props.rowData.designName = otherData.designName
                                            props.rowData.programNo = otherData.programNo
                                            props.rowData.programName = otherData.programName
                                            props.onRowDataChange(props.rowData)
                                        }
                                    })
                                }

                            }
                            }
                        />
                    )
                }
            }, {
                title: 'Design Name',
                field: 'designName',
                disabled: true,
                isMust: false,
                sorting: false,
                align: 'left',
                ...tableStyles,
                editComponent: props => {
                    return (
                        <a disabled={true}>{}</a>
                    )
                }
            }, {
                title: 'Program No.',
                field: 'programNo',
                disabled: true,
                isMust: true,
                cellStyle: {
                    ...tableStyles.cellStyle,
                },
                headerStyle: tableStyles.headerStyle,
                editComponent: props => {
                    return (
                        <a disabled={true}>{}</a>
                    )
                }
            }, {
                title: 'Program Name',
                field: 'programName',
                disabled: true,
                isMust: false,
                align: 'left',
                sorting: false,
                ...tableStyles,
                editComponent: props => {
                    return (
                        <a disabled={true}>{}</a>
                    )
                }
            }, {
                title: 'Program Year.',
                field: 'programYear',
                isMust: false,
                sorting: false,
                align: 'left',
                ...tableStyles,
                editComponent: props => {
                    return (
                        <a disabled={true}>{}</a>
                    )
                }
            }, {
                title: 'TMS QC Passed',
                field: 'tmsQcPassed',
                sorting: false,
                isMust: false,
                ...tableStyles,
                type: 'numeric'
            }, {
                title: 'TMS QC Rejected',
                field: 'tmsQcRejected',
                sorting: false,
                isMust: false,
                ...tableStyles,
                type: 'numeric'
            }, {
                title: 'Intv. Taken',
                field: 'interventionTaken',
                align: 'right',
                sorting: false,
                ...tableStyles,
                type: 'numeric'
            }, {
                title: 'Intv. Passed',
                field: 'interventionPassed',
                sorting: false,
                isMust: false,
                ...tableStyles,
                type: 'numeric'
            }, {
                title: 'Intv. Rejected',
                field: 'interventionFailed',
                sorting: false,
                isMust: false,
                ...tableStyles,
                type: 'numeric'
            }, {
                title: '填报工厂',
                field: 'orgName',
                editable: 'never',
                sorting: false,
                ...tableStyles,
            }, {
                title: '填报人',
                field: 'userName',
                editable: 'never',
                sorting: false,
                ...tableStyles,
                align: 'left',
            }, {
                title: '填报记录',
                field: 'inputHistory',
                editable: 'never',
                sorting: false,
                ...tableStyles,
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

    getTheChangeData() {
        const { editData } = this.state
        const { tableData } = this.props
        if (editData) {
            const dataIndex = tableData.list.findIndex(item => editData.id === item.id)
            const item = tableData.list[dataIndex]
            dataIndex >= 0 && tableData.list.splice(dataIndex, 1, {
                ...item,
                ...editData,
            })
        }

        return tableData
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
                if (res) {
                    const list = res.data
                    const selectList = []
                    list && list.forEach(item => {
                        selectList.push({ 'label': item })
                    })
                    this.setState({
                        designNoList: selectList,
                    })
                }
            }
        })
        request({
            url: `/programmasterdata/programnos`,
            method: 'GET',
        }).then(res => {
            if (res) {
                const list = res.data
                this.setState({
                    programNoList: list,
                })
            }
        })
    }

    createInputData = (newData) => {
        return this.props.inputActions.createData(newData).then(res => {
            if (!res) {
                return
            }
            return res
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
        this.setState({
            filterData,
            tableData,
            defaultDataParams
        })
        this.props.inputActions.fetchTableList(paramsToString(params))
    }

    refreshTable = () => {
        const params = this.state.defaultDataParams
        this.getTableList(params)
    }

    updateTableList = (data) => {
        const ids = Object.keys(data).join(',')
        return this.props.inputActions.updateData(ids, data).then(res => {
            return res
        })
    }

    deleteTableList = (ids) => {
        return this.props.inputActions.deleteData(ids).then(res => {
            return res
        })
    }

    viewLogList = (key) => {
        const { getLogList } = this.props.inputActions
        this.setState({
            showLogList: true,
            logListData: {
                isFetching: true,
            }
        })
        getLogList(key)
    }

    closeLogListModal = () => {
        this.setState({
            showLogList: false,
        })
    }

    getLogListColumns() {
        const columns = [
            {
                title: '修改时间',
                field: 'updatedAt',
                key: 'updatedAt',
                ...tableStyles,
                render: value => {
                    //formate the update time
                    return value.updatedAt.split('.')[0].replace(RegExp('-', 'g'), '/')
                }
            },
            {
                title: '修改用户',
                field: 'userName',
                key: 'userName',
                ...tableStyles,
            },
            {
                title: 'Design No.',
                field: 'designNo',
                key: 'designNo',
                cellStyle: {
                    ...tableStyles.cellStyle,
                    minWidth: '100px',
                },
                headerStyle: tableStyles.headerStyle,
            }, {
                title: 'TMS QC Passed',
                field: 'tmsQcPassed',
                ...tableStyles,
            }, {
                title: 'TMS QC Rejected',
                field: 'tmsQcRejected',
                ...tableStyles,
            }, {
                title: 'Inv. Taken',
                field: 'interventionTaken',
                ...tableStyles,
            }, {
                title: 'Inv. Passed',
                field: 'interventionPassed',
                ...tableStyles,
            }, {
                title: 'Intv. Rejected',
                field: 'interventionFailed',
                ...tableStyles,
            }, {
                title: '填报日期',
                field: 'createdDay',
                ...tableStyles,
                defaultSortOrder: 'descend',
                render: value => {
                    //formate the update time
                    return value.createdDay.replace(RegExp('-', 'g'), '/')
                }
            }
        ]
        return columns
    }

    render() {
        const { settingData, logListData } = this.props
        const { designNoList, defaultDataParams } = this.state
        const data = this.getTheChangeData()
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
                <div className="main-panel-light selected-data qc-data">
                    <FilterTab getTableList={this.getTableList} selectList={['date','designNo', 'programNo']} defaultDataParams={defaultDataParams}/> 
                    <MaterialTableDemo
                        columns={columns}
                        data={data || {}}
                        title={`Daily QC & INT'N 数据填报`}
                        searchable={false}
                        width={'600px'}
                        designNoList={designNoList}
                        createData={this.createInputData}
                        updateData={this.updateTableList}
                        deleteData={this.deleteTableList}
                        getTableList={this.getTableList}
                        tableType={'QcData'}
                        direaction={'desc'}
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
)(QCDataPage);