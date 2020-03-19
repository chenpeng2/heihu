import React from 'react';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel'
import '../../styles/table.less'
// import MaterialTable from 'material-table'
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
import { forwardRef } from 'react';

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

}

const DEFAULT_PAGESIZE = 10
const DEFAULT_PAGENUM = 0
const DEFAULT_COUNTS = 0
export default class MTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            rowsPerPage: 10,
            page: 0,
            order: 'asc',
            orderBy: 'code'
        }
    }

    handleChangeRowsPerPage = (event) => {
        this.setState({
            rowsPerPage: parseInt(event.target.value),
            page: 0,
        },() => this.props.getData({pageNum: 1, pageSize: this.state.rowsPerPage}))
    }

    handleChangePage = (event, newPage) => {
        const {rowsPerPage} = this.state;
        this.setState({
            page: newPage
        },() => this.props.getData({pageNum: newPage, pageSize: rowsPerPage}))
    }

    render() {
        const { columns, rows, canAction } = this.props
        const { page, rowsPerPage, orderBy, order } = this.state
        return (
            <div className="big-table">
                {/*<MaterialTable*/}
                    {/*title=''*/}
                    {/*columns={columns}*/}
                    {/*data={rows.wheelDetectionImageList}*/}
                    {/*icons={tableIcons}*/}
                    {/*size="small"*/}
                    {/*isLoading={this.props.isLoading}*/}
                    {/*options={{*/}
                        {/*paging: false,*/}
                        {/*grouping: true,*/}
                        {/*exportButton: true,*/}
                        {/*exportCsv: (columns, data) => {*/}
                            {/*alert('你应当选择需要导出的数据!');}*/}
                    {/*}}*/}
                    {/*localization={{*/}
                        {/*emptyDataSourceMessage: '没有相关数据',*/}
                        {/*grouping: {*/}
                            {/*placeholder: '将标题拖到此处进行分组'*/}
                        {/*}*/}
                    {/*}}*/}
                    {/*/>*/}
                    {rows.wheelDetectionImageList &&  (rows.wheelDetectionImageList.length) && <TableFooter style={{ backgroundColor: '#ffffff' }}>
                        <tr>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 15, 20]}
                                colSpan={3}
                                count={rows.total}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: { 'aria-label': 'rows per page' },
                                    native: true,
                                }}
                                onChangePage={this.handleChangePage}
                                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                // ActionsComponent={this.TablePaginationActions}
                            />
                        </tr>
                    </TableFooter>}
      </div>
              )
            }
}
