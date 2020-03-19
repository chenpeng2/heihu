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
import { typeToText } from 'utils/chartHelper'
//redux
import { gettableSettings, getWarehouseList } from 'redux/selectors/outPartSelector'
import * as  outPartActionCreator from 'redux/actions/outPartActionCreators'
import { bindActionCreators } from "redux"
import { BootstrapInput } from 'utils/chartHelper'
import InputBase from '@material-ui/core/InputBase'


class TimeOutDetailPage extends React.Component {
    constructor(props, context) {
        super(props, context)
        this.columns = [
            {
                title: '标签号',
                field: 'productId',
                cellStyle: {
                    align: 'left'
                }
            },
            {
                title: '货物位置',
                field: 'name',
                align: 'center',
                sorting: false,
                render: (props) => {
                    const whsName = props.whsId ? `仓库${props.whsId}` : ''
                    return `${whsName} slot${props.slotId}`
                }
            }, {
                title: '门店类型',
                field: 'type',
                align: 'right',
                sorting: false,
                render: (props) => {
                    return typeToText[props.type]
                }
            }, {
                title: '收货时间',
                field: 'startTime',
                sorting: true,
            }, {
                title: '等待分拣时间',
                field: 'wait',
                sorting: false,
                cellStyle: {
                    color: '#BB0000',
                },
                render: (props) => {
                    return this.formateTime(props.wait)
                }
            }
        ]
        this.state = {
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

    getData() {
        const { filters, pageParam }  = this.state
        const { isAll, timeRange, orderBy } = filters
        const isAllParam = isAll ? `&isAll=${isAll}` : ''
        const timerangeParam = timeRange ? `?timerange=${timeRange}` : ''
        const orderByParam = orderBy ? `&orderBy=${orderBy}` : ''
        const pageNum = pageParam ? `&pageNum=${pageParam.pageNum + 1}` : '&pageNum=1'
        const pageSize = pageParam ? `&pageSize=${pageParam.pageSize}` : '&pageSize=10' //此处需要和调用的地方都是写10条
        return request({
            url: `/chart/receipt/receipting/timeout/detail${timerangeParam}${isAllParam}${orderByParam}${pageNum}${pageSize}`,
            method:'GET'
        }).then(res => {
            if (res && res.code === 0) {
                const timeOutData = JSON.parse(res.data)
                this.setState({
                  timeOutData,
                  isLoading: false,
                })
                return JSON.parse(res.data)
            } else {
                return {
                    fetchError: true,
                }
            }
        })
    }

    componentWillMount() {
        const { getWareHouseList, warehouseList } = this.props
        if (!warehouseList) {
            getWareHouseList()
        }
    }

    componentDidMount() {
        const keys = this.props.location.state
        const tag = keys && keys.tag
        const isAll = keys && keys.isAll
        const { filters } = this.state
        if (tag) {
            filters.isAll = isAll
            filters.timeRange =  tag.replace(/[^0-9]/ig,"")
        }
        this.setState({
            filters,
        },() => {
            this.getData()

        })
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

    changeOuttime = (event) => {
        const { filters, pageParam }  = this.state
        pageParam.pageNum = 0
        filters.timeRange = event.target.value
        this.setState({
            filters,
            setDefaultPageNum: true,
            pageParam,
        },() => {
            this.getData()
        })
    }

    changeArea = (event) => {
        const { filters, pageParam }  = this.state
        pageParam.pageNum = 0
        filters.isAll = event.target.value
        this.setState({
            filters,
            setDefaultPageNum: true,
            
        },() => {
            this.getData()
        })
    }

    changePage = (pageParam) => {
        this.setState({
            pageParam,
            setDefaultPageNum: false,
        },() => {
          this.getData()
        })
      }

    render() {
        const { timeOutData, changeData } = this.state
        const { settingData } = this.props
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
                        <Link color="inherit" href="#/splitControl">
                            分货部实时状态
                        </Link>
                        <span>超时待分拣货物详情</span>
                    </Breadcrumbs>
                    <div className="panel-content">
                        {
                            <div className="table-actions">
                                <div className="left-action">
                                    <NativeSelect
                                        className="chart-select"
                                        value={this.state.filters.timeRange}
                                        onChange={this.changeOuttime}
                                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                                    >
                                        <option value={4}>超时4小时</option>
                                        <option value={10}>超时10小时</option>
                                        <option value={24}>超时24小时</option>
                                        <option value={48}>超时48小时</option>
                                    </NativeSelect>
                                    <NativeSelect
                                        className="chart-select"
                                        value={this.state.filters.isAll}
                                        onChange={this.changeArea}
                                        input={<BootstrapInput name="department" id="department-customized-native-simple" />}
                                    >
                                        <option value={true}>全部</option>
                                        <option value={false}>京东 & 社区店</option>
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
                                {/* <IconButton aria-label="filter" onClick={this.openModal.bind(this, 'setFilters')}>
                                    <i className="sap-icon icon-filter"></i>
                                </IconButton> */}
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
                            setDefaultPageNum={this.state.setDefaultPageNum}
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
)(TimeOutDetailPage);
