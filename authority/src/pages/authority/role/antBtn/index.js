import React, { PureComponent } from 'react';
import { Select, Button, Table, Icon, message, Modal, Input, Popconfirm } from 'antd';
import Mock from 'mockjs'
import request from 'util/http'
import { filterUrl } from 'util/index'
import {getCookie} from 'util/userApi'
const {Random} = Mock
const { Option } = Select;
class Module extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            btnEdit:this.props.btnEdit,
            antBtnData:this.props.antBtnData,
            visible:false,
            authorityArr:[],//已有的权限
            filterSelectValue:[]
        }
    }
    componentWillReceiveProps(nextProps,nextState){
        if(nextProps.btnEdit!==this.props.btnEdit){
            this.setState({btnEdit:nextProps.btnEdit})
        }
        if(nextProps.antBtnData!==this.props.antBtnData){
            this.setState({antBtnData:nextProps.antBtnData})
        }
    }
    componentDidMount(){
        this.setState({filterSelectValue:this.props.antBtnData.map((item,index)=>{return item.description})})
    }
    getAuthorityList(data) {
        this.setState({ loading: true })
        const name = data.authority?`authority=${data.authority}`:''
        const userInfo = localStorage.getItem('login_data')
        const JSONUserInfo = userInfo && JSON.parse(userInfo)
        const organ = JSONUserInfo && JSONUserInfo.user.organization
        let organization = data.organization?`&organization=${data.organization}`:`&organization=${organ}`
        if(organization.indexOf('0') > -1){
            organization = ''
        }
        const pageNum = `&pageNum=1`
        const pageSize = `&pageSize=10`
        const pams = filterUrl(`${name}${organization}${pageNum}${pageSize}`)
        request({
            url: `/authority/getAuthorityByCondition?${pams}`,
            method: 'GET',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.setState({ authorityArr: res.data&&res.data.authList.map( (item, key) =>{
                    return {authority:item.authority,description:item.description,id:item.id}
                }), loading: false  })
            },
            error: () => {
                message.error('请求失败！')
                this.setState({ loading: false })
            }
        })
    }
    //删除权限
    deleteAuthority = (item)=> {
        if(this.props.addRole){
            let newSelectValue = []
            newSelectValue = this.state.antBtnData.filter((itm,index)=>item.id!==itm.id)
            //filterSelectValue剔除删除的
            const values = newSelectValue.map((item,index)=>{return item.authority})
            this.setState({filterSelectValue:values})
            this.props.addRole(newSelectValue)
            return
        }
        request({
            url: `/authority/deleteAuthority?id=${item.id}`,
            method: 'DELETE',
            success: res => {
                if(!res || res.code !== 0) {
                    return
                }
                this.props.refresh()
            },
            error: () => {
                message.error('请求失败！')
            }
        })
    };
    changeRole = (values)=> {
        const {authorityArr} = this.state
        const arrayValue = []
        const authoArr = authorityArr.map((item,index)=>item.description)
        values.map((item,idx)=>{
            const idxOf = authoArr.indexOf(item)
            const authority = authorityArr[idxOf].authority
            const id = authorityArr[idxOf].id
            arrayValue.push({authority,description:item,id})
        })
        const filterSelectValue = arrayValue.map((item,index)=>item.description)
        this.setState({antBtnData:arrayValue,filterSelectValue})
    }
    addRole = ()=> {
        this.setState({visible:false})
        this.props.addRole(this.state.antBtnData)
    }
    render() {
        const {hideAddBtn} = this.props
        const {btnEdit, antBtnData, filterSelectValue, authorityArr} = this.state
        return (
            <div className="auth-td">
                {
                    antBtnData.length>0&&antBtnData.map((item,index)=><span key={index} className="border">
                        <span>{item.authority}</span>
                        {!btnEdit &&<Popconfirm
                            icon={null}
                            title="您确认要删除该已有权限吗?"
                            onConfirm={() => this.deleteAuthority(item)}
                            okText="删除"
                            cancelText="取消"
                        >
                            <i className='icon-iconmoon icon-delete_circle-16px'></i>
                        </Popconfirm>
                        }
                    </span>)
                }
                {!hideAddBtn&&<span>
                    <Button className="filter-submit add-plus" type="primary" icon="plus" onClick={()=>this.setState({visible:true},()=>this.getAuthorityList({}))}>新增权限</Button>
                </span>}
                <Modal
                    wrapClassName="role-modal animated fadeIn"
                    title={null}
                    okText="保存"
                    onCancel={()=>this.setState({visible:false})}
                    onOk={()=>this.addRole()}
                    closable={false}
                    visible={this.state.visible}
                    keyboard={true}
                    centered={true}
                    maskClosable={false}
                >
                    <div className="title">
                        新增权限
                    </div>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="请输入关键字"
                        // size="large"
                        suffixIcon={<Icon type="down" />}
                        onChange={(value)=>{this.changeRole(value)}}
                        showArrow={true}
                        value={filterSelectValue}
                    >
                        {authorityArr.length>0 && authorityArr.map((item,index)=><Option key={item.description}>{item.description}</Option>)}
                    </Select>
                </Modal>
            </div>
        );
    }
}

export default Module;
