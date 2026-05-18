import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const PersonasContext = createContext();

export function PersonasProvider({ children }) {
  const [personas, setPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);

  useEffect(() => {
    const ref = collection(db, "personas");

    const unsub = onSnapshot(ref, (snap) => {
      setPersonas(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingPersonas(false);
    });

    return () => unsub();
  }, []);

  return (
    <PersonasContext.Provider value={{ personas, loadingPersonas }}>
      {children}
    </PersonasContext.Provider>
  );
}

export const usePersonasData = () => useContext(PersonasContext);
