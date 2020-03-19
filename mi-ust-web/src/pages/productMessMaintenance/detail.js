import React, { PureComponent } from 'react';
import request from 'util/http'
import { Breadcrumb, Button, Popconfirm  } from 'antd';

class ProductDetail extends PureComponent {
  constructor(props) {
    super(props)
    const params = this.props.match.params;  // url params
    this.state = {
        detail: {},
        id: params.id, // 设备编号
    }
  }

  getProductDetail(id) {
    request({
      url: `/product/getProduct?productCode=${ id }`,
      method: 'GET',
      data: this.state.product,
      success: res => {
        if(!res || res.code !== 0) {
          return
        }
        this.setState({ detail: res.data })
      },
      error: () => { alert('request 失败') }
    })
  }

  // 删除产品
  deleteProduct(id) {
    request({
      url: `/product/deleteProduct?productCode=${ id }`,
      method: 'DELETE',
    }).then( res => {
      if(!res || res.code !== 0) {
        return
      }
      this.props.history.go(-1)
    })
  }

  componentDidMount() {
    this.getProductDetail(this.state.id)
  }

  render() {
    const { detail, id } = this.state;
    return (
      <div className="create-device-page">
        <div className="fixed-panel">
          <Breadcrumb>
            <Breadcrumb.Item><a href="#" onClick={ (e) => { this.props.history.goBack() } }>管理产品</a></Breadcrumb.Item>
            <Breadcrumb.Item>产品</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <h1>{ detail.productName }</h1>
            {/* <div className="btn-group">
              <Button onClick={ () => this.props.history.push('/product/edit/' + id) } type="primary">编辑</Button>
              <Popconfirm
                title="确定删除该产品?"
                onConfirm={ () => { this.deleteProduct(id) }  }
                okText="确定"
                cancelText="取消"
              >
                <Button>删除</Button>
              </Popconfirm>
          </div> */}
          </div>
        </div>
        {/* <div className="fixed-panel slot">
            <a href="#">基础信息</a>
        </div> */}
        <div className="title">基础信息</div>
        <section className="basic-info">
            <div className="item">
                <div className="label">产品名称:</div>
                { detail.productName }
            </div>
            <div className="item">
                <div className="label">产品编号:</div>
                { detail.productCode }
            </div>
            <div className="item">
                <div className="label">产品种类:</div>
                { detail.productType }
            </div>
            <div className="item">
                <div className="label">产品单位:</div>
                { detail.productUnit }
            </div>
        </section>
      </div>
    );
  }
}

export default ProductDetail;