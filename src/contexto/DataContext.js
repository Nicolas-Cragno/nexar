import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";

const DataContext = createContext();

const colecciones = [
    "personas",
    "tractores",
    "furgones",
    "empresas",
    "ubicaciones",
    "sectores",
    "movimientos",
    "cuentaCorriente",
    "viajes",
];

let contador = 0;

export function DataProvider({ children }) {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubs = [];

        colecciones.forEach((nombreColeccion) => {
            const ref = collection(db, nombreColeccion);

            console.log("[Firestore] Iniciando carga ...");

            const unsub = onSnapshot(ref, (snapshot) => {
                setData((prev) => {
                    const newData = {
                        ...prev,
                        [nombreColeccion]: snapshot.docs.map((dt) => ({
                            id: dt.id,
                            ...dt.data(), // trae TODO lo que tenga esa preview
                        })),
                    };

                    if (Object.keys(newData).length === colecciones.length) {
                        setLoading(false);
                    };

                    console.log(" → " + nombreColeccion + "✓ - " + nombreColeccion.length + " registros.")
                    contador++;
                    return newData;
                });
            });

            unsubs.push(unsub);
        });

        return () => unsubs.forEach((fn) => fn());
    }, []);

    return (
        <DataContext.Provider value={{ ...data, loading }}>
            {children}
        </DataContext.Provider>
    )
}

console.log(
    `[Firestore] Carga Finalizada (${contador}/${colecciones.length
    } coleccion${colecciones.length !== 1 ? "es" : ""}) ✓✓`
);

export const useData = () => useContext(DataContext);