import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";

const PersonasContext = createContext();

export function PersonasProvider({ children }) {
  const { personas, empresas, ubicaciones, loading } = useData();

  const enriquecerPersonas = useMemo(() => {
    if (loading) return []; // no enriquecer antes de finalizar carga original
    let listado = [];

    listado = personas.map((ps) => {
      const empresa = empresas.find((em) => String(em.id) === String(ps.empresa) || String(em.cuit) === String(ps.empresa));
      const sucursal = ubicaciones.find((ub) => String(ub.id) === String(ps.sucursal));
      const nombreCompleto = `${ps.apellido}, ${ps.nombres}`;
      const puestoCompleto = `${ps.puesto} (${ps.especializacion})`;
      const sucursalCompleta = sucursal ? `${sucursal.nombre} (${ps.sucursal})` : "-";

      return {
        ...ps,
        nombreCompleto: nombreCompleto,
        puestoCompleto: puestoCompleto,
        sucursalCompleta: sucursalCompleta,
        nombreEmpresa: empresa?.nombre || "-",
      };
    });

    return listado;
  }, [personas, empresas, ubicaciones, loading]);


  return (
    <PersonasContext.Provider value={{ personas: enriquecerPersonas, loading }}>
      {children}
    </PersonasContext.Provider>
  );
}

export const usePersonas = () => useContext(PersonasContext);
