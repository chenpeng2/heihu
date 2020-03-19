import React, { PureComponent } from 'react';
import { Button, Popup, Page, Navbar, Block } from 'framework7-react';

export default class extends PureComponent {
    constructor(props) {
      super(props);
      this.state = {
        popup: false,
        $checked: [],
        checked: []
      };
    }

    popFilter = () => {
      this.setState({ popup: true })
    }

    closeFilter = () => {
      this.setState({ popup: false });
    }

    submit = () => {
      this.closeFilter();
      this.setState({
        $checked: this.state.checked
      }, () => {
        this.props.submit(this.state.$checked)
      })
    }

    handleClick(key, item) {
       let temp = [...this.state.checked];
       temp[key] = item
       this.setState({
          checked: temp
       })
    }

    filterItemRender(props, key, checked) {
      return (
        <Block strong key={key}>
            <div className="label">{ props.name }</div>
            <div className="filter-buttons">
            { 
                props.items && props.items.map( (item, i) =>
                    <Button 
                        onClick={ (e) => this.handleClick(key, item, e) }
                        className={ checked[key] && checked[key].name === item.name ? '' : 'unchecked' }
                        outline key={ i }
                    >{ item.name }</Button>
                ) 
            }
            </div>
        </Block>
      )
    }

    resetCheck() {
      this.setState({
        checked: this.state.$checked
      })
    }

    componentDidMount() {
      const { defaultChecked } = this.props
      this.setState({
        checked: defaultChecked,
        $checked: defaultChecked
      })
    }

    render() {
      const {$checked, popup, checked } = this.state;
      const { filterList } = this.props;
      return (
        <div>
          <div className="filter-items">
            {
              $checked && $checked.map( (item, key) =>
                <Button outline key={key}>{ item.name }</Button>
              )
            }
          </div>
          <Popup className="filter-popup" opened={ popup } onPopupClosed={() => this.resetCheck() }>
            <Page>
              <Navbar title="过滤器">
                <a href="#" slot="nav-left" onClick={ this.closeFilter }>取消</a>
                <a href="#" slot="nav-right" onClick={ this.submit }>完成</a>
              </Navbar>
              {
                filterList && filterList.map((item, key) =>
                  this.filterItemRender(item, key, checked)
                 )
              }
            </Page>
          </Popup>
        </div>
      )
    }
  };  