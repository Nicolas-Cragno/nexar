import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { formatearMonto } from "../functions/dataFunctions";

const PersonasContext = createContext();

export function PersonasProvider({ children }) {
  const { personas, empresas, ubicaciones, cuentaCorriente, loading } = useData();

  const enriquecerPersonas = useMemo(() => {
    if (loading) return []; // no enriquecer antes de finalizar carga original
    let listado = [];

    listado = personas.map((ps) => {
      const empresa = empresas.find((em) => String(em.id) === String(ps.empresa) || String(em.cuit) === String(ps.empresa));
      const sucursal = ubicaciones.find((ub) => String(ub.id) === String(ps.sucursal));
      const nombreCompleto = `${ps.apellido}, ${ps.nombres}`;
      const puestoCompleto = `${ps.puesto} (${ps.especializacion})`;
      const sucursalCompleta = sucursal ? `${sucursal.nombre} (${ps.sucursal})` : "-";
      const ctaCorriente = cuentaCorriente.find((ct) => ct.id === ps.cuenta);
      const labelCtaCorriente = ctaCorriente ? `$ ${formatearMonto(ctaCorriente.monto)}` : "";
      const labelEstado = ps.estado ? `ACTIVO DESDE ${ps.alta}` : ps.baja ? `DE BAJA DESDE ${ps.baja}` : "";


      return {
        ...ps,
        nombreCompleto: nombreCompleto,
        puestoCompleto: puestoCompleto,
        sucursalCompleta: sucursalCompleta,
        nombreEmpresa: empresa?.nombre || "-",
        cuentaCorriente: labelCtaCorriente,
        estadoAlta: labelEstado || ""
      };
    });

    return listado;
  }, [personas, empresas, ubicaciones, cuentaCorriente, loading]);


  return (
    <PersonasContext.Provider value={{ personas: enriquecerPersonas, loading }}>
      {children}
    </PersonasContext.Provider>
  );
}

export const usePersonas = () => useContext(PersonasContext);
