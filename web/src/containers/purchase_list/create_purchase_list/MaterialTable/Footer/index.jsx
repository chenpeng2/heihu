import React from 'react';
import { Button } from 'components';
import { primary } from 'styles/color';

type Props = {
  leftBtnTitle: String,
  onPressLeftBtn: () => void,
  onPressRightBtn: () => void,
};

function Footer(props: Props) {
  const { leftBtnTitle, onPressLeftBtn, onPressRightBtn } = props;
  const btnStyle = { border: 'none', color: primary, padding: 0 };
  return (
    <div>
      <Button icon="plus-circle-o" onClick={onPressLeftBtn} type="default" style={btnStyle}>
        {leftBtnTitle}
      </Button>
      <Button icon="plus-circle-o" onClick={onPressRightBtn} type="default" style={{ ...btnStyle, marginLeft: 20 }}>
        手动添加物料
      </Button>
    </div>
  );
}

export default React.memo(Footer);
