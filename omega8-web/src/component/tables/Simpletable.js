import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Progress from 'component/common/Progress'
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel'
import '../../styles/table.less'
import MaterialTable from 'material-table'

export default class SimpleTable extends React.Component {
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
    })
  }

  handleChangePage = (event, newPage) => {
    this.setState({
      page: newPage
    })
  }

  thionRequestSort = (event, property) => {
    console.log('sort-------', event.target, property)
  }

  createSortHandler = property => event => {
    console.log(event.detail, event.target)
  }

  render() {
    const { columns, rows, canAction } = this.props
    const { page, rowsPerPage } = this.state
    return (
      <div className="table-content">
        {rows && rows.length ? <Table className={this.props.className}>
          <TableHead>
            <TableRow>
              {
                columns.map((column, index) => {
                  return (
                    <TableCell key={index} align={column.align}>
                      {column.title}
                    </TableCell>)
                })
              }
            </TableRow>
          </TableHead>
          <TableBody style={{ backgroundColor: '#ffffff' }}>
            {rows.slice(0, 10).map((row, index) => (
              <TableRow key={index}>
                {columns.map((column, index) => {
                  return <TableCell key={index} align={column.align}>
                    {column.isPrograss ?
                      <span>
                        <Progress allNum={10} percentageNum={row.capacity} bgColor="#107E3E" />
                      </span> :
                      row[column.field]
                    }
                  </TableCell>
                })}
              </TableRow>
            ))}
          </TableBody>
          {canAction && <TableFooter style={{ backgroundColor: '#ffffff' }}>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 15, 20]}
                colSpan={3}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: { 'aria-label': 'rows per page' },
                  native: true,
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            </TableRow>
          </TableFooter>}
        </Table> :
          <div className="empty-content">没有数据</div>
        }
      </div>
    )
  }
}
