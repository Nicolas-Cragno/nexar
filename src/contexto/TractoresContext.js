import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const TractoresContext = createContext();

export function TractoresProvider({ children }) {
  const [tractores, setTractores] = useState([]);
  const [loadingTractores, setLoadingTractores] = useState(true);

  useEffect(() => {
    const ref = collection(db, "tractores");

    const unsub = onSnapshot(ref, (snap) => {
      setTractores(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingTractores(false);
    });

    return () => unsub();
  }, []);

  return (
    <TractoresContext.Provider value={{ tractores, loadingTractores }}>
      {children}
    </TractoresContext.Provider>
  );
}

export const useTractoresData = () => useContext(TractoresContext);
