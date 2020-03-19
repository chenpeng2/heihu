import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import { changeChineseToLocale } from 'src/utils/locale/utils';

import { black } from 'src/styles/color';

const DetailPageTitleLayout = (props) => {
    const { title, style, intl } = props;

    if (!title) return null;

    return (
        <div style={{ color: black, fontSize: 18, ...style }} >{changeChineseToLocale(title, intl)}</div>
    );
};

DetailPageTitleLayout.propTypes = {
    style: PropTypes.any,
    title: PropTypes.any,
    intl: PropTypes.any,
};

export default injectIntl(DetailPageTitleLayout);
