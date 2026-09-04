export const EMULATOR_PROJECT_ID = "demo-nexar-transcan";
export const FIRESTORE_EMULATOR_HOST = "127.0.0.1";
export const FIRESTORE_EMULATOR_PORT = 8080;
export const AUTH_EMULATOR_URL = "http://127.0.0.1:9099";

export const isFirebaseEmulatorMode = (env = process.env) =>
  env.REACT_APP_USE_FIREBASE_EMULATOR === "true";
