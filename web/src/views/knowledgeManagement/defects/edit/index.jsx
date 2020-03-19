import React, { Component } from 'react';
import _ from 'lodash';

import { editDefect, getDefect } from 'src/services/knowledgeBase/defect';
import { Button, message, Spin } from 'src/components';
import log from 'src/utils/log';

import { formatFormValue } from '../constants';
import BaseForm, { FORM_TYPE } from '../baseComponent/baseForm';
import { changeChineseToLocaleWithoutIntl } from '../../../../utils/locale/utils';

type Props = {
  id: String,
  onClose: any,
  onCompeleted: any,
  onCancel: any,
};

class EditUnit extends Component {
  props: Props;
  state = {
    loading: true,
    initialValue: {},
  };

  async componentDidMount() {
    const { id } = this.props;
    this.setState({ loading: true });
    try {
      const res = await getDefect(id);
      const { name, code, defectGroupId, defectGroupName, remark } = _.get(res, 'data.data');
      const initialValue = {
        name,
        code,
        defectGroup: { key: defectGroupId, label: defectGroupName },
        remark,
      };
      this.setState({ initialValue });
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { id, onClose, onCancel, onCompeleted } = this.props;
    const { initialValue } = this.state;
    const formRef = React.createRef();

    return (
      <Spin spinning={this.state.loading}>
        <div style={{ paddingBottom: 30 }}>
          <BaseForm type={FORM_TYPE.edit} ref={formRef} initialValue={initialValue} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="default"
              onClick={() => {
                if (typeof onCancel === 'function') onCancel();
              }}
              style={{ width: 110 }}
            >
              取消
            </Button>
            <Button
              type={'primary'}
              style={{
                width: 110,
                marginLeft: 10,
              }}
              onClick={() => {
                const form = formRef.current;

                if (!form) return;

                form.validateFieldsAndScroll(async (err, value) => {
                  if (err) return;

                  editDefect(id, formatFormValue(value))
                    .then(() => {
                      message.success(
                        changeChineseToLocaleWithoutIntl('{action}{item}成功', { action: '编辑', item: '次品项' }),
                      );
                      if (typeof onCompeleted === 'function') onCompeleted();
                      if (typeof onClose === 'function') onClose();
                    })
                    .catch(e => {
                      log.error(e);
                    });
                });
              }}
            >
              确定
            </Button>
          </div>
        </div>
      </Spin>
    );
  }
}

export default EditUnit;
