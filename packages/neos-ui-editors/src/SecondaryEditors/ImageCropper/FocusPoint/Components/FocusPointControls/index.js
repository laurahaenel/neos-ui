import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {TextInput, IconButton} from '@neos-project/react-ui-components';

import style from './style.module.css';

export default class FocusPointControls extends PureComponent {
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
        onDelete: PropTypes.func.isRequired,
        focusPointOptions: PropTypes.object.isRequired,
        buttonTitle: PropTypes.string.isRequired,
        deleteButtonTitle: PropTypes.string.isRequired
    };

    render() {
        const {onClick, onChange, onDelete, focusPointOptions, buttonTitle, deleteButtonTitle} = this.props;
        return (
            <div className={style.wrapper}>
                <IconButton
                    icon={'circle'}
                    onClick={onClick}
                    style={'lighter'}
                    hoverStyle={'brand'}
                    title={buttonTitle}
                    aria-selected={focusPointOptions.active}
                    isActive={focusPointOptions.active}
                />
                {focusPointOptions.active &&
                    <>
                        <TextInput
                            type="number"
                            step="any"
                            min={0}
                            value={focusPointOptions.x}
                            onChange={e => onChange(parseFloat(e), focusPointOptions.y)} />
                        <TextInput
                            type="number"
                            step="any"
                            min={0}
                            value={focusPointOptions.y}
                            onChange={e => onChange(focusPointOptions.x, parseFloat(e))} />
                        <IconButton
                            icon={'trash'}
                            onClick={onDelete}
                            style={'lighter'}
                            hoverStyle={'brand'}
                            title={deleteButtonTitle}
                        />
                    </>
                }
            </div>
        )
    }
}
