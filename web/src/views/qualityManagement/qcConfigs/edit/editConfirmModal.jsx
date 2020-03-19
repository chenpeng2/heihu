import React from 'react';
import { Icon, Button, FormattedMessage } from 'src/components';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { warning } from 'src/styles/color';

type Props = {
  type: string,
  values: any,
  submit: () => {},
  onCancel: () => {},
};

const EditConfirmModal = (props: Props) => {
  const { type, values, submit, onCancel } = props;
  return (
    <div>
      <div style={{ margin: '20px 30px' }}>
        <div style={{ display: 'flex', paddingTop: 10 }}>
          <Icon style={{ fontSize: 22, color: warning }} type={'question-circle'} />
          <div style={{ fontSize: 14, fontWeight: 900, marginLeft: 10 }}>
            {changeChineseToLocaleWithoutIntl('是否另存为新方案')}
          </div>
        </div>
        <div style={{ margin: '10px 0 20px 32px' }}>
          {type ? (
            <FormattedMessage
              defaultMessage={'该质检方案可能被多处使用，是否要为此{type}另存为新方案？'}
              values={{
                type: type === 'material' ? '物料定义' : type === 'mbom' ? '生产BOM' : '工艺路线',
              }}
            />
          ) : (
            changeChineseToLocaleWithoutIntl('该质检方案可能被多处使用，是否另存为新方案?')
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button
            style={{ marginLeft: 20 }}
            onClick={() => {
              // false为不使用新方案
              submit(values, false);
              onCancel();
            }}
            primary
          >
            {type ? '直接替换' : '否'}
          </Button>
          <Button
            type="ghost"
            onClick={() => {
              // true为使用新方案
              submit(values, true);
              onCancel();
            }}
          >
            {type ? '另存为' : '是'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditConfirmModal;
