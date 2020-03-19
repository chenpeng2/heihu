// import { Modal, Button, Table } from 'antd';
import React from "react"
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
import MaterialTable from 'material-table'
import { tableIcons } from 'utils/formatHelper'
import Button from '@material-ui/core/Button';

class LogDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataList: [],
            currentTab: 'setColumns',
            tabTitle: '定义列属性',
            visible: true,
        }
    }

    render() {
        const columns = this.props.getColumns()
        const { defaultVisible, closeModal, logList, detailColumns } = this.props
        const { list, isFetching } = logList
        const data = list || []
        return (
            <Dialog
                disableEscapeKeyDown
                aria-labelledby="max-width-dialog-title"
                open={defaultVisible}
                maxWidth={'xl'}
            >
                <DialogTitle id="confirmation-dialog-title">
                    <div className="dialog-title">
                        <div className="title ">修改记录</div>
                    </div>
                </DialogTitle>
                <DialogContent dividers className="logList-content">
                <div className="dialog-content">
                    <MaterialTable
                        icons={tableIcons}
                        columns={columns}
                        data={data}
                        title=""
                        isLoading={isFetching}
                        size="small"
                        options={{
                            headerStyle: {backgroundColor: '#fafafa', color: 'rgba(0,0,0,0.85)'},
                            search: false,
                            paging: false,
                            toolbar: false,
                            sorting: false,
                        }}
                        detailPanel={detailColumns? detailColumns : null}
                    />
                </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal} color="primary">
                        关闭
                    </Button>
                </DialogActions>
            </Dialog >
        )
    }
}

export default LogDialog


