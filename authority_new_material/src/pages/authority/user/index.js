import React, { PureComponent } from 'react';
import request from '../../../util/http'
import { formatterYMD } from '../../../util/index'
import EditTable from '../../../components/common/editTable'
import { Select, Button, Table, Icon, message, Form, Drawer, Input, Avatar, Divider, Col, Row } from 'antd';
import Mock from 'mockjs'
import AddUser from '../../component/addUser'
const { Option } = Select;
const pStyle = {
    fontSize: 16,
    color: 'rgba(0,0,0,0.85)',
    lineHeight: '24px',
    display: 'block',
    marginBottom: 16,
};

const DescriptionItem = ({ title, content }) => (
    <div
        style={{
            fontSize: 14,
            lineHeight: '22px',
            marginBottom: 7,
            color: 'rgba(0,0,0,0.65)',
        }}
    >
        <p
            style={{
                marginRight: 8,
                display: 'inline-block',
                color: 'rgba(0,0,0,0.85)',
            }}
        >
            {title}:
        </p>
        {content}
    </div>
);
// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
    submit = () => {  // 将表单数据传给父组件
        const { form, parent } = this.props;
        parent.getFilterFormMsg(this, form.getFieldsValue())
    };
    render() {
        const { getFieldDecorator } = this.props.form;
        const { codeList } = this.props;
        // 数据转成option组件
        const defaultItem = [<Option key='all'>全部</Option>];
        const codes = defaultItem.concat( codeList.map( (item,index) => { return <Option key={ index }>{ item.username }</Option> } ) );
        return (
            <div className="dis-flex">
                <Button className="filter-submit" type="primary" icon="plus">新增用户</Button>
                <Form layout="inline" onSubmit={ this.handleSubmit } className="default-form">
                    {/* 选择框支持输入搜索 */}
                    <Form.Item label="">
                        {getFieldDecorator('equipmentCode')(
                            <Select
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                placeholder="请选择你所在的机构" style={{ width: '200px' }}>{ codes }</Select>
                        )}
                    </Form.Item>
                    <Form.Item label="">
                        {getFieldDecorator('equipmentCode', {
                            rules: [{ required: true, message: 'Please input your note!' }],
                        })(<Input placeholder="请输入用户名或者邮箱"/>)}
                    </Form.Item>
                    <Button onClick={this.submit} className="filter-submit" type="primary" icon="search">查询</Button>
                </Form>
            </div>
        );
    }
}
const FilterFormBox = Form.create({ name: 'normal_login' })(FilterForm);

class DeviceList extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,  // table loading
            data: [],       // 设备数据
            codeList: [], // 车间列表
            columns: [
                {
                    title: '#',
                    width:50,
                    dataIndex: 'key',
                },
                {
                    title: '用户名',
                    dataIndex: 'username',
                    render: (text,row) => {
                        const colors = ['#C8E6C9','#3C97CE','#BED2DC','#F0E71C','#FF767C']
                        const random = Math.floor(5*Math.random(0,5))
                        return <div className="text-hover username" onClick={this.showDrawer}><img style={{borderRadius:10,marginRight:10}} src={Mock.Random.image('20x20', colors[random], '#FFF', 'png', row.username&&row.username.slice(0,1).toUpperCase())} alt=""/><span>{text}</span></div>
                    }
                },
                {
                    title: '邮箱',
                    dataIndex: 'email',
                },
                {
                    title: '密码',
                    dataIndex: 'password',
                },
                {
                    title: '创造者',
                    dataIndex: 'created_by',
                    render: text => <div className="text-hover created_by">{text}</div>
                },
                {
                    title: '创建时间',
                    dataIndex: 'created_at',
                },
                {
                    title: '更新时间',
                    dataIndex: 'updated_at',
                },
                {
                    title: '组织者',
                    dataIndex: 'organization',
                }, {
                    title: 'Action',
                    dataIndex: '',
                    width:160,
                    render: () => <div className="table-btn">
                        <span className="btn">重置密码</span>
                        <span className="btn">编辑</span>
                    </div>,
                }
            ],
            visible: false
        }
    }
    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    getFilterFormMsg(child, formData) {
        this.getDeviceList(formData)
    }
    // 点击设备行进入详情页
    clickRow(record) {
        this.props.history.push('device/' + record.equipmentCode)
    }
    // 获取设备api
    getDeviceList(data) {
        let url = ''
        if(data) {
            for(let key in data) {
                const item = data[key];
                if(item && item !== 'all') {
                    const symbol = ( url === '' ? '?' : '&' );
                    url += ( symbol + key + '=' + item )
                }
            }
        }
        this.setState({ loading: true })
        request({
            url: `/app/mock/237540/authority/user`,
            urlHead:'http://rap2api.taobao.org',
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ data: res.data.map( (item, key) =>{
                    item.key = key;
                    return item
                }), loading: false  })
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    // 获取设备编码列表
    getEquipmentCodeList() {
        request({
            url: `/app/mock/237540/authority/user/userList`,
            urlHead:'http://rap2api.taobao.org',
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ codeList: res.data })
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    componentDidMount() {
        this.getDeviceList(); // 设备列表
        this.getEquipmentCodeList();    // 设备编码列表
    }
    /*修改异常记录备注*/
    updateParameter = (data)=>{
        //去修改异常记录
        // const urlHead="http://rap2api.taobao.org/app/mock/233676"
        const pam = `id=${data.id}&remark=${data.remark}`
        return request({
            url: `/record/updateRemark?${pam}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    }
    initParameterList = (params)=>{
        //去初始化
        const {equipmentItem} = this.props.location.state || this.state.locationState;
        const {page,page_size}=params
        this.setState({pageNum:page,pageSize:page_size},()=>{
            this._getParameterList(equipmentItem.equipmentCode,page,page_size)
        })
    }
    // 删除参数
    deleteParameter = (id) => {
        return request({
            url: `/parameter/deleteParameter?parameterId=${id}`,
            method: 'DELETE',
            success: res => {
                if (!res || res.code !== 0) {
                    return
                } else {
                    return res
                }
            },
            error: (err) => {
                message.error('网络请求错误');
            }
        })
    }
    addParameter = (param) => {
        const { detail } = this.state
        const { equipmentCode } = detail
        param.equipmentCode = equipmentCode
        if (!param.measurementId) {
            alert('请选择 measurementId 再提交')
            return
        }
        const moduleParam = {
            parameterName:param.parameterName?param.parameterName:'',
            unit:param.unit?param.unit:'',
            importance:param.importance?param.importance:''
        }
        const data = [{ ...param ,...moduleParam}]
        return request({
            url: `/parameter/addParameterList`,
            method: 'POST',
            data,
            success: res => {
                if (!res || res.code !== 0) {
                    message.error(res.msg);
                    return
                } else {
                    return res
                }
            },
            error: (err) => {
                if (err.response.data.code === -2) {
                    message.error('数据出错，请检查填写数据');
                } else {
                    message.error('网络请求错误');
                }
            }
        })
    }
    render() {
        const {columns, data, loading, codeList} = this.state;
        return (
            <div>
                <div className="filter-panel">
                    <FilterFormBox parent={this} codeList={codeList}/>
                </div>
                <div className="main-panel">
                    <div className="table">
                        <Table
                            className={data.length>0?'':'no-border'}
                            pagination={false}
                            loading={loading}
                            columns={columns}
                            dataSource={data} />
                    </div>
                    <Drawer
                        width={640}
                        placement="right"
                        closable={false}
                        onClose={this.onClose}
                        visible={this.state.visible}
                    >
                        <p style={{ ...pStyle, marginBottom: 24 }}>User Profile</p>
                        <p style={pStyle}>Personal</p>
                        <Row>
                            <Col span={12}>
                                <DescriptionItem title="Full Name" content="Lily" />
                            </Col>
                            <Col span={12}>
                                <DescriptionItem title="Account" content="AntDesign@example.com" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <DescriptionItem title="City" content="HangZhou" />
                            </Col>
                            <Col span={12}>
                                <DescriptionItem title="Country" content="China🇨🇳" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <DescriptionItem title="Birthday" content="February 2,1900" />
                            </Col>
                            <Col span={12}>
                                <DescriptionItem title="Website" content="-" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <DescriptionItem
                                    title="Message"
                                    content="Make things as simple as possible but no simpler."
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <p style={pStyle}>Company</p>
                        <Row>
                            <Col span={12}>
                                <DescriptionItem title="Position" content="Programmer" />
                            </Col>
                            <Col span={12}>
                                <DescriptionItem title="Responsibilities" content="Coding" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <DescriptionItem title="Department" content="XTech" />
                            </Col>
                            <Col span={12}>
                                <DescriptionItem title="Supervisor" content={<a>Lin</a>} />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <DescriptionItem
                                    title="Skills"
                                    content="C / C + +, data structures, software engineering, operating systems, computer networks, databases, compiler theory, computer architecture, Microcomputer Principle and Interface Technology, Computer English, Java, ASP, etc."
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <p style={pStyle}>Contacts</p>
                        <Row>
                            <Col span={12}>
                                <DescriptionItem title="Email" content="AntDesign@example.com" />
                            </Col>
                            <Col span={12}>
                                <DescriptionItem title="Phone Number" content="+86 181 0000 0000" />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <DescriptionItem
                                    title="Github"
                                    content={
                                        <a href="http://github.com/ant-design/ant-design/">
                                            github.com/ant-design/ant-design/
                                        </a>
                                    }
                                />
                            </Col>
                        </Row>
                    </Drawer>
                </div>
                {/*模态框*/}
                <AddUser maskShow={true} width={540} height={320}/>
            </div>
        );
    }
}

export default DeviceList;
