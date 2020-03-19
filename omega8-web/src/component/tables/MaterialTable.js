import React from 'react';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import '../../styles/table.less'

import MaterialTable from 'material-table'
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
import Item from 'antd/lib/list/Item';

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

export default class MTable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            rowsPerPage: 10,
            page: 0,
            order: 'asc',
            orderBy: 'code',
            defaultPageSizeList: [10, 20, 50, 100],
        }
    }

    componentDidMount () {
        const { defaultPageSize } = this.props
        const { defaultPageSizeList } = this.state
        if (defaultPageSize && !defaultPageSizeList.includes(defaultPageSize)) {
            defaultPageSizeList && defaultPageSizeList.unshift(defaultPageSize)
        }
        if (defaultPageSize) {
            this.setState({
                rowsPerPage: defaultPageSize,
                defaultPageSizeList: defaultPageSizeList.sort((a, b) => a - b),
            })
        }
        
       
    }

    componentWillReceiveProps(nextProps) {
        if (this.props && nextProps && (this.props.setDefaultPageNum !== nextProps.setDefaultPageNum && nextProps.setDefaultPageNum)) {
            this.setState({
                page: 0,
            })
        }
        if (this.props && nextProps && (this.props.setDefaultSelect !== nextProps.setDefaultSelect && nextProps.setDefaultSelect)) { 
            this.setState({
                page: 0,
                rowsPerPage: this.props.defaultPageSize,
                order: 'asc',
                orderBy: 'code',
            })
        }
    }

    handleChangeRowsPerPage = (event) => {
        this.setState({
            rowsPerPage: parseInt(event.target.value),
            page: 0,
        },() => {
            this.props.changePage({pageNum: 0, pageSize: this.state.rowsPerPage})
        })
    }

    handleChangePage = (event, newPage) => {
        const {rowsPerPage} = this.state;
        this.setState({
            page: newPage
        },() => {
            this.props.changePage({pageNum: newPage, pageSize: rowsPerPage})
        })
    }

    render() {
        const { columns, rows, canAction, isPreview, defaultPageSize } = this.props
        const { page, rowsPerPage, defaultPageSizeList } = this.state
        
        return (
            <div className={this.props.className}>
                <MaterialTable
                    rowStyle={{padding: isPreview ? '10px 0' : ''}}
                    title=''
                    columns={columns}
                    data={rows && rows.result}
                    icons={tableIcons}
                    size="small"
                    isLoading={this.props.isLoading}
                    options={{
                        actionsColumnIndex: -1,
                        paging: false,
                        search: false,
                        toolbar: false,
                        pageSize: defaultPageSize || 10,
                    }}
                    localization={{
                        emptyDataSourceMessage: '没有相关数据'
                    }}
                    />
                    {rows &&  canAction && rows.result && <TableFooter style={{ backgroundColor: '#ffffff' }}>
                        <TablePagination
                            rowsPerPageOptions={defaultPageSizeList}
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
                        />
                    </TableFooter>}
      </div>
              )
            }
}
