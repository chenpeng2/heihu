import React from "react"
// my component
import { Table, Button } from 'antd';
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Dialog from '@material-ui/core/Dialog'
class tableLogDailog extends React.Component {
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
        const { defaultVisible, closeModal, columns, logList } = this.props
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
                        <Table
                            tableLayout="fixed"
                            columns={columns}
                            dataSource={logList.list}
                            loading={logList.isFetching}
                            bordered
                            size="small"
                            pagination={false}
                            className="input-table"
                            rowKey={record => record.id}
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeModal} color="primary">
                        关闭
                    </Button>
                </DialogActions>
            </Dialog>)
    }
}

export default tableLogDailog
