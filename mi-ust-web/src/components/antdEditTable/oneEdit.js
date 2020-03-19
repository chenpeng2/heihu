import React, { PureComponent } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Pagination } from 'antd';
import _ from 'lodash'

const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        if (this.props.inputType === 'number') {
            return <InputNumber />;
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
        this.state = { editingKey: '' ,newCol:[]};
        this.columns = [
            {
                title: 'name',
                dataIndex: 'name',
                width: '25%',
                editable: true,
            },
            {
                title: 'age',
                dataIndex: 'age',
                width: '15%',
                editable: true,
            },
            {
                title: 'address',
                dataIndex: 'address',
                width: '40%',
                editable: true,
            },
            {
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
                    );
                },
            },
        ];
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
            const newData = [...this.props.dataSource];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.setState({ editingKey: '' });
            } else {
                newData.push(row);
                this.setState({ editingKey: '' });
            }
            this.props.changeDataSource(newData)
        });
    }

    edit(key) {
        this.setState({ editingKey: key });
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource!==this.props.dataSource) {
            this.setState({ dataSource: nextProps.dataSource})
        }
    }
    componentDidMount(){
        const {columns, editColumns} = this.props;
        let newCol = _.cloneDeep(columns);
        columns.map((item,index)=>{
            if(editColumns.indexOf(item.dataIndex)>-1){
                newCol[index].editable=true;
            }
        })
        const operate = {
            title: '操作',
            dataIndex: 'operation',
            render: (text, record) => {
                const { editingKey } = this.state;
                const editable = this.isEditing(record);
                return editable ? (
                    <span>
              <EditableContext.Consumer>
                {form => (
                    <a
                        onClick={() => this.save(form, record.key)}
                        style={{ marginRight: 8 }}
                    >
                        保存
                    </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm title="确定取消吗?" okText="确定" cancelText="取消" onConfirm={() => this.cancel(record.key)}>
                <a>取消</a>
              </Popconfirm>
            </span>
                ) : (
                    <a disabled={editingKey !== ''} onClick={() => this.edit(record.key)}>
                        编辑
                    </a>
                );
            },
        };
        newCol.push(operate)
        this.setState({newCol})
    }
    changePage = (pageNum)=> {
        console.log(pageNum)
    }
    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };
        const {newCol}=this.state;
        const columns = newCol.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputType: col.dataIndex === 'age' ? 'number' : 'text',
                    dataIndex: col.dataIndex,
                    title: col.title,
                    render:col.render,
                    editing: this.isEditing(record),
                }),
            };
        });
        let {dataSource,pagination} =this.props
        return (
            <EditableContext.Provider value={this.props.form}>
                {dataSource.length &&
                    <div style={{position:'relative'}}>
                        <Table
                            components={components}
                            bordered
                            dataSource={dataSource}
                            columns={columns}
                            rowClassName="editable-row"
                            pagination={{
                                onChange: this.changePage,
                            }}
                        />
                    </div>
                }
            </EditableContext.Provider>
        );
    }
}

const EditableFormTable = Form.create()(EditableTable);

export default EditableFormTable