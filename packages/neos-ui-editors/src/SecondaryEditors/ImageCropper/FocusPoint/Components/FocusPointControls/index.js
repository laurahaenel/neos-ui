import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {TextInput, IconButton} from '@neos-project/react-ui-components';

import style from './style.module.css';

export default class FocusPointControls extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        focusPointPosition: PropTypes.object.isRequired,
        isModeActive: PropTypes.bool
    };

    render() {
        const {onClick, onChange, focusPointPosition, isModeActive} = this.props;
        return (
            <div className={style.wrapper}>
                <IconButton
                    icon={'circle'}
                    onClick={onClick}
                    style={'lighter'}
                    hoverStyle={'brand'}
                    title={'Focus Point'} // {i18nRegistry.translate('Neos.Neos:Main:crop')}
                    aria-selected={isModeActive}
                    isActive={isModeActive}
                />
                <TextInput
                    type="number"
                    step="any"
                    value={focusPointPosition.x}
                    onChange={e => onChange(parseFloat(e), focusPointPosition.y)}
                />
                <TextInput
                    type="number"
                    step="any"
                    value={focusPointPosition.y}
                    onChange={e => onChange(focusPointPosition.x, parseFloat(e))}
                />
            </div>
        )
    }
}
