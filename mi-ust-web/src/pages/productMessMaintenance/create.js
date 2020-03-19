import React, { PureComponent } from 'react';
import request from 'util/http'
import { Input, Breadcrumb, Button, message  } from 'antd';


class ProductCreate extends PureComponent {
  constructor(props) {
    super(props)
    const params = this.props.match.params;
    this.state = {
        type: params.type,
        id: params.id,

        product: {
          productCode: null,
          productName: null,
          productType: null,
          productUnit: null
        }
    }
  }

  handleInputChange = (e, key) => {
    const item = {}; item[key] = e.target ? e.target.value : e;
    let product = Object.assign({}, this.state.product, item )
    this.setState({ product })
  }

  addProdcut() {
    request({
      url: '/product/addProduct',
      method: 'POST',
      data: this.state.product,
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.props.history.go(-1)
      },
      error: () => { message.error('请求失败'); }
    })
  }

  submit() {
    this.addProdcut()
  }

  render() {
    const { type, product } = this.state;
    const { history } = this.props;
    return (
      <div className="create-device-page">
        <div className="fixed-panel">
            <Breadcrumb>
                <Breadcrumb.Item><a href="#" onClick={ (e) => { history.go(type !== 'add' ? -2 : -1) } }>管理产品</a></Breadcrumb.Item>
                {
                    type === 'add' ? <Breadcrumb.Item>添加产品</Breadcrumb.Item> : ''
                }
                {
                    type !== 'add'  ? <Breadcrumb.Item><a  href="#" onClick={ (e) => { history.goBack() } }>产品</a></Breadcrumb.Item> : ''
                }
                {
                    type === 'edit' ? <Breadcrumb.Item>编辑产品</Breadcrumb.Item> : ''
                }
            </Breadcrumb>
            {
                type !== 'add'  ? <h1 style={{ marginTop: '10px' }}>产品名称</h1> : <h1 style={{ marginTop: '10px' }}>添加产品</h1>
            }
        </div>
        <div className="fixed-panel slot">
            <a href="#">基础信息</a>
        </div>
        <section className="basic-info">
        <div className="item">
            <div className="label"><span className="required-mark">*</span>产品名称:</div>
                <Input defaultValue={ product.productName } onChange={ (e) => { this.handleInputChange(e, 'productName') } } />
                { product.productName === '' ? <div className="errorMsg">请输入产品名称</div> : '' }
            </div>
            <div className="item">
                <div className="label"><span className="required-mark">*</span>产品编号:</div>
                <Input defaultValue={ product.productCode } onChange={ (e) => { this.handleInputChange(e, 'productCode') } } />
                { product.productCode === '' ? <div className="errorMsg">请输入产品编号</div> : '' }
            </div>
            <div className="item">
                <div className="label"><span className="required-mark">*</span>产品种类:</div>
                <Input defaultValue={ product.productType } onChange={ (e) => { this.handleInputChange(e, 'productType') } } />
                { product.productType === '' ? <div className="errorMsg">请输入产品种类</div> : '' }
            </div>
            <div className="item">
                <div className="label">产品单位:</div>
                <Input defaultValue={ product.productUnit } onChange={ (e) => { this.handleInputChange(e, 'productUnit') } } />
            </div>
        </section>
        <div className="footer">
          <Button onClick={ (e) => { this.submit() } } type="primary">保存</Button>
          <Button onClick={ (e) => { this.submit() } } type="default">取消</Button>
        </div>
      </div>
    );
  }
}

export default ProductCreate;
