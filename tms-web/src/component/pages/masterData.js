import React from "react"
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import MaterialTableDemo from 'component/tables/editableTable'
import * as  masterDataActionCreator from 'redux/actions/masterDataActionCreators'
import LogDialog from '../tables/commonLogDialog'
import * as RouteActionCreators from 'redux/actions/routeActionCreators'
import { getmasterDataState, getTableSettings, getlogListState } from 'redux/selectors/masterDataSelector'
import Header from 'component/common/Header'
import request from 'utils/urlHelpers'
import { paramsToString, addFiltersToParam } from 'utils/formatHelper'
import FilterTab from 'component/tables/filterTab'
class masterDataPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            factoryOptions: {},
            filterData: {},
            tableData: {},
            defaultDataParams: {
                page: 1,
                page_size: 100,
                sort: 'design_no',
                direaction: 'desc'
            }
        }
    }

    componentDidMount() {
        const params = this.state.defaultDataParams
        this.getTableList(params)
        this.getFactoryInfo()
    }

    getFactoryInfo = () => {
        return request({
            url: `/factories/factorynames`,
            method: 'GET',
            success: res => {
                if (res && res.code === 0) {
                    const list = res.data
                    const factoryOptions = {}
                    list.forEach(factory => {
                        factoryOptions[factory.factoryId] = factory.factoryEn
                    })
                    this.setState({
                        factoryOptions,
                    })
                }
            }
        })
    }

    createInputData = (newData) => {
        return this.props.masterDataActions.createData(newData).then(res => {
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
        tableData.isFetching = true
        this.setState({
            filterData,
            tableData,
            defaultDataParams
        })
        this.props.masterDataActions.fetchTableList(paramsToString(params))
    }

    updateTableList = (data) => {
        const ids = Object.keys(data).join(',')
        return this.props.masterDataActions.updateData(ids, data).then(res => {
            return res
        })
    }

    deleteTableList = (ids) => {
        return this.props.masterDataActions.deleteData(ids).then(res => {
            return res
        })
    }

    viewLogList = (key) => {
        const { getLogList } = this.props.masterDataActions
        this.setState({
            showLogList: true,
            logListData: {
                isFetching: true,
            }
        })
        getLogList(key)
    }

    refreshTable = () => {
        const params = this.state.defaultDataParams
        this.getTableList(params)
    }

    closeLogListModal = () => {
        this.setState({
            showLogList: false,
        })
    }

    getColumns = () => {
        return [{
            title: 'Program Year',
            field: 'programYear',
            isMust: false,
            sorting: false,
            align: 'left',
        }, {
            title: 'Program No.',
            field: 'programNo',
            isMust: true,
            align: 'left',
        }, {
            title: 'Program Name',
            field: 'programName',
            sorting: false,
            isMust: false,
            align: 'left',
        }, {
            title: 'Design No.',
            field: 'designNo',
            isMust: true,
            align: 'left',
            sorting: true,
            defaultSort: 'desc',
        }, {
            title: 'Design Name',
            field: 'designName',
            sorting: false,
            isMust: false,
            align: 'left',
        }, {
            title: 'Factory Name',
            field: 'factoryId',
            sorting: false,
            lookup: this.state.factoryOptions
        }, {
            title: '填报记录',
            field: 'inputHistory',
            sorting: false,
            editable: 'never',
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
        }]
    }

    getLogListColumns() {
        const columns = [
            {
                title: '修改时间',
                field: 'updatedAt',
                key: 'updatedAt',
                align: 'center',
                render: value => {
                    // formate the update time
                    return value.updatedAt.split('.')[0]
                }
            },
            {
                title: '修改用户',
                field: 'userName',
                key: 'userName',
                sorting: false,
            },
            {
                title: 'Program No.',
                field: 'programNo',
                sorting: false,
            }, {
                title: 'Program Name',
                field: 'programName',
                sorting: false,
            }, {
                title: 'Program Year',
                field: 'programYear',
                sorting: false,
            }, {
                title: 'Design No.',
                field: 'designNo',
            }, {
                title: 'Design Name',
                field: 'designName',
                sorting: false,
            }, {
                title: 'Factory Name',
                field: 'factoryEn',
                sorting: false,
            }
        ]
        return columns
    }

    render() {
        const { showLogList, factoryOptions, defaultDataParams } = this.state
        const { masterData, logListData } = this.props
        // 后端仅存储 factoryId 需要根据 factoryId 得到 factoryEn
        logListData && logListData.list && logListData.list.forEach(logdata => {
            if (factoryOptions) {
                logdata.factoryEn = factoryOptions[logdata.factoryId]
            }
        })
        return (
            <div>
                <Header />
                <div className="main-panel-light">
                    <FilterTab isMaster={true} getTableList={this.getTableList} selectList={['programYear','programName', 'programNo']} defaultDataParams={defaultDataParams}/>
                    <MaterialTableDemo
                        columns={this.getColumns()}
                        data={masterData || {}}
                        title={`Program Master Data`}
                        searchable={false}
                        width={'600px'}
                        createData={this.createInputData}
                        updateData={this.updateTableList}
                        deleteData={this.deleteTableList}
                        getTableList={this.getTableList}
                        tableType={'masterData'}
                        sort={'design_no'}
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
    const masterData = getmasterDataState(state)
    const tableSettings = getTableSettings(state)
    const logListData = getlogListState(state)
    return {
        masterData,
        tableSettings,
        logListData,
    }
}

const mapDispatchToProps = (dispatch) => {
    const masterDataActions = bindActionCreators(masterDataActionCreator, dispatch)
    const routeActions = bindActionCreators(RouteActionCreators, dispatch)
    return {
        masterDataActions,
        routeActions
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(masterDataPage)