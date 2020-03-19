import React from "react"
import { connect } from "react-redux"
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import Link from '@material-ui/core/Link'
import MTable from 'component/tables/MaterialTable'
import NativeSelect from '@material-ui/core/NativeSelect'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'

//my component
import SetTableDialog from 'component/tables/SetTableDialog'
import request from 'utils/urlHelpers'
//redux
import { gettableSettings, getWarehouseList } from 'redux/selectors/outPartSelector'
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { bindActionCreators } from "redux"
import { BootstrapInput } from 'utils/chartHelper'
import InputBase from '@material-ui/core/InputBase'


class PickingTimeOutPage extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.columns = [{
            title: 'ID',
            field: 'userId',
            sorting: false,
        }, {
            title: '超时五分钟次数',
            field: 'timeOut5',
            sorting: false,
        }, {
            title: '超时十分钟次数',
            field: 'timeOut10',
            sorting: false,
        }, {
            title: '总计',
            field: 'total',
            sorting: false,
        }]
        this.state = {
            setDefaultPageNum: false,
            columnsCheckList: this.getColmunsCheckList(),
            filters: {
                searchValue: '',
                orderBy: '',
                isAll: true,
                timeRange: '4',
            },
            pageParam: {
                pageNum: 0,
                pageSize: 10,
            },
            isLoading: true,
        }
    }

    formateTime(time) {
        let hour = parseInt(time / 3600)
        let minnut = parseInt(time % 3600 / 60)
        let second = parseInt(time % 60)
        return `${hour}小时  ${minnut}分钟 ${second}秒`
    }

    getWarehouseList = () => {
        request({
            url: `/statistic/sstk/warehouselist`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data)
                const selectList = [{ title: '全部', value: '' }]
                data.whs.forEach(item => {
                    selectList.push({
                        title: `分拣区${item}`,
                        value: item,
                    })
                })
                this.setState({
                    selectList,
                })
            }
        })
    }

    getData(pageParam, whsid) {
        const pageParams = `?pageNum=${pageParam.pageNum + 1}&pageSize=${pageParam.pageSize}`
        const whsParam = whsid ? `&whsid=${whsid}` : ''
        request({
            url: `/sstk/chart/sstk/picking/user/timeout/detail${pageParams}${whsParam}`,
            method: 'GET'
        }).then(res => {
            if (res) {
                const data = JSON.parse(res.data) 
                this.setState({
                    timeOutData: data,
                    isLoading: false,
                })
            } 
        })
    }

    componentWillMount() {
        this.getWarehouseList()
    }

    componentDidMount() {
        const { pageParam } = this.state
        this.getData(pageParam)
    }

    getColmunsCheckList = () => {
        const dataColumns = []
        const { columns } = this
        columns && columns.forEach(column => {
            dataColumns.push({
                label: column.title,
                value: column.field,
                checked: true,
            })
        })
        return dataColumns
    }

    openModal(openTab) {
        this.setState({
            defaultTab: openTab,
            isShowSetingDialog: true,
        })
    }

    closeSetTableDialog = () => {
        this.setState({
            isShowSetingDialog: false,
        })
    }

    changeColumns = (newColumns) => {
        this.closeSetTableDialog()
    }

    refreshTable = () => {
        const { pageNum, pageSize, filters } = this.state
        const params = {
            pageNum,
            pageSize,
            filters,
        }
    }

    changeFilters = (filters) => {
        this.closeSetTableDialog()
    }

    renderModal = () => {
        const { isShowSetingDialog, columnsCheckList, defaultTab } = this.state
        const { settingData } = this.props
        const { columns, filters } = settingData || {}
        let checkedValues = []
        columnsCheckList && columnsCheckList.forEach(column => {
            checkedValues.push(column.value)
        })

        const defaultCheckedList = columns || checkedValues
        return (
            isShowSetingDialog &&
            <SetTableDialog
                columnsCheckList={columnsCheckList}
                visible={this.state.isShowSetingDialog}
                closeModal={this.closeSetTableDialog}
                getColumns={this.columns}
                defaultTab={defaultTab}
                defaultCheckedList={defaultCheckedList}
                defaultFilters={filters}
                changeColumns={this.changeColumns}
                changeFilters={this.changeFilters}
            />
        )
    }

    changeSearchValue = (event) => {
        this.setState({
            searchValue: event.target.value,
        })
    }

    search = () => {
        const { searchData } = this.props
        const { searchValue } = this.state
        searchData(searchValue)
    }

    changeArea = (event) => {
        const { pageParam } = this.state
        pageParam.pageNum = 0
        const whsid = event.target.value
        this.setState({
            whsid,
            setDefaultPageNum: true,
            pageParam,
        }, () => {
            this.getData(pageParam, whsid)
        })
    }

    changePage = (pageParam) => {
        this.setState({
            pageParam,
            setDefaultPageNum: false,
        }, () => {
            this.getData(pageParam)
        })
    }

    render() {
        const { timeOutData, selectList, setDefaultPageNum } = this.state
        const { settingData, } = this.props
        const columns = this.columns.filter(column => {
            if (settingData) {
                return settingData.columns.includes(column.field) || column.isMust
            } else {
                return column
            }
        }
        )
        return (
            <div className="content">
                {this.renderModal()}
                <div className="main-panel-light">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link color="inherit" href="#/SSTKOverview">
                            稳定库存实时状态
                        </Link>
                        <span>拣货超时统计</span>
                    </Breadcrumbs>
                    <div className="panel-content">
                        {
                            <div className="table-actions">
                                <div className="left-action">
                                    <NativeSelect
                                        className="chart-select"
                                        value={this.state.area}
                                        onChange={this.changeArea}
                                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                                    >
                                        {selectList && selectList.map(select => {
                                            return <option key={select.value} value={select.value}>{select.title}</option>
                                        })
                                        }
                                    </NativeSelect>
                                </div>
                                <Paper className="search-content">
                                    <InputBase
                                        className="search-input"
                                        placeholder="search"
                                        inputProps={{ 'aria-label': 'search google maps' }}
                                        onChange={this.changeSearchValue}
                                    />
                                    <i className="sap-icon icon-search" onClick={this.search}></i>
                                </Paper>
                                <IconButton aria-label="setting" onClick={this.openModal.bind(this, 'setColumns')}>
                                    <i className="sap-icon icon-setting"></i>
                                </IconButton>
                            </div>
                        }
                        <MTable
                            columns={columns}
                            rows={timeOutData}
                            className="big-table"
                            canAction={true}
                            isLoading={this.state.isLoading}
                            getData={(pageParam) => this.getData(pageParam)}
                            changePage={this.changePage}
                            setDefaultPageNum={setDefaultPageNum}
                        />
                    </div>
                </div>
            </div>
        )
    }
}


const mapStateToProps = (state) => {
    const settingData = gettableSettings(state)
    const list = getWarehouseList(state)
    return {
        list: state,
        department: '',
        settingData,
        warehouseList: list
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(outPartActionCreator, dispatch);
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PickingTimeOutPage);
