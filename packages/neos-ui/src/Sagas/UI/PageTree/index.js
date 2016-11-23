import {takeLatest} from 'redux-saga';
import {put, select} from 'redux-saga/effects';
import {$get, $contains} from 'plow-js';

import {actionTypes, actions} from '@neos-project/neos-ui-redux-store';
import backend from '@neos-project/neos-ui-backend-connector';

function * watchToggle() {
    yield * takeLatest(actionTypes.UI.PageTree.TOGGLE, function * toggleTreeNode(action) {
        const state = yield select();
        const {contextPath} = action.payload;
        const isCollapsed = !$contains(contextPath, 'ui.pageTree.uncollapsed', state);

        if (isCollapsed) {
            yield put(actions.UI.PageTree.commenceUncollapse(contextPath));
        } else {
            yield put(actions.UI.PageTree.collapse(contextPath));
        }
    });
}

function * requestChildrenForContextPath(action) {
    const {contextPath} = action.payload;
    const {q} = backend.get();
    let parentNodes;
    let childNodes;

    try {
        parentNodes = yield q(contextPath).get();
        childNodes = yield q(contextPath).children('[instanceof TYPO3.Neos:Document]').get();
    } catch (err) {
        yield put(actions.UI.PageTree.invalidate(contextPath));
        yield put(actions.UI.FlashMessages.add('loadChildNodesError', err.message, 'error'));
    }

    if (childNodes) {
        const nodes = parentNodes.concat(childNodes);

        yield nodes.map(node => put(actions.CR.Nodes.add(node.contextPath, node)));

        yield put(actions.UI.PageTree.uncollapse(contextPath));
    }
}

function * watchRequestChildrenForContextPath() {
    yield * takeLatest(actionTypes.UI.PageTree.REQUEST_CHILDREN, requestChildrenForContextPath);
}

function * watchNodeCreated() {
    yield * takeLatest(actionTypes.UI.Remote.DOCUMENT_NODE_CREATED, function * nodeCreated(action) {
        const {contextPath} = action.payload;

        // ToDo: Needs to load the parent contextPath children, not the created node contextPath.
        yield requestChildrenForContextPath(actions.UI.PageTree.requestChildren(contextPath));

        // ToDo: Set the context path as the current selected node and open it in the content canvas.
        yield put(actions.UI.PageTree.focus(contextPath));
    });
}

function * watchCommenceUncollapse({globalRegistry}) {
    const nodeTypesRegistry = globalRegistry.get('@neos-project/neos-ui-contentrepository');

    yield * takeLatest(actionTypes.UI.PageTree.COMMENCE_UNCOLLAPSE, function * uncollapseNode(action) {
        const state = yield select();
        const {contextPath} = action.payload;
        const childrenAreFullyLoaded = $get(['cr', 'nodes', 'byContextPath', contextPath, 'children'], state).toJS()
            .filter(childEnvelope => nodeTypesRegistry.isOfType(childEnvelope.nodeType, 'TYPO3.Neos:Document'))
            .every(
                childEnvelope => Boolean($get(['cr', 'nodes', 'byContextPath', childEnvelope.contextPath], state))
            );

        if (childrenAreFullyLoaded) {
            yield put(actions.UI.PageTree.uncollapse(contextPath));
        } else {
            yield put(actions.UI.PageTree.requestChildren(contextPath));
        }
    });
}

export const sagas = [
    watchToggle,
    watchCommenceUncollapse,
    watchRequestChildrenForContextPath,
    watchNodeCreated
];