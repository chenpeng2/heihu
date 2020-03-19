import React from "react"
import { Table, Input, Button, Popconfirm, Form, Checkbox, Select, Radio } from 'antd';
const { Option } = Select;
const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => {
    return <EditableContext.Provider value={form}>
        <tr {...props} />
    </EditableContext.Provider>
};

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
    state = {
        editing: false,
    };



    save = (type, e) => {
        //form表单不包含checkbox和select
        const { record, handleSave } = this.props;
        //不能做到同步 现在必须加个setTimeout
        setTimeout(()=>{
            this.form.validateFields((error, values) => {console.log(values)
                handleSave({ ...record, ...values });
            })
        },0)
    };
    renderCell = form => {
        this.form = form;
        const { children, dataIndex, record, title, inputtype, tailaffix } = this.props;
        const { editing } = this.state;
        let initialValue = record[dataIndex];
        let defaultModu = <Form.Item style={{ margin: 0 }}>
            {form.getFieldDecorator(dataIndex, {
                rules: [
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ],
                initialValue: initialValue,
            })(<Input ref={node => (this.input = node)} style={{width:'80%'}} onPressEnter={this.save} onBlur={this.save} />)}
            <span style={{marginLeft:5}}>{tailaffix}</span>
        </Form.Item>
        if(inputtype==='check'){
            defaultModu = <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: false,
                            message: `${title} is required.`,
                        },
                    ],
                    initialValue: initialValue,
                })(<Checkbox></Checkbox>)}
            </Form.Item>
        }
        if(inputtype==='radio'){
            defaultModu = <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: false,
                            message: `${title} is required.`,
                        },
                    ],
                    initialValue: initialValue,
                })(<Radio></Radio>)}
            </Form.Item>
        }
        if(inputtype==='select'){
            defaultModu = <Form.Item style={{ margin: 0 }}>
                {form.getFieldDecorator(dataIndex, {
                    rules: [
                        {
                            required: true,
                            message: `${title} is required.`,
                        },
                    ],
                    initialValue: initialValue,
                })(<Select  style={{ width: 120 }} onChange={this.save.bind(this,'select')}>
                    <Option value="jack">jack</Option>
                    <Option value="lucy">lucy</Option>
                    <Option value="disabled" disabled>
                        disabled
                    </Option>
                    <Option value="yiminghe">yiminghe</Option>
                </Select>)}
            </Form.Item>
        }
        return defaultModu
    };

    render() {
        const {
            editable,
            dataIndex,
            title,
            record,
            index,
            handleSave,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editable ? (
                    <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
                ) : (
                    children
                )}
            </td>
        );
    }
}

class EditableTable extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataSource: this.props.dataSource,
            columns: this.props.columns
        };
    }

    handleDelete = key => {
        const dataSource = [...this.state.dataSource];
        this.setState({ dataSource: dataSource.filter(item => item.key !== key) });
    };

    handleAdd = () => {
        const { count, dataSource } = this.state;
        const newData = {
            key: count,
            name: `Edward King ${count}`,
            age: 32,
            address: `London, Park Lane no. ${count}`,
        };
        this.setState({
            dataSource: [...dataSource, newData],
            count: count + 1,
        });
    };

    handleSave = row => {
        const newData = [...this.state.dataSource];
        const index = newData.findIndex(item => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        console.log(newData)
        this.setState({dataSource: newData})
    };
    handlePreserve = () => {
        this.props.editTable(this.state.dataSource);
    }
    render() {
        const { dataSource,columns } = this.state;
        const components = {
            body: {
                row: EditableFormRow,
                cell: EditableCell,
            },
        };
        const colus = columns.map(col => {
            if (!col.editable) {
                return col;
            }
            return {
                ...col,
                onCell: record => ({
                    record,
                    editable: true,
                    dataIndex: col.dataIndex,
                    title: col.title,
                    handleSave: this.handleSave,
                    inputtype: col.inputtype,
                    tailaffix: col.tailaffix
                }),
            };
        });
        return (
            <div>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={dataSource}
                    columns={colus}
                    pagination={this.props.pagination?this.props.pagination:false}
                />
            </div>
        );
    }
}

export default EditableTable