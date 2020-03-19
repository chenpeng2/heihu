import React from 'react';
// import { getInputDataListState, gettableSettings } from 'redux/selectors/QCDataSelector'
import { connect } from "react-redux";
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowUpward from '@material-ui/icons/ArrowUpward';
import Check from '@material-ui/icons/Check';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Clear from '@material-ui/icons/Clear';
import DeleteOutline from '@material-ui/icons/DeleteOutline';
import Edit from '@material-ui/icons/Edit';
import FilterList from '@material-ui/icons/FilterList';
import FirstPage from '@material-ui/icons/FirstPage';
import LastPage from '@material-ui/icons/LastPage';
import Remove from '@material-ui/icons/Remove';
import SaveAlt from '@material-ui/icons/SaveAlt';
import Search from '@material-ui/icons/Search';
// import ContentCopy from '@material-ui/icons/ContentCopy';
import { forwardRef } from 'react';
import TablePagination from '@material-ui/core/TablePagination';
import request from '../../util/http'
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

// import SetTableDialog from 'component/tables/SetTableDialog'
import './table.less'
import moment from 'moment'
import SvgIcon from '@material-ui/core/SvgIcon';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
    DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
    LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
    PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
    ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => <ArrowUpward {...props} ref={ref} />),
    ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
    ContentCopy: forwardRef((props, ref) => 
    <SvgIcon {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
    </SvgIcon>),
}

const DEFAULT_PAGESIZE = 100
const DEFAULT_PAGENUM = 0
const DEFAULT_COUNTS = 0

class MaterialTableDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGESIZE,
            columnsCheckList: this.getColmunsCheckList(),
            copyData: [],
            sort: '',
        }
    }

    getColmunsCheckList() {
        const dataColumns = []
        const { columns } = this.props
        columns && columns.forEach(column => {
            if (!column.isMust) {
                dataColumns.push({
                    label: column.title,
                    value: column.field,
                    checked: true,
                })
            }
        })
        return dataColumns
    }

    componentDidMount() {
        this.setState({
            data: this.props.data,
            sort: this.props.sort,
            direction: this.props.direction,
        })
    }

    create(newData) {
        const { createData } = this.props
        delete newData.tableData
        if (createData) {
            return createData(newData).then(res => {
                return res
            })
        }  
    }

    setPageDefault() {
        this.setState({
            pageSize: DEFAULT_PAGESIZE,
            page: DEFAULT_PAGENUM,
        })
    }

    update(Data) {
        const changeData = {}
        delete Data.tableData
        changeData[Data.id] = Data
        return this.props.updateData(changeData).then(res => {
            return res
        })
    }

    onChangePage = (event, value) => {
        const { sort, direction } = this.state
        this.setState({
            page: value,
        }, () => {
            const { pageSize } = this.state
            const params = {
                page_size: pageSize,
                page: Number(value + 1),
                sort,
                direction,
            }
            this.props.getTableList(params)
        })
    }

    addData(newData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve()
                request({
                    url: `/programmasterdata?designNo=${newData.DesignNo}`,
                    method: 'GET',
                }).then(res => {
                    const Data = {
                        ...newData,
                        ...res.data[0],
                    }
                    this.create(Data)
                })
            }, 600);
        })
    }

    onChangeRowsPerPage = event => {
        this.setState({
            pageSize: event.target.value,
            page: DEFAULT_PAGENUM,
        }, () => {
            this.refreshTable()
        })
    }

    refreshTable = () => {
        const { getTableList } = this.props
        const { pageSize, direction, filters, sort } = this.state
        const params = {
            page: DEFAULT_PAGENUM + 1,
            page_size: pageSize,
            sort,
            direction,
            ...filters
        }
        getTableList(params)
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
        this.setState({
            filters
        }, () => {
            this.refreshTable()
        })
        this.closeSetTableDialog()
    }

    changeOder = (orderBy, orderDirection) => {
        const { columns } = this.props
        const orderByColumn = columns[orderBy].field.replace(/([A-Z])/g,"_$1").toLowerCase()
        this.setState({
            direction: orderDirection,
            sort: orderByColumn,
            page: DEFAULT_PAGENUM,
        }, () => {
            this.refreshTable()
        }) 
    }

    renderModal = () => {
        const { isShowSetingDialog, columnsCheckList, defaultTab } = this.state
        const { tableSettings } = this.props
        const { columns, filters } = tableSettings || {}
        let checkedValues = []
        columnsCheckList.forEach(column => {
            checkedValues.push(column.value)
        })
        const defaultCheckedList = columns || checkedValues
        return (
            isShowSetingDialog &&
            <SetTableDialog
                columnsCheckList={columnsCheckList}
                visible={this.state.isShowSetingDialog}
                closeModal={this.closeSetTableDialog}
                getColumns={this.props.columns}
                defaultTab={defaultTab}
                defaultCheckedList={defaultCheckedList}
                defaultFilters={filters}
                changeColumns={this.changeColumns}
                changeFilters={this.changeFilters}
            />
        )
    }
    

    render() {
        const { tableType, hasDefaultDate, createData } = this.props
        let data = this.props.data
        const { copyData } = this.state
        let tableData = data && data.list
        if (copyData.length) {
            tableData = copyData.concat(data.list)
        }
        return (
            <div className="edit-table-content">
                {/* {this.renderModal()} */}
                <Paper>
                    {tableType === 'QcData' &&
                        (<div className="action-buttons right">
                            <Button open-tab="filter" onClick={this.openModal.bind(this, 'setFilters')}>
                                <i className="sap-icon icon-filter primary-icon"></i>
                            </Button>
                            <Button open-tab="setting" onClick={this.openModal.bind(this, 'setColumns')}>
                                <i className="sap-icon icon-setting primary-icon"></i>
                            </Button>
                        </div>)}
                    <MaterialTable
                        title={`${this.props.title}`}
                        columns={this.props.columns}
                        data={tableData}
                        icons={tableIcons}
                        isLoading={this.props.data.isFetching}
                        refs={'table'}
                        size="small"
                        onOrderChange={this.changeOder}
                        // onSearchChange={this.search}
                        actions={tableType !== 'masterData' ? 
                        [] 
                        :[
                            {
                            icon: tableIcons.ContentCopy,
                            disabled: Boolean(copyData.length),
                            tooltip: '复制',
                            search: false,
                            onClick: (event, rowData) => {
                                const newData = { ...rowData}
                              data.list.push(newData)
                              if (copyData.length) {
                                  return
                              }
                              newData.tableData= {
                                  editing: 'update'
                              }
                              newData.id = ''
                              newData.isCopy = true
                              this.setState({
                                  copyData: newData,
                              })
                            }
                            }
                        ]}
                        localization={{
                            body: {
                                editRow: {
                                    deleteText: '被删除的内容将不可恢复，确定删除',
                                    cancelTooltip: '取消',
                                    saveTooltip: '确认',
                                    textAlign: 'center',
                                }
                            },
                        }}
                        initialFormData={hasDefaultDate ? {
                            'createdDay': moment(new Date()).format('YYYY-MM-DD')
                        } : {}}
                        options={{
                            addRowPosition: 'first',
                            actionsColumnIndex: -1,
                            sorting: true,
                            editable: true,
                            paging: false,
                            search: false,
                            // toolbar: Boolean(createData),
                            rowStyle: rowData => ({
                                transition: (rowData.isCopy) ? 'all 300ms ease 0s' : '',
                                backgroundColor: (rowData.isCopy) ?  'rgb(238, 238, 238)' : '',
                                display: (rowData.isCopy) ?  'none' : 'table-row',
                            })
                        }}
                        editable={{
                            onRowAdd: createData ? newData => new Promise((resolve, reject) => {
                                if (tableType === 'QcData') {
                                    if (!newData.designNo) {
                                        alert('必须输入DesignNo')
                                        reject()
                                    } else {
                                        setTimeout(() => {
                                            request({
                                                url: `/programmasterdata?designNo=${newData.designNo}`,
                                                method: 'GET',
                                            }).then(res => {
                                                if (!res.data) {
                                                    alert('数据出错')
                                                    reject()
                                                    return
                                                }
                                                if (res.data.length) {
                                                    delete res.data[0].id
                                                }
                                                let Data = {
                                                    ...newData,
                                                    ...res.data[0],
                                                }
                                                this.create(Data).then(res => {
                                                    if (res && res.code === 0) {
                                                        this.refreshTable()
                                                        resolve()
                                                    } else {
                                                        reject()
                                                    }
                                                })
                                            })
                                        }, 600)
                                    }
                                } else {
                                    this.create(newData).then(res => {
                                        if (res && res.code === 0) {
                                            this.refreshTable()
                                            resolve()
                                        } else {
                                            reject()
                                        }
                                    })
                                }
                            }) : null,
                            onRowUpdate: (newData, oldData) => {
                                return new Promise((resolve, reject) => {
                                    if (tableType === 'QcData') {
                                        if (!newData.designNo) {
                                            alert('必须输入DesignNo')
                                            reject()
                                        } else {
                                            setTimeout(() => {
                                                request({
                                                    url: `/programmasterdata?designNo=${newData.designNo}`,
                                                    method: 'GET',
                                                }).then(res => {
                                                    if (!res.data) {
                                                        alert('数据出错')
                                                        reject()
                                                        return
                                                    }
                                                    if (res.data.length) {
                                                        delete res.data[0].id
                                                    }
                                                    let Data = {
                                                        ...newData,
                                                        ...res.data[0],
                                                    }
                                                    this.update(Data).then(res => {
                                                        if (res) {
                                                            this.refreshTable()
                                                            resolve()
                                                        } else {
                                                            reject()
                                                        }
                                                    })      
                                                })
                                            }, 600)
                                        }
                                    }  else {
                                        if (newData.id) {
                                            if (tableType === 'factoryData') {
                                                if (!newData.factoryEn) {
                                                    alert('factory Name 不能为空')
                                                    reject()
                                                    return false
                                                }
                                            }
                                            this.update(newData).then(res => {
                                                if (res && res.code === 0) {
                                                    this.refreshTable()
                                                    resolve()
                                                } else {
                                                    alert('数据出错')
                                                    reject()
                                                }
                                            })           
                                        } else {            
                                            this.create(newData).then(res => {
                                                if (res && res.code === 0) {
                                                    this.refreshTable()
                                                    resolve()
                                                } else {
                                                    alert('数据出错')
                                                    reject()
                                                }
                                            })
                                        }  
                                    }
                                })

                            },
                            onRowDelete: oldData =>
                                new Promise(resolve => {
                                    setTimeout(() => {
                                        this.props.deleteData(oldData.id).then(res => {
                                            this.refreshTable()
                                            resolve()
                                        })
                                    }, 600)
                            }),
                        }}
                    />
                </Paper>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    // const tableData = getInputDataListState(state)
    // const tableSettings = gettableSettings(state)
    return {
        // unchangeList: tableData && tableData.list,
        // tableSettings,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MaterialTableDemo)