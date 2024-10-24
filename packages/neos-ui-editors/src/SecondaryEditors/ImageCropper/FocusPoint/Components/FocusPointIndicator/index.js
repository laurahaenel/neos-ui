import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';

import Draggable from 'react-draggable';

import style from './style.module.css';

export default class FocusPointIndicator extends PureComponent {
    static propTypes = {
        disabled: PropTypes.bool,
        position: PropTypes.any,
        onDrag: PropTypes.func
    };

    render() {
        const {disabled, position, onDrag} = this.props;
        return (
            <Draggable
                bounds={'parent'}
                disabled={disabled}
                position={position}
                onDrag={onDrag}
            >
                <div className={style.wrapper}>
                    <span className={style.indicatorDot}></span>
                </div>
            </Draggable>
        )
    }
}
