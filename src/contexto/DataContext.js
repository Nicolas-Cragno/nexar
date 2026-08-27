import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

const domainCollections = [
  { name: "personas", viewPermissions: ["personasView"] },
  { name: "tractores", viewPermissions: ["flotaView"] },
  { name: "furgones", viewPermissions: ["flotaView"] },
  { name: "empresas", viewPermissions: ["empresasView"] },
  { name: "ubicaciones", authorizedRead: true },
  { name: "sectores", authorizedRead: true },
  { name: "movimientos", viewPermissions: ["movimientosView"] },
  { name: "liquidaciones", viewPermissions: ["liquidacionesView"] },
  {
    name: "cuentaCorriente",
    viewPermissions: ["movimientosView", "liquidacionesView", "adminView"],
  },
  { name: "viajes", viewPermissions: ["viajesView"] },
  { name: "cruces", viewPermissions: ["crucesView"] },
];

const counterPermissions = {
  viajes: "viajesWrite",
  movimientos: "movimientosWrite",
  liquidaciones: "liquidacionesWrite",
  cruces: "crucesWrite",
};

const allCollectionNames = [
  ...domainCollections.map(({ name }) => name),
  "contadores",
];

const emptyData = () =>
  Object.fromEntries(allCollectionNames.map((name) => [name, []]));

export function DataProvider({ children }) {
  const { isAuthenticated, permissions } = useAuth();
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);

  const readableCollections = useMemo(
    () =>
      domainCollections.filter(
        ({ authorizedRead, viewPermissions = [] }) =>
          isAuthenticated &&
          (authorizedRead ||
            permissions?.allAccess === true ||
            viewPermissions.some((permission) => permissions?.[permission] === true)),
      ),
    [isAuthenticated, permissions],
  );

  const readableCounters = useMemo(
    () =>
      Object.entries(counterPermissions)
        .filter(
          ([, permission]) =>
            isAuthenticated &&
            (permissions?.allAccess === true || permissions?.[permission] === true),
        )
        .map(([counter]) => counter),
    [isAuthenticated, permissions],
  );

  useEffect(() => {
    const unsubscribers = [];
    const initialData = emptyData();
    const pendingSources = new Set([
      ...readableCollections.map(({ name }) => `collection:${name}`),
      ...readableCounters.map((counter) => `counter:${counter}`),
    ]);
    const counterDocuments = new Map();

    setData(initialData);
    setLoading(pendingSources.size > 0);

    const markSourceReady = (source) => {
      pendingSources.delete(source);
      if (pendingSources.size === 0) setLoading(false);
    };

    const handleListenerError = (source, error) => {
      console.error(`[Firestore] No se pudo leer ${source}:`, error);
      markSourceReady(source);
    };

    readableCollections.forEach(({ name }) => {
      const source = `collection:${name}`;
      const unsubscribe = onSnapshot(
        collection(db, name),
        (snapshot) => {
          setData((previous) => ({
            ...previous,
            [name]: snapshot.docs.map((item) => ({
              id: item.id,
              ...item.data(),
            })),
          }));
          markSourceReady(source);
        },
        (error) => handleListenerError(source, error),
      );

      unsubscribers.push(unsubscribe);
    });

    readableCounters.forEach((counter) => {
      const source = `counter:${counter}`;
      const unsubscribe = onSnapshot(
        doc(db, "contadores", counter),
        (snapshot) => {
          if (snapshot.exists()) {
            counterDocuments.set(counter, {
              id: snapshot.id,
              ...snapshot.data(),
            });
          } else {
            counterDocuments.delete(counter);
          }

          setData((previous) => ({
            ...previous,
            contadores: Array.from(counterDocuments.values()),
          }));
          markSourceReady(source);
        },
        (error) => handleListenerError(source, error),
      );

      unsubscribers.push(unsubscribe);
    });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [readableCollections, readableCounters]);

  return (
    <DataContext.Provider value={{ ...data, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
