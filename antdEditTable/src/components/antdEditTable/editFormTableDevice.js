import React from "react"
import { Table, Input, InputNumber, Popconfirm, Form, Checkbox, Select } from 'antd';
import _ from 'lodash'
const { Option } = Select;
const EditableContext = React.createContext();

class EditableCell extends React.Component {
    getInput = () => {
        const {options,record,inputtype}=this.props
        const {datasource}=this.props;
        // 把dataSource中用掉的参数统一出来
        let source = datasource.map((item,index)=>{
            return item.measurementId
        })
        source = source.slice(0,source.length-1)
        if(inputtype === 'number') {
            return <InputNumber />;
        }
        if(inputtype === 'check') {
            return <Checkbox defaultChecked={record.isMonitor}></Checkbox>;
        }
        if(inputtype === 'select') {
            return <Select  style={{ width: 120 }}>
                {options.map((item,index)=><Option key={index} value={item.key} disabled={source.indexOf(JSON.stringify(index))>-1}>{item.props.children}</Option>)}
            </Select>;
        }
        return <Input ref={node => (this.input = node)}/>;
    };
    // save = (type, e) => {
    //     //form表单不包含checkbox和select
    //     const { record, handlesave } = this.props;
    //     //不能做到同步 现在必须加个setTimeout
    //     setTimeout(()=>{
    //         this.form.validateFields((error, values) => {
    //             const handle = JSON.parse(handlesave)
    //             handle({ ...record, ...values });
    //         })
    //     },0)
    // };
    initChildren = (children,initialValue)=> {
        const {
            inputtype,
            options,
            record
        } = this.props;
        if(inputtype==='select'){
            return <Select disabled={true} defaultValue={initialValue} style={{ width: 120 }} >
                {options}
            </Select>
        }
        if(inputtype==='check'){
            return <Checkbox disabled={true} checked={record && record.isMonitor}></Checkbox>
        }
        return children
    }
    renderCell = (form) => {
        this.form=form;
        const {
            editing,
            dataIndex,
            title,
            inputType,
            record,
            required,
            options,
            index,
            children,
            ...restProps
        } = this.props;
        let initialValue = record&&record[dataIndex];
        // if(dataIndex == 'measurementId'){
        //     initialValue=record[dataIndex]
        // }
        // if(dataIndex == 'importance'){
        //     initialValue=record[dataIndex]
        // }
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item style={{ margin: 0 }}>
                        {form.getFieldDecorator(dataIndex, {
                            rules: [
                                {
                                    required: required,
                                    message: '该项为必填项',
                                },
                            ],
                            initialValue: initialValue,
                        })(this.getInput())}
                    </Form.Item>
                ) : (
                    this.initChildren(children,initialValue)
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
            initEdit:true,
            editingKey: this.props.editingKey ,
            columns: props.columns,
            dataSource: props.dataSource,
        };
    }
    componentWillMount(){
        let {columns}=this.state;
        columns[columns.length-1]={
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
                        确定
                    </a>
                )}
              </EditableContext.Consumer>
              <Popconfirm title="确认取消吗?" okText="确定" cancelText="取消" onConfirm={() => this.cancel(record.key)}>
                <a>取消</a>
              </Popconfirm>
            </span>
                ) : (
                    <a disabled={editingKey===0 || editingKey} style={(editingKey===0 || editingKey)?{opacity:0.5}:{}} onClick={() => this.edit(record.key)}>
                        编辑
                    </a>
                );
            },
        }
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.dataSource!==this.props.dataSource) {
            this.setState({ dataSource: nextProps.dataSource})
        }
        if (nextProps.editingKey!==this.props.editingKey) {
            this.setState({ editingKey: nextProps.editingKey})
        }
    }
    isEditing = record => {return record.key === this.state.editingKey};

    cancel = () => {
        this.setState({ editingKey: '' });
        this.props.hideBtn('show')
    };

    save(form, key) {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }
            //处理select的第五个和value的问题
            const newData = [...this.state.dataSource];
            const index = newData.findIndex(item => key === item.key);
            if (index > -1) {
                const item = newData[index];
                newData.splice(index, 1, {
                    ...item,
                    ...row,
                });
                this.props.setDataSource(newData,this.state.editingKey)
                this.setState({ editingKey: '' });
            } else {
                newData.push(row);
                this.props.setDataSource(newData,this.state.editingKey)
                this.setState({  editingKey: '' });
            }
            this.props.hideBtn('show')
        });
    }
    handleSave = row => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        this.setState({dataSource: newData})
    };
    edit(key) {
        this.setState({ editingKey: key });
        this.props.hideBtn('hide')
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            },
        };
        const columns = this.state.columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    inputtype: col.inputtype,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    editing: this.isEditing(record),
                    // handlesave:this.handleSave,
                    options:col.options,
                    datasource:this.state.dataSource,
                    required:col.required
                }),
            };
        });

        return (
            <EditableContext.Provider value={this.props.form}>
                <Table
                    components={components}
                    bordered
                    dataSource={this.state.dataSource}
                    columns={columns}
                    rowClassName="editable-row"
                    pagination={false}
                />
            </EditableContext.Provider>
        );
    }
}

const EditableFormTable = Form.create()(EditableTable);
export default EditableFormTable
