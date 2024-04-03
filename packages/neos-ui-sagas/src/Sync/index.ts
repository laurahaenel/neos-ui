/*
 * This file is part of the Neos.Neos.Ui package.
 *
 * (c) Contributors of the Neos Project - www.neos.io
 *
 * This package is Open Source Software. For the full copyright and license
 * information, please view the LICENSE file which was distributed with this
 * source code.
 */
import {put, call, takeEvery, race, take, select} from 'redux-saga/effects';

import {DimensionCombination, WorkspaceName} from '@neos-project/neos-ts-interfaces';
import {AnyError} from '@neos-project/neos-ui-error';
import {actionTypes, actions, selectors} from '@neos-project/neos-ui-redux-store';
import backend from '@neos-project/neos-ui-backend-connector';
import {Conflict, ResolutionStrategy} from '@neos-project/neos-ui-redux-store/src/CR/Syncing';

// @TODO: This is a helper to gain type access to the available backend endpoints.
// It shouldn't be necessary to do this, and this hack should be removed once a
// better type API is available
import {default as Endpoints} from '@neos-project/neos-ui-backend-connector/src/Endpoints';
type Endpoints = ReturnType<typeof Endpoints>;

export function * watchSyncing() {
    yield takeEvery(actionTypes.CR.Syncing.STARTED, function * change() {
        if (yield * waitForConfirmation()) {
            do {
                yield * syncPersonalWorkspace(false);
            } while (yield * waitForRetry());

            yield put(actions.CR.Syncing.finish());
        }
    });
}

function * waitForConfirmation() {
    const {confirmed}: {
        cancelled: null | ReturnType<typeof actions.CR.Syncing.cancel>;
        confirmed: null | ReturnType<typeof actions.CR.Syncing.confirm>;
    } = yield race({
        cancelled: take(actionTypes.CR.Syncing.CANCELLED),
        confirmed: take(actionTypes.CR.Syncing.CONFIRMED)
    });

    return Boolean(confirmed);
}

type SyncWorkspaceResult =
    | { success: true }
    | { conflicts: Conflict[] }
    | { error: AnyError };

function * syncPersonalWorkspace(force: boolean) {
    const {syncWorkspace} = backend.get().endpoints as Endpoints;
    const personalWorkspaceName: WorkspaceName = yield select(selectors.CR.Workspaces.personalWorkspaceNameSelector);
    const dimensionSpacePoint: null|DimensionCombination = yield select(selectors.CR.ContentDimensions.active);

    try {
        const result: SyncWorkspaceResult = yield call(syncWorkspace, personalWorkspaceName, force, dimensionSpacePoint);
        if ('success' in result) {
            yield put(actions.CR.Syncing.succeed());
        } else if ('conflicts' in result) {
            yield * resolveConflicts(result.conflicts);
        } else {
            yield put(actions.CR.Syncing.fail(result.error));
        }
    } catch (error) {
        yield put(actions.CR.Syncing.fail(error as AnyError));
    } finally {
        yield * refreshAfterSyncing();
    }
}

function * resolveConflicts(conflicts: Conflict[]): any {
    yield put(actions.CR.Syncing.resolve(conflicts));

    const {payload: {strategy}}: ReturnType<
        typeof actions.CR.Syncing.selectResolutionStrategy
    > = yield take(actionTypes.CR.Syncing.RESOLUTION_STARTED);

    if (yield * waitForResolutionConfirmation()) {
        if (strategy === ResolutionStrategy.FORCE) {
            yield * syncPersonalWorkspace(true);
        } else if (strategy === ResolutionStrategy.DISCARD_ALL) {
            yield * discardAll();
        }
    }
}

function * waitForResolutionConfirmation() {
    const {confirmed}: {
        cancelled: null | ReturnType<typeof actions.CR.Syncing.cancelResolution>;
        confirmed: null | ReturnType<typeof actions.CR.Syncing.confirmResolution>;
    } = yield race({
        cancelled: take(actionTypes.CR.Syncing.RESOLUTION_CANCELLED),
        confirmed: take(actionTypes.CR.Syncing.RESOLUTION_CONFIRMED)
    });

    return Boolean(confirmed);
}

function * waitForRetry() {
    const {retried}: {
        acknowledged: null | ReturnType<typeof actions.CR.Syncing.acknowledge>;
        retried: null | ReturnType<typeof actions.CR.Syncing.retry>;
    } = yield race({
        acknowledged: take(actionTypes.CR.Syncing.ACKNOWLEDGED),
        retried: take(actionTypes.CR.Syncing.RETRIED)
    });

    return Boolean(retried);
}

function * discardAll() {
    yield console.log('@TODO: Discard All');
}

function * refreshAfterSyncing() {
    yield console.log('@TODO: Refresh after Sync');
    // const {getWorkspaceInfo} = backend.get().endpoints as Endpoints;
    // const workspaceInfo = yield call(getWorkspaceInfo);
    // yield put(actions.CR.Workspaces.update(workspaceInfo));
    // yield put(actions.UI.Remote.finishSynchronization());
}
