import React, { PureComponent } from 'react';
import request from 'util/http'
import { formatterYMD, filterUrl } from 'util/index'
import { Select, Button, Table, Icon, message, Form, Drawer, Input, Popconfirm, Empty } from 'antd';
import Mock from 'mockjs'
import AddUser from '../../component/addUser'
import {connect} from 'react-redux'
import * as loginActions from '../../../redux/actions/loginActionCreators'
import { bindActionCreators } from "redux"
import { getloginState } from '../../../redux/selectors/loginSelector'
import Header from 'components/common/Header'
import {getCookie} from 'util/userApi'
const { Option } = Select;

// 筛选表单，表单项为车间、设备类型、设备编码
class FilterForm extends React.Component {
    submit = () => {  // 将表单数据传给父组件
        const { form, parent } = this.props;
        parent.getFilterFormMsg(this, form.getFieldsValue())
    };
    addUser = (data,value)=> {
        this.props.parent.props.setOpenState(data,value)
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const { codeList } = this.props;
        // 数据转成option组件
        const defaultItem = [<Option key='' value="">全部</Option>];
        const codes = defaultItem.concat( codeList.map( (item,index) => { return <Option key={index} value={item}>{ item }</Option> } ) );
        return (
            <div className="dis-flex">
                <Button className="filter-add" type="primary" icon="plus" onClick={()=>this.addUser(null,1)}>新增用户</Button>
                <Form layout="inline" className="default-form">
                    {/* 选择框支持输入搜索 */}
                    <Form.Item label="">
                        {getFieldDecorator('organization',{
                            rules: [{ required: false, message: '' }],
                        })(
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
                        {getFieldDecorator('username', {
                            rules: [{ required: false, message: '' }],
                        })(<Input placeholder="请输入用户名或者邮箱"/>)}
                    </Form.Item>
                    <Button onClick={this.submit} className="filter-submit" type="primary" icon="search">查询</Button>
                </Form>
            </div>
        );
    }
}
const FilterFormBox =Form.create({ name: 'normal_login' })(FilterForm)
class User extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,  // table loading
            data: [],       // 设备数据
            codeList: [], // 车间列表
            columns: [
                {
                    title: '邮箱',
                    dataIndex: 'username',
                    render: (text,row) => {
                        return <div className="text-hover username" onClick={() => this.getDetail(row)}><img style={{borderRadius:15,marginRight:15}} src={Mock.Random.dataImage('30x30', row.name&&row.name.slice(0,1).toUpperCase())} alt=""/><span>{text}</span></div>
                    }
                },
                {
                    title: '用户名',
                    dataIndex: 'name',
                },
                {
                    title: '拥有角色',
                    dataIndex: ' ',
                    render: (text,row) => <div className="text-hover created_by">
                        {
                            row.roleList && row.roleList.length>0 && row.roleList.map((item,index)=>{
                                return row.roleList.length==index+1?item.name:`${item.name},`
                            })
                        }
                    </div>
                },
                {
                    title: '机构',
                    dataIndex: 'organization',
                },
                {
                    title: 'org_id',
                    dataIndex: 'orgId',
                },
                {
                    title: '操作',
                    dataIndex: '',
                    width:200,
                    render: (text,row) => <div className="table-btn dis-flex">
                        <span className="btn" onClick={()=>this.addUser(row,2)}>重置密码</span>
                        <span className="btn" onClick={()=>this.addUser(row,3)}>
                            <i className="icon-iconmoon icon-Edit_Pencil-24px cursor"></i>
                        </span>

                        <Popconfirm
                            icon={null}
                            title="您确认删除【已有】账户吗?"
                            onConfirm={() => this.deleteUser(row)}
                            okText="删除"
                            cancelText="取消"
                        >
                            <span className="btn"><i className='icon-iconmoon icon-delete_trashcan-24px cursor cursor'></i></span>
                        </Popconfirm>
                    </div>,
                }
            ],
            visible: false,
        }
    }
    //删除用户
    deleteUser = (row)=> {
        request({
            url: `/user/deleteUser?id=${row.id}`,
            method: 'DELETE',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                message.success('删除成功！')
                this.getUserList({})
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    addUser = (data,openType)=> {
        // 1，添加，2，重置密码，3，修改
        this.props.setOpenState(data,openType)
    }
    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    getFilterFormMsg(child, formData) {
        this.getUserList(formData)
    }
    componentWillReceiveProps(nextProps,nextState){
        if(nextProps.userInfo!==this.props.userInfo){
            this.setState({userInfo:nextProps.userInfo})
        }
    }
    getUserList(data) {
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
        const userInfo = localStorage.getItem('login_data')
        const JSONUserInfo = userInfo && JSON.parse(userInfo)
        const organ = JSONUserInfo && JSONUserInfo.user.organization
        let organization = data.organization?`&organization=${data.organization}`:`&organization=${organ}`
        if(organization.indexOf('0') > -1){
            organization = ''
        }
        const username = data.username?`&username=${data.username}`:''
        const name = data.username?`&name=${data.username}`:''
        var reg = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
        const is_Email = reg.test(data.username)
        const emailUser = is_Email ? username : name
        const pageNum = `&pageNum=1`
        const pageSize = `&pageSize=10`
        const pams = filterUrl(`${organization}${emailUser}${pageNum}${pageSize}`)
        request({
            url: `/user/getUserByCondition?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                let filterList = res.data&&res.data.userList
                if(organization === ''){
                    filterList = filterList && filterList.length > 0 ? filterList.filter((item,index)=>{
                        const mid = item.user.authorities && item.user.authorities.map((itm,idx)=>{
                            if(itm.authority === 'master' || itm.authority === 'system'){
                                return true
                            }
                            return false
                        })
                        return mid && mid.indexOf(true) > -1 ? true : false
                    }) : []
                }
                this.setState({ data: filterList.length > 0 ? filterList.map( (item, key) =>{
                    const newItem={}
                    newItem.key=key;
                    newItem.roleList=item.roleList;
                    return {...newItem, ...item.user}
                }) : null, loading: false  })
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    // 获取机构列表
    getOrganizationList() {
        request({
            url: `/user/getOrganization`,
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
        this.getOrganizationList();    // 设备编码列表
        this.getUserList({});
    }
    //根据用户查询角色和权限
    getDetail = (row)=> {
        row.imgUrl=Mock.Random.dataImage('30x30', row.username&&row.username.slice(0,1).toUpperCase())
        const pageNum = `&pageNum=1`
        const pageSize = `&pageSize=10`
        request({
            url: `/user/getRoleAndAuthById?id=${row.id}${pageNum}${pageSize}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                const data = res.data
                data.roleDto.map((item,index)=>{
                    const itm = item
                    itm.key=index
                    return itm
                })
                this.setState({drawerData:{...data,row},visible:true})
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    filterRoleDto = (e)=> {
        this.setState({filterRoleDto:e.target.value})
    }
    render() {
        let {columns, data, loading, codeList, drawerData} = this.state;
        const { userInfo } = this.props
        const header = drawerData && drawerData.row
        const roleDto = drawerData && drawerData.roleDto
        const total = drawerData && drawerData.total
        const filterRole = roleDto&&roleDto.filter((item,index)=>{
            if(!this.state.filterRoleDto || item.role.name.indexOf(this.state.filterRoleDto)>-1){
                return true
            }
        })
        if(userInfo.user && userInfo.user.organization!=='0'){
            codeList = codeList.filter((item,index)=>item === userInfo.user.organization)
        }
        const columns2 = [
            {
                title:'角色',
                dataIndex: 'role',
                key: 'role',
                width:'50%',
                render:(text,row)=><span style={{cursor:'pointer'}} onClick={()=>{}}>{row.role.name}</span>
            },
            {
                title: '权限',
                dataIndex: 'authority',
                key: 'authority',
                render:(text,row)=><span style={{color:'rgb(0, 175, 152)',cursor:'pointer'}}>{row.authList.map((item,index)=><span key={index} onClick={()=>{}}>{item.authority.length>0?item.authority+';   ':item.authority}</span>)}</span>
            },
        ];
        return (
            <div>
                <Header/>
                <div className="main-panel">
                    <div className="filter-panel">
                        <FilterFormBox parent={this} codeList={codeList}/>
                    </div>
                    <div className="table">
                        <Table
                            rowKey={record=>record.id}
                            className={data && data.length>0?'':'no-border'}
                            pagination={false}
                            loading={loading}
                            columns={columns}
                            dataSource={data}
                        />
                    </div>
                    <Drawer
                        width={640}
                        placement="right"
                        maskClosable={false}
                        onClose={this.onClose}
                        visible={this.state.visible}
                        className="drawer"
                    >
                        <div className="header p-style dis-flex">
                            {/* <i className="icon-iconmoon icon-delete_circle-16px"></i> */}
                            <img className="avatar" alt="avatar" style={{borderRadius:'50%'}} src={header && header.imgUrl} />
                            <div>
                                <div>{header && header.username}</div>
                                <div className="dis-flex"><span>{header && header.organization}</span><span>{header && header.email}</span></div>
                            </div>
                        </div>
                        <div className="tab-bar p-style"><Button>用户角色</Button></div>
                        <Input
                            style={{width:'600px',margin:'10px 20px 0 20px'}}
                            placeholder="请输入筛选关键词"
                            prefix={<Icon type="search" style={{color: 'rgba(153,153,153,1)'}} />}
                            onPressEnter={(e)=>this.filterRoleDto(e)}
                            onBlur={(e)=>this.filterRoleDto(e)}
                            allowClear={true}
                        />
                        {roleDto?
                            (roleDto.length?
                              <Table style={{padding:'0 20px 20px 20px'}} dataSource={filterRole} columns={columns2}
                                     pagination={{
                                         size:"small",
                                         total:total,
                                         pageSize:10,
                                         hideOnSinglePage:true
                                     }}
                                />
                            :
                                <Empty description={'暂无角色和权限'} style={{marginTop:100}}/>
                            )
                            :null
                        }
                    </Drawer>
                </div>
                {/*模态框*/}
                <AddUser width={540} height={540} refresh={()=>this.getUserList({})} codeList={codeList}/>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const userInfo = getloginState(state)
    return {
        userInfo
    }
}
//映射Redux actions到组件的属性
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators(loginActions, dispatch)
}
//连接组件
export default connect(mapStateToProps, mapDispatchToProps)(User)
