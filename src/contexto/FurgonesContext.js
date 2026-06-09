import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";

const FurgonesContext = createContext();

export function FurgonesProvider({ children }) {
  const { furgones, empresas, loading } = useData();

  const enriquecerFurgones = useMemo(() => {
    if (loading) return [];
    let listado = [];

    listado = furgones.map((fg) => {
      const empresa = empresas.find((em) => String(em.id) === String(fg.empresa) || String(em.cuit) === String(fg.empresa));
      const label = `${fg.id} (${fg.dominio})`;

      return {
        ...fg,
        label: label,
        nombreEmpresa: empresa?.label || "-",
      };
    });

    return listado
  }, [furgones, empresas, loading])

  return (
    <FurgonesContext.Provider value={{ furgones: enriquecerFurgones, loading }}>
      {children}
    </FurgonesContext.Provider>
  );
}

export const useFurgones = () => useContext(FurgonesContext);
