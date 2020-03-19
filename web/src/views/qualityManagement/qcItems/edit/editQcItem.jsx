import * as React from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withForm, Button } from 'components';
import { queryQcItemDetail, updateQcItem } from 'src/services/knowledgeBase/qcItems';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { warning } from 'src/styles/color';
import { QcItemBase } from '../index';
import { toQcItemDetail } from '../../navigation';

type Props = {
  router: any,
  form: any,
  params: {},
  match: {},
};

class EditQcItem extends React.Component {
  props: Props;
  state = {
    data: {},
  };

  componentDidMount = () => {
    const {
      props: {
        match: {
          params: { id },
        },
      },
    } = this;
    if (id) {
      this.fetchData(id);
    }
  };

  formatData = payloads => {
    console.log(payloads.group);
    payloads.groupId = payloads.group.key;
    delete payloads.group;
    return payloads;
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

  submit = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const _format = this.formatData(values);
        const {
          props: {
            match: {
              params: { id },
            },
          },
        } = this;
        updateQcItem(id, _format)
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
        <QcItemBase form={form} formData={data} title="编辑质检项" />
        <div style={{ lineHeight: '32px', height: 32 }}>
          <Button
            style={{ width: 114, height: 32, marginLeft: 120 }}
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
        </div>
        <p style={{ color: warning, paddingLeft: 120, marginTop: 10 }}>
          {changeChineseToLocaleWithoutIntl('保存后调用该质检项的质检方案会更新为最新信息')}
        </p>
      </div>
    );
  }
}

EditQcItem.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(withForm({}, EditQcItem));
