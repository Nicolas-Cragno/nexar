const test = require("node:test");
const assert = require("node:assert/strict");
const { AUTH_HOST, FIRESTORE_HOST, PROJECT_ID, validarDestinoEmulator } = require("./seedConfig");

test("acepta exclusivamente el destino local configurado", () => {
  assert.equal(validarDestinoEmulator({ projectId: PROJECT_ID, firestoreHost: FIRESTORE_HOST, authHost: AUTH_HOST }), true);
});

test("rechaza proyectos cloud y hosts no locales", () => {
  assert.throws(() => validarDestinoEmulator({ projectId: "nexar-transcan", firestoreHost: FIRESTORE_HOST, authHost: AUTH_HOST }));
  assert.throws(() => validarDestinoEmulator({ projectId: PROJECT_ID, firestoreHost: "firestore.googleapis.com", authHost: AUTH_HOST }));
  assert.throws(() => validarDestinoEmulator({ projectId: PROJECT_ID, firestoreHost: FIRESTORE_HOST, authHost: "identitytoolkit.googleapis.com" }));
});
