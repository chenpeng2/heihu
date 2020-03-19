import React from 'react';
import { gettableSettings } from 'redux/selectors/QCDataSelector'
import { connect } from "react-redux";
import MaterialTable from 'material-table';
import TablePagination from '@material-ui/core/TablePagination';
import request from 'utils/urlHelpers'
import Paper from '@material-ui/core/Paper';
import '../../styles/table.less'
import moment from 'moment'
import { tableIcons } from 'utils/formatHelper'

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
            filterData: {},
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
                    url: `/programmasterdata?design_no=${newData.DesignNo}`,
                    method: 'GET',
                    success: res => {
                        const Data = {
                            ...newData,
                            ...res.data[0],
                        }
                        this.create(Data)
                    }
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

    changeOder = (orderBy, orderDirection) => {
        const { columns } = this.props
        if (orderBy === -1) {
            return 
        }
        const orderByColumn = columns[orderBy].field.replace(/([A-Z])/g, "_$1").toLowerCase()
        this.setState({
            direction: orderDirection,
            sort: orderByColumn,
            page: DEFAULT_PAGENUM,
        }, () => {
            this.refreshTable()
        })
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
                <Paper>
                    <MaterialTable
                        title={`${this.props.title}`}
                        columns={this.props.columns}
                        data={tableData}
                        icons={tableIcons}
                        isLoading={this.props.data.isFetching}
                        refs={'table'}
                        size="small"
                        onOrderChange={this.changeOder}
                        onSearchChange={this.search}
                        actions={tableType !== 'masterData' ?
                            []
                            : [
                                rowData => ({
                                    icon: tableIcons.ContentCopy,
                                    disabled: Boolean(copyData.length),
                                    tooltip: 'Copy',
                                    onClick: (event, rowData) => {
                                        const newData = { ...rowData }
                                        data.list.push(newData)
                                        if (copyData.length) {
                                            return
                                        }
                                        newData.tableData = {
                                            editing: 'update'
                                        }
                                        newData.id = ''
                                        newData.isCopy = true
                                        this.setState({
                                            copyData: newData,
                                        })
                                    }
                                })
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
                            pagination: {
                                labelRowsPerPage: '每页行数：'
                            }
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
                            headerStyle: { backgroundColor: '#fafafa', color: 'rgba(0,0,0,0.85)' },
                            rowStyle: rowData => ({
                                display: (rowData.isCopy) ? 'none' : 'table',
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
                                                url: `/programmasterdata?design_no=${newData.designNo}`,
                                                method: 'GET',
                                                success:res => {
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
                                                }
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
                                                    url: `/programmasterdata?design_no=${newData.designNo}`,
                                                    method: 'GET',
                                                    success: res => {
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
                                                    }, error: err => {
                                                        reject()
                                                    }
                                                }, 600)
                                                })
                                        }
                                    } else {
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
                                                    reject()
                                                }
                                            })
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
                                    }
                                })

                            },
                            onRowDelete: oldData =>
                                new Promise((resolve, reject) => {
                                    setTimeout(() => {
                                        this.props.deleteData(oldData.id).then(res => {
                                            if (res)  {
                                                this.refreshTable()
                                                resolve()
                                            } else {
                                                alert('删除失败')
                                                reject()
                                            }
                                           
                                        })
                                    }, 600)
                                }),
                        }}
                    />
                    <TablePagination
                        rowsPerPageOptions={[20, 50, 100]}
                        component="div"
                        count={data.pageInfo ? data.pageInfo.total : DEFAULT_COUNTS}
                        rowsPerPage={data.pageInfo ? data.pageInfo.pageSize : DEFAULT_PAGESIZE}
                        page={data.pageInfo ? data.pageInfo.page - 1 : DEFAULT_PAGENUM}
                        labelDisplayedRows={({ from, to, count }) => {
                            return `${from}-${to} of ${count}`
                        }}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.onChangePage}
                        onChangeRowsPerPage={this.onChangeRowsPerPage}
                        labelRowsPerPage='每页展示行数：'
                    />
                </Paper>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    const tableSettings = gettableSettings(state)
    return {
        tableSettings,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MaterialTableDemo)