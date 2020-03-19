import { Table, Input, InputNumber, Popconfirm, Form, Button, Tabs, DatePicker, Checkbox } from 'antd';
import React from "react"
import SetTableDialog from 'component/tables/SetTableDialog'

const EditableContext = React.createContext();
const { TabPane } = Tabs
const CheckboxGroup = Checkbox.Group;

const inputTypeList = {
    'TMSPassed': 'number',
    'TMSRejected': 'number',
    'interTaken': 'number',
    'interPassed':'number',
    'interFailed':'number',
    'inputDate':'date'
}
const data = [];
for (let i = 0; i < 100; i++) {
    data.push({
        key: i.toString(),
        programNo: `Edrward ${i}`,
        designNo: `JQ${i}`,
        TMSPassed: 12+i,
        TMSRejected: 2+i,
        interTaken: 112+i*2,
        inputDate: '--',
    });
}

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber />;
        }
        if (this.props.inputType === 'date') {
            return <DatePicker onChange={this.props.onChangeDate} />;
        }
        return <Input />;
    };

    renderCell = ({ getFieldDecorator }) => {
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            index,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: true,
                                    message: `Please Input ${title}!`,
                                },
                            ],
                            initialValue: record[dataIndex],
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        );
    };

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data,
            editingKey: '' ,
            selectedRowKeys: [], // Check here to configure the default column
            loading: false,
            sortedInfo: {},
            // columns: this.getColumns(),
            columnsCheckList: this.getColmunsCheckList(),
        }
        this.columns = this.getColumns()
    }

    getColumns() {
        return [{
            title: 'Program No.',
            dataIndex: 'programNo',
            editable: true,
        },{
            title: 'Design No.',
            dataIndex: 'designNo',
            editable: true,
        },{
            title: 'TMS Q.C. Passed',
            dataIndex: 'TMSPassed',
            editable: true,
        },{
            title: 'TMS Q.C. Rejected',
            dataIndex: 'TMSRejected',
            editable: true,
        },{
            title: 'Intervention Taken',
            dataIndex: 'interTaken',
            editable: true,
        },{
            title: '填报时间',
            dataIndex: 'inputDate',
            editable: true,
        },{
            title: 'operation',
            dataIndex: 'operation',
            render: (text, record) => {
                const { editingKey } = this.state;
                const editable = this.isEditing(record);
                return editable ? (
                    <span>
                <EditableContext.Consumer>
                    {form => (
                        <a
                            href="javascript:;"
                            onClick={() => this.save(form, record.key)}
                            style={{ marginRight: 8 }}
                        >
                            Save
                        </a>
                    )}
                </EditableContext.Consumer>
                <Popconfirm title="Sure to cancel?" onConfirm={() => this.cancel(record.key)}>
                    <a>Cancel</a>
                </Popconfirm>
                </span>
                ) : (
                    <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>
                        Edit
                    </a>
                )
            }
        }]
    }

    getColmunsCheckList() {
        const dataColumns = []
        this.getColumns().forEach(column => {
            dataColumns.push({
                label: column.title,
                value: column.dataIndex,
            })
        })
        return dataColumns
    }

    isEditing = record => record.key === this.state.editingKey;

    cancel = () => {
        this.setState({ editingKey: '' });
    };

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index]
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ data: newData, editingKey: '' })
            } else {
                newData.push(row);
                this.setState({ data: newData, editingKey: '' })
            }
        })
    }

    edit(key) {
        this.setState({ editingKey: key });
    }

    delete() {
        const { selectedRowKeys } = this.state
        console.log('delete', selectedRowKeys)
    }

    onSelectChange = selectedRowKeys => {
        this.setState({ selectedRowKeys })
    }

    handleAdd = () => {
        const { count, data } = this.state
        const newData = {
            key: count,
            name: '',
            age: '',
            address: '',
        }
        data.unshift(newData)
        this.setState({
            editingKey: count,
            data,
            count: count + 1,
        })
    }

    handleChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter)
        this.setState({
            filteredInfo: filters,
            sortedInfo: sorter,
        })
    }

    clearFilters = () => {
        this.setState({ filteredInfo: null })
    }

    handleSave = row => {
        const newData = [...this.state.data]
        const index = newData.findIndex(item => row.key === item.key)
        const item = newData[index]
        newData.splice(index, 1, {
            ...item,
            ...row,
        })
        this.setState({ data: newData })
    }

    closeModal () {
        debugger
        this.setState({
            isShowSetingDialog: false,
        })
    }

    openModal() {
        this.setState({
            isShowSetingDialog: true,
        })
    }

    onChange = checkedList => {
        this.setState({
            checkedList,
            indeterminate: !!checkedList.length && checkedList.length < this.state.columnsCheckList.length,
            checkAll: checkedList.length === this.state.columnsCheckList.length,
        })
    }

    changeColumns = (newColumns) => {
        if (newColumns && newColumns.length) {
            this.columns = newColumns
            this.closeModal()
        }

    }


    render() {
        const { loading, selectedRowKeys, columnsCheckList } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        }
        const components = {
            body: {
                cell: EditableCell,
            },
        }
        const myColumns = this.columns.map(col => {
            if (!col.editable) {
                return col
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: inputTypeList[col.dataIndex] || 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                }),
            }
        })
        console.log('rendering-------',this.columns)
        const hasSelected = selectedRowKeys.length > 0;
        return (
            <EditableContext.Provider value={this.props.form}>
                <SetTableDialog
                    columnsCheckList={columnsCheckList}
                    visible={this.state.isShowSetingDialog}
                    closeModal={this.closeModal.bind(this)}
                    getColumns={this.getColumns()}
                    changeColumns={this.changeColumns.bind(this)}
                />
                <div style={{ marginBottom: 16 }}>
                    <Button onClick={this.handleAdd} style={{ marginBottom: 16 }}>
                        添加数据
                    </Button>
                    <Button type="primary" onClick={this.delete.bind(this)} disabled={!hasSelected} loading={loading}>
                        删除
                    </Button>
                    <Button type="link" onClick={this.openModal.bind(this)}>
                        设置
                    </Button>
                    {/* <span style={{ marginLeft: 8 }}>
                {hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}
            </span> */}
                </div>
                <Table
                    components={components}
                    bordered
                    dataSource={this.state.data}
                    columns={myColumns}
                    rowClassName="editable-row"
                    rowSelection={rowSelection}
                    expandedRowRender={record => <p style={{ margin: 0 }}>{record.address}</p>}
                    pagination={{
                        onChange: this.cancel,
                    }}
                    onChange={this.handleChange}
                />
            </EditableContext.Provider>
        )
    }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable