const PROJECT_ID = "demo-nexar-transcan";
const FIRESTORE_HOST = "127.0.0.1:8080";
const AUTH_HOST = "127.0.0.1:9099";

const validarDestinoEmulator = ({ projectId, firestoreHost, authHost }) => {
  if (!String(projectId).startsWith("demo-")) throw new Error("El seed exige un projectId local demo-*.");
  if (firestoreHost !== FIRESTORE_HOST) throw new Error("El seed exige Firestore Emulator en 127.0.0.1:8080.");
  if (authHost !== AUTH_HOST) throw new Error("El seed exige Auth Emulator en 127.0.0.1:9099.");
  return true;
};

module.exports = { AUTH_HOST, FIRESTORE_HOST, PROJECT_ID, validarDestinoEmulator };
