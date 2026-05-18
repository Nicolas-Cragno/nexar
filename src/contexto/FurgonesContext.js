import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const FurgonesContext = createContext();

export function FurgonesProvider({ children }) {
  const [furgones, setFurgones] = useState([]);
  const [loadingFurgones, setLoadingFurgones] = useState(true);

  useEffect(() => {
    const ref = collection(db, "furgones");

    const unsub = onSnapshot(ref, (snap) => {
      setFurgones(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingFurgones(false);
    });

    return () => unsub();
  }, []);

  return (
    <FurgonesContext.Provider value={{ furgones, loadingFurgones }}>
      {children}
    </FurgonesContext.Provider>
  );
}

export const useFurgonesData = () => useContext(FurgonesContext);
