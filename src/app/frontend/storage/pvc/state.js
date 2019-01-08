import { stateName as chromeStateName } from 'chrome/chrome_state';

/** Name of the state. Can be used in, e.g., $state.go method. */
export const stateName = `${chromeStateName}.storage.pvc`;

/** Absolute URL of the state. */
export const stateUrl = '/pvc';