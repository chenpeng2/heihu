import React from 'react';
import MaterialTable from 'material-table';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import { tableIcons } from 'utils/formatHelper'
import TablePagination from '@material-ui/core/TablePagination';

const DEFAULT_PAGESIZE = 100
const DEFAULT_PAGENUM = 0
const DEFAULT_COUNTS = 0

class customActionTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            openDeleteDialog: false,
            sort: 'program_no',
            direaction: 'desc',
        }
    }

    showDeleteDialog = (id) => {
        this.setState({
            openDeleteDialog: true,
            deleteId: id,
        })
    }

    deleteData = () => {
        const { deleteId } = this.state
        this.props.deleteData(deleteId).then(res => {
            this.setState({
                openDeleteDialog: false,
            })
            if (res && res.code === 0) {
                this.refreshTable()
            }
        })
    }


    handleClose = () => {
        this.setState({
            openDeleteDialog: false,
        })
    }

    refreshTable = () => {
        const { getTableList, filterData } = this.props
        const { pageSize, direction, filters, sort } = this.state
        const params = {
            page: DEFAULT_PAGENUM + 1,
            page_size: pageSize || DEFAULT_PAGESIZE,
            sort,
            direction,
            ...filterData,
            ...filters
        }
        getTableList(params)
    }

    //  切换每页展示数据条数
    onChangeRowsPerPage = event => {
        this.setState({
            pageSize: event.target.value,
            page: DEFAULT_PAGENUM,
        }, () => {
            this.refreshTable()
        })
    }
    
    //  切换页面
    onChangePage = (event, value) => {
        const { filterData } = this.props
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
                ...filterData,
            }
            this.props.getTableList(params)
        })
    }

    // 排序
    changeOder = (orderBy, orderDirection) => {
        const { columns } = this.props
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
        const { data, hasOperations, addData, copyData, editData } = this.props
        let tableData = data && data.list
        const { openDeleteDialog } = this.state
        return (
            <Paper>
                <Dialog
                    open={openDeleteDialog}
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                    fullWidth={true}
                    maxWidth="xs"
                >
                    <DialogTitle id="alert-dialog-title">{"删除后数据不可恢复，是否确认删除？"}</DialogTitle>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary" autoFocus>
                            取消
                        </Button>
                        <Button onClick={this.deleteData} color="primary">
                            确认
                        </Button>
                    </DialogActions>
                </Dialog>
                <MaterialTable
                    title={this.props.title}
                    columns={this.props.columns}
                    data={tableData}
                    icons={tableIcons}
                    isLoading={this.props.isFetching}
                    localization={{
                        body: {
                            emptyDataSourceMessage: '没有数据'
                        }
                    }}
                    onOrderChange={this.changeOder}
                    actions={hasOperations ? [
                        addData && {
                            icon: tableIcons.Add,
                            tooltip: '添加数据',
                            isFreeAction: true, // 是否在每一行显示改按钮
                            onClick: () => addData(),
                        },
                        rowData => (copyData && {
                            icon: tableIcons.ContentCopy,
                            tooltip: '复制',
                            onClick: (event, rowData) => copyData(rowData.id),
                        }),
                        rowData => (
                            editData && {
                                icon: tableIcons.Edit,
                                tooltip: '编辑',
                                onClick: (event, rowData) => editData(rowData.id),
                            }
                        ),
                        rowData => (
                            {
                                icon: tableIcons.Delete,
                                tooltip: '删除',
                                onClick: (event, rowData) => this.showDeleteDialog(rowData.id),
                            }
                        )
                    ] : []}
                    options={{
                        search: false,
                        paging: false,
                        actionsColumnIndex: -1,
                        headerStyle: { backgroundColor: '#fafafa', color: 'rgba(0,0,0,0.85)' }
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
        )
    }
}

export default customActionTable