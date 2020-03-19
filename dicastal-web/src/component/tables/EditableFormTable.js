import React,{forwardRef} from "react"
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
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
class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    handleChangePage = () => {

    }
    handleChangeRowsPerPage = () =>{

    }
    render(){
        console.log(this.props.detailData)
        return (
            <div>
                <MaterialTable
                    icons={tableIcons}
                    title="X光检测数据（100/340）"
                    columns={[
                        { title: '图片ID', field: 'imageId'},
                        { title: '图片处理时间', field: 'imageProcessDatetime' },
                        { title: '轮毂ID', field: 'wheelId'},
                        { title: '二维码编号', field: 'barcodeNo'},
                        { title: '轮毂型号', field: 'wheelType' },
                        { title: '识别结果', field: 'result'},
                        { title: '缺陷类型', field: 'defectType'},
                        { title: '报废原因', field: 'scrapReason' },
                        { title: '最大面积', field: 'maxArea'},
                        { title: '最大长度', field: 'maxLength'},
                        { title: '滑动评价区域最大缺陷面积', field: 'slipArea' },
                        { title: '缺陷所在区域', field: 'defectLocation'},
                        { title: '图片序号', field: 'inum'},
                        { title: '检测步骤', field: 'vnum'},
                    ]}
                    data={ this.props.detailData.wheelDetectionImageList}
                    options= {{
                        paging: false,
                        grouping: true,
                        exportButton: true,
                        exportCsv: (columns, data) => {
                            alert('你应当选择需要导出的数据!');}
                    }}
                />
                <TableFooter style={{ backgroundColor: '#ffffff' }}>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 15, 20]}
                        colSpan={3}
                        count={20}
                        rowsPerPage={8}
                        page={1}
                        SelectProps={{
                            inputProps: { 'aria-label': 'rows per page' },
                            native: true,
                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                        // ActionsComponent={this.TablePaginationActions}
                    />
                </TableFooter>
            </div>)
    }
}

export default EditableTable