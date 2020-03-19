import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withForm, FormItem, Button } from 'components';
import { createQcItem, queryQcItemDetail } from 'src/services/knowledgeBase/qcItems';
import { toQcItemDetail } from '../../navigation';
import { QcItemBase } from '../index';

type Props = {
  router: any,
  form: any,
  params: {},
  match: {},
};

class CreateQcItem extends React.Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount = () => {
    const id = _.get(this, 'props.match.params.id', undefined);
    if (id) {
      this.fetchData(id);
    }
  };

  fetchData = async id => {
    await queryQcItemDetail(id)
      .then(({ data: { data } }) => {
        this.setState({
          data,
        });
      })
      .catch(e => console.log(e));
  };

  formatData = payloads => {
    payloads.groupId = _.get(payloads, 'group.key', undefined);
    delete payloads.group;
    return payloads;
  };

  submit = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const _format = this.formatData(values);
        createQcItem(_format)
          .then(({ data: { statusCode, data: { id } } }) => {
            if (statusCode === 200) {
              this.context.router.history.push(toQcItemDetail(id));
            }
          })
          .catch(console.log);
        return;
      }
      return null;
    });
  };

  render() {
    const { form } = this.props;
    const { data } = this.state;

    return (
      <div style={{ padding: '20px 20px' }}>
        <QcItemBase form={form} formData={data} title="创建质检项" />
        <FormItem label={' '}>
          <Button
            style={{ width: 114, height: 32 }}
            type="default"
            onClick={() => {
              const { router } = this.context;
              if (router) {
                router.history.go(-1);
              }
            }}
          >
            取消
          </Button>
          <Button style={{ width: 114, height: 32, marginLeft: 60 }} type="primary" onClick={this.submit}>
            保存
          </Button>
        </FormItem>
      </div>
    );
  }
}

CreateQcItem.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, CreateQcItem));
