export default class FocusPointConfiguration {
    constructor(x, y, isModeActive = false) {
        // todo should be a new class
        this.__focusPointPosition = {x, y};
        this.__isModeActive = isModeActive;
    }

    get isModeActive() {
        return this.__isModeActive;
    }

    get focusPointPosition() {
        return this.__focusPointPosition;
    }

    toggleMode() {
        return new FocusPointConfiguration(
            this.__focusPointPosition.x,
            this.__focusPointPosition.y,
            !this.__isModeActive
        );
    }

    updatePosition(x, y) {
        return new FocusPointConfiguration(x, y, this.__isModeActive);
    }
}
