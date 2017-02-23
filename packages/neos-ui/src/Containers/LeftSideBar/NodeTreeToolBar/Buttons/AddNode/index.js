import React, {PureComponent, PropTypes} from 'react';
import {connect} from 'react-redux';
import {actions} from '@neos-project/neos-ui-redux-store';
import {$transform, $get} from 'plow-js';

import IconButton from '@neos-project/react-ui-components/lib/IconButton/';

@connect($transform({
    focusedNode: $get('ui.pageTree.isFocused')
}), {
    openAddNodeModal: actions.CR.Nodes.commenceCreation
})
export default class AddNode extends PureComponent {
    static propTypes = {
        className: PropTypes.string,
        openAddNodeModal: PropTypes.func.isRequired,
        focusedNode: PropTypes.string.isRequired
    };

    handleOpenModalBtnClick = () => {
        const {openAddNodeModal, focusedNode} = this.props;

        openAddNodeModal(focusedNode);
    }

    render() {
        const {focusedNode, className} = this.props;

        return (
            <span>
                <IconButton
                    isDisabled={Boolean(focusedNode) === false}
                    className={className}
                    icon="plus"
                    onClick={this.handleOpenModalBtnClick}
                    hoverStyle="clean"
                    />
            </span>
        );
    }
}
