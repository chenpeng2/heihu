import React from 'react';
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
import TablePagination from '@material-ui/core/TablePagination';
import { forwardRef } from 'react';
import Paper from '@material-ui/core/Paper';

// import SetTableDialog from 'component/tables/SetTableDialog'
import './table.less'
import SvgIcon from '@material-ui/core/SvgIcon';
import { Empty } from 'antd';
// table 中使用的icon
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>
        </SvgIcon>),
}

//默认分页参数
const DEFAULT_PAGESIZE = 100
const DEFAULT_PAGENUM = 0
const DEFAULT_COUNTS = 0

class MaterialTableDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageSize: DEFAULT_PAGESIZE,
            copyData: [],
            sort: '',
        }
    }

    componentDidMount() {
        this.setState({
            data: this.props.data,
            sort: this.props.sort,
            direction: this.props.direction,
        })
    }
    //添加数据
    create(newData) {
        const { createData } = this.props
        delete newData.tableData
        if (createData) {
            return createData(newData).then(res => {
                return res
            })
        }
    }
    //编辑保存数据
    update(Data) {
        delete Data.tableData
        return this.props.updateData(Data).then(res => {
            return res
        })
    }
    //服务端分页的翻页
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
    //服务端分页的改变修改每页数据条数
    onChangeRowsPerPage = event => {
        this.setState({
            pageSize: event.target.value,
            page: DEFAULT_PAGENUM,
        }, () => {
            this.refreshTable()
        })
    }

    //刷新table数据
    refreshTable = () => {
        const { getTableList,data,preserveRefreshTable } = this.props
        const { pageSize, direction, filters, sort } = this.state
        const params = {
            page: DEFAULT_PAGENUM + 1, // 分页插件中第一页的 page_num = 0,后端请求中不存在0页
            page_size: pageSize,
            sort,
            direction,
            ...filters
        }
        if(preserveRefreshTable){
            params.page=data.pageInfo.page
            params.page_size=data.pageInfo.pageSize
        }
        getTableList && getTableList(params)
    }

    closeSetTableDialog = () => {
        this.setState({
            isShowSetingDialog: false,
        })
    }

    //服务端排序
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
        const { createData, deleteData, hasPaging, title } = this.props
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
                        title={title?`${title}`:null}
                        columns={this.props.columns}
                        data={tableData}
                        icons={tableIcons}
                        isLoading={this.props.data.isFetching}
                        refs={'table'}
                        size="small"
                        // onOrderChange={this.changeOder}  //排序方法
                        // onSearchChange={this.search}     //搜素方法
                        localization={{  //翻译
                            body: {
                                editRow: {
                                    deleteText: '被删除的内容将不可恢复，确定删除',
                                    cancelTooltip: '取消',
                                    saveTooltip: '确认',
                                    textAlign: 'center',
                                },
                                emptyDataSourceMessage:this.props.data.isFetching?null:<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />,
                            },
                            header: {
                                actions: '操作'
                            },
                        }}
                        options={{
                            addRowPosition: 'first',  // 添加行的位置
                            actionsColumnIndex: -1,   // 操作列位置
                            sorting: true,
                            editable: true,
                            paging: false,            // 是否使用客户端分页
                            search: false,            // 是否使用表头数据搜索
                            rowStyle: rowData => ({
                                transition: (rowData.isCopy) ? 'all 300ms ease 0s' : '',
                                backgroundColor: (rowData.isCopy) ? 'rgb(238, 238, 238)' : '',
                                display: (rowData.isCopy) ? 'none' : 'table-row',
                            }),
                        }}
                        actions={this.props.actions?this.props.actions:false}
                        editable={{
                            //添加行，方法为 null 时表格不支持添加
                            onRowAdd: createData ? newData => new Promise((resolve, reject) => {
                                this.create(newData).then(res => {
                                    if (res && res.code === 0) {
                                        this.refreshTable()
                                        resolve()
                                    } else {
                                        reject()
                                    }
                                })
                            }) : null,
                            //更新行，方法为 null 时表格不支持编辑
                            onRowUpdate: (newData, oldData) => {
                                return new Promise((resolve, reject) => {
                                    this.update(newData).then(res => {
                                        if (res && res.code === 0) {
                                            this.refreshTable()
                                            resolve()
                                        } else {
                                            reject()
                                        }
                                    })
                                })
                            },
                            //删除行，方法为 null 时表格不支持删除
                            onRowDelete: deleteData ? oldData =>
                                new Promise(resolve => {
                                    setTimeout(() => {
                                        this.props.deleteData(oldData.parameterId).then(res => {
                                            this.refreshTable()
                                            resolve()
                                        })
                                    }, 600)
                                }) : null,
                        }}
                    />
                     {hasPaging && <TablePagination  // 服务端分页
                        rowsPerPageOptions={[10, 20, 50, 100]}
                        component="div"
                        count={data.pageInfo ? data.pageInfo.total : DEFAULT_COUNTS}
                        rowsPerPage={data.pageInfo ? data.pageInfo.pageSize : DEFAULT_PAGESIZE}
                        page={data.pageInfo ?  data.pageInfo.page - 1 : DEFAULT_PAGENUM} // 分页插件需要从第0页开始
                        labelDisplayedRows={({ from, to, count }) => {
                            return `${from}-${to} of ${count}`
                        }}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.onChangePage}  // 翻页时服务端重新发送请求
                        onChangeRowsPerPage={this.onChangeRowsPerPage} // 修改当前页展示数时服务端重新发送请求
                        labelRowsPerPage='每页行数：'
                    />}
                </Paper>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {}
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MaterialTableDemo)