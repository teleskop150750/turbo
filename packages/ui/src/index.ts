import installer from "./defaults.js";

export * from "./components";
export * from "./make-installer";

export const { install } = installer;
export const { version } = installer;

export default installer;
