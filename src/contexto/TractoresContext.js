import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { usePersonas } from "./PersonasContext";

const TractoresContext = createContext();

export function TractoresProvider({ children }) {
  const { tractores, empresas, loading } = useData();
  const { personas } = usePersonas();

  const enriquecerTractores = useMemo(() => {
    if (loading) return [];
    let listado = [];

    listado = tractores.map((tr) => {
      const empresa = empresas.find((em) => String(em.id) === String(tr.empresa) || String(em.cuit) === String(tr.empresa));
      const persona = personas.find((ps) => String(tr.persona) === String(ps.id));
      const label = `${tr.id} (${tr.dominio})`;

      return {
        ...tr,
        label: label,
        nombreEmpresa: empresa?.nombre || "-",
        nombrePersona: persona?.nombreCompleto || "-"
      };
    });

    return listado;
  }, [tractores, empresas, personas, loading]);

  return (
    <TractoresContext.Provider value={{ tractores: enriquecerTractores, loading }}>
      {children}
    </TractoresContext.Provider>
  );
}

export const useTractores = () => useContext(TractoresContext);
