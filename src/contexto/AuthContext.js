import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";

const AuthContext = createContext(null);

const UNAUTHORIZED_MESSAGE = "Usuario no autorizado";
const CONNECTION_MESSAGE = "No se pudo conectar. Intentá nuevamente.";
const ROLE_REVALIDATION_ATTEMPTS = 3;
const ROLE_REVALIDATION_DELAY = 250;

const emptyAuthorization = {
  firebaseUser: null,
  fullUser: null,
  access: null,
  role: null,
  permissions: null,
};

const wait = (milliseconds) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const normalizeEmail = (email) => String(email).trim().toLowerCase();

const loginErrorMessages = {
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/invalid-email": "Ingresá un email válido.",
  "auth/user-disabled": "Este usuario se encuentra deshabilitado.",
  "auth/too-many-requests":
    "Demasiados intentos. Esperá unos minutos antes de volver a ingresar.",
  "auth/network-request-failed": CONNECTION_MESSAGE,
};

class AuthorizationError extends Error {
  constructor(message = UNAUTHORIZED_MESSAGE, { explicitRevocation = false } = {}) {
    super(message);
    this.name = "AuthorizationError";
    this.explicitRevocation = explicitRevocation;
  }
}

const readAuthorization = async (authUser) => {
  const accessSnapshot = await getDoc(doc(db, "accesosUsuarios", authUser.uid));

  if (!accessSnapshot.exists()) {
    throw new AuthorizationError();
  }

  const access = accessSnapshot.data();
  if (access.estado === false) {
    throw new AuthorizationError(UNAUTHORIZED_MESSAGE, {
      explicitRevocation: true,
    });
  }

  if (
    access.estado !== true ||
    accessSnapshot.id !== authUser.uid ||
    access.uid !== authUser.uid ||
    !access.usuarioId
  ) {
    throw new AuthorizationError();
  }

  const userSnapshot = await getDoc(doc(db, "usuarios", access.usuarioId));
  if (!userSnapshot.exists()) {
    throw new AuthorizationError();
  }

  const fullUser = userSnapshot.data();
  if (fullUser.estado === false) {
    throw new AuthorizationError(UNAUTHORIZED_MESSAGE, {
      explicitRevocation: true,
    });
  }

  if (
    fullUser.estado !== true ||
    fullUser.uid !== authUser.uid ||
    fullUser.id !== access.usuarioId ||
    fullUser.tipo !== access.tipo ||
    normalizeEmail(authUser.email) !== normalizeEmail(fullUser.mail)
  ) {
    throw new AuthorizationError();
  }

  const [roleSnapshot, permissionsSnapshot] = await Promise.all([
    getDoc(doc(db, "roles", fullUser.tipo)),
    getDoc(doc(db, "permisosRoles", fullUser.tipo)),
  ]);

  if (!roleSnapshot.exists() || !permissionsSnapshot.exists()) {
    throw new AuthorizationError();
  }

  const role = roleSnapshot.data();
  const permissions = permissionsSnapshot.data();

  if (
    role.estado !== true ||
    permissions.estado !== true ||
    roleSnapshot.id !== fullUser.tipo ||
    role.id !== fullUser.tipo
  ) {
    throw new AuthorizationError();
  }

  return { firebaseUser: authUser, fullUser, access, role, permissions };
};

export function AuthProvider({ children }) {
  const [authorization, setAuthorization] = useState(emptyAuthorization);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState("");
  const listenerCleanupRef = useRef(() => {});
  const validationVersionRef = useRef(0);
  const mountedRef = useRef(true);

  const stopAuthorizationListeners = useCallback(() => {
    listenerCleanupRef.current();
    listenerCleanupRef.current = () => {};
  }, []);

  const clearAuthorization = useCallback(() => {
    validationVersionRef.current += 1;
    stopAuthorizationListeners();
    setAuthorization(emptyAuthorization);
  }, [stopAuthorizationListeners]);

  const rejectAuthorization = useCallback(
    async (message = UNAUTHORIZED_MESSAGE) => {
      clearAuthorization();
      setAuthMessage(message);
      setLoading(false);

      try {
        await signOut(auth);
      } catch (error) {
        console.error("[Auth] No se pudo cerrar la sesión rechazada:", error);
      }
    },
    [clearAuthorization],
  );

  const installAuthorizationListeners = useCallback(
    (authUser, userId, revalidate) => {
      stopAuthorizationListeners();

      let accessInitialSnapshot = true;
      let userInitialSnapshot = true;

      const handleSnapshot = (kind, snapshot) => {
        if (!snapshot.exists() || snapshot.data().estado === false) {
          rejectAuthorization();
          return;
        }

        if (
          (kind === "access" && accessInitialSnapshot) ||
          (kind === "user" && userInitialSnapshot)
        ) {
          if (kind === "access") accessInitialSnapshot = false;
          if (kind === "user") userInitialSnapshot = false;
          return;
        }

        revalidate(authUser);
      };

      const handleListenerError = (error) => {
        console.error("[Auth] Error en listener de autorización:", error);
        rejectAuthorization(CONNECTION_MESSAGE);
      };

      const unsubscribeAccess = onSnapshot(
        doc(db, "accesosUsuarios", authUser.uid),
        (snapshot) => handleSnapshot("access", snapshot),
        handleListenerError,
      );
      const unsubscribeUser = onSnapshot(
        doc(db, "usuarios", userId),
        (snapshot) => handleSnapshot("user", snapshot),
        handleListenerError,
      );

      listenerCleanupRef.current = () => {
        unsubscribeAccess();
        unsubscribeUser();
      };
    },
    [rejectAuthorization, stopAuthorizationListeners],
  );

  const validateUser = useCallback(
    async (authUser, { retryInconsistency = false } = {}) => {
      const validationVersion = ++validationVersionRef.current;
      stopAuthorizationListeners();
      setLoading(true);
      setAuthorization(emptyAuthorization);

      const attempts = retryInconsistency ? ROLE_REVALIDATION_ATTEMPTS : 1;
      let lastError;

      for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
          const nextAuthorization = await readAuthorization(authUser);

          if (
            !mountedRef.current ||
            validationVersion !== validationVersionRef.current
          ) {
            return;
          }

          setAuthorization(nextAuthorization);
          setAuthMessage("");
          setLoading(false);
          installAuthorizationListeners(
            authUser,
            nextAuthorization.access.usuarioId,
            (currentUser) =>
              validateUser(currentUser, { retryInconsistency: true }),
          );
          return;
        } catch (error) {
          lastError = error;

          if (error instanceof AuthorizationError && error.explicitRevocation) {
            break;
          }

          if (attempt < attempts - 1) {
            await wait(ROLE_REVALIDATION_DELAY);
          }
        }
      }

      if (
        !mountedRef.current ||
        validationVersion !== validationVersionRef.current
      ) {
        return;
      }

      if (!(lastError instanceof AuthorizationError)) {
        console.error("[Auth] Error al validar autorización:", lastError);
      }

      await rejectAuthorization(
        lastError instanceof AuthorizationError
          ? UNAUTHORIZED_MESSAGE
          : CONNECTION_MESSAGE,
      );
    },
    [installAuthorizationListeners, rejectAuthorization, stopAuthorizationListeners],
  );

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      if (!authUser) {
        clearAuthorization();
        setLoading(false);
        return;
      }

      validateUser(authUser);
    });

    return () => {
      mountedRef.current = false;
      unsubscribeAuth();
      stopAuthorizationListeners();
    };
  }, [clearAuthorization, stopAuthorizationListeners, validateUser]);

  const login = useCallback(async (email, password) => {
    setAuthMessage("");

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      const message = loginErrorMessages[error.code] || CONNECTION_MESSAGE;
      setAuthMessage(message);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthMessage("");
    clearAuthorization();
    setLoading(false);

    try {
      await signOut(auth);
    } catch (error) {
      console.error("[Auth] No se pudo cerrar la sesión:", error);
      setAuthMessage(CONNECTION_MESSAGE);
    }
  }, [clearAuthorization]);

  const isAuthenticated =
    !loading &&
    Boolean(
      authorization.firebaseUser &&
        authorization.fullUser &&
        authorization.access &&
        authorization.role &&
        authorization.permissions,
    );

  const value = useMemo(
    () => ({
      ...authorization,
      loading,
      isAuthenticated,
      authMessage,
      login,
      logout,
    }),
    [authorization, authMessage, isAuthenticated, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider");
  }

  return context;
};
