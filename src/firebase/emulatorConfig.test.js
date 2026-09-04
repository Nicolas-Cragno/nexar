import {
  AUTH_EMULATOR_URL,
  EMULATOR_PROJECT_ID,
  FIRESTORE_EMULATOR_HOST,
  FIRESTORE_EMULATOR_PORT,
  isFirebaseEmulatorMode,
} from "./emulatorConfig";

test("activa el modo emulator solamente con el valor explícito true", () => {
  expect(isFirebaseEmulatorMode({ REACT_APP_USE_FIREBASE_EMULATOR: "true" })).toBe(true);
  expect(isFirebaseEmulatorMode({ REACT_APP_USE_FIREBASE_EMULATOR: "false" })).toBe(false);
  expect(isFirebaseEmulatorMode({})).toBe(false);
});

test("usa exclusivamente endpoints locales y un proyecto demo", () => {
  expect(EMULATOR_PROJECT_ID).toMatch(/^demo-/);
  expect(FIRESTORE_EMULATOR_HOST).toBe("127.0.0.1");
  expect(FIRESTORE_EMULATOR_PORT).toBe(8080);
  expect(AUTH_EMULATOR_URL).toBe("http://127.0.0.1:9099");
});
