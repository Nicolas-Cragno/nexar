import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { formatearMonto } from "../functions/dataFunctions";
import { usePersonas } from "./PersonasContext";

const MovimientosContext = createContext();

export function MovimientosProvider({ children }) {
    const { movimientos, cuentaCorriente, loading } = useData();
    const { personas } = usePersonas();

    const enriquecerMovimiento = useMemo(() => {
        if (loading) return []; // no enriquecer antes de finalizar carga original
        let listado = [];

        listado = movimientos.map((mv) => {
            const cuentaId = mv.cuenta || mv.persona;
            const persona = cuentaCorriente.find((ps) => String(ps.id) === String(cuentaId)) || personas.find((ps) => String(ps.id) === String(cuentaId));
            const operador = personas.find((ps) => String(ps.id) === String(mv.operador));
            const monto = formatearMonto(Number(mv.monto));
            const movimientoLabel = `${mv.id} ($${monto} | ${persona?.label})${mv.anulado === true ? " | ANULADO" : ""}`;
            return {
                ...mv,
                personaCompleta: persona?.nombre || "",
                operadorCompleto: operador?.label || "",
                montoCompleto: `$ ${monto}`,
                estadoLabel: mv.anulado === true ? "ANULADO" : mv.estado === true ? "LIQUIDADO" : "PENDIENTE",
                label: movimientoLabel
            };
        }).sort((a, b) => {
            const fechaA = a.fecha?.toDate?.() || 0;
            const fechaB = b.fecha?.toDate?.() || 0;

            return fechaB - fechaA;
        });

        return listado;
    }, [movimientos, cuentaCorriente, personas, loading]);


    return (
        <MovimientosContext.Provider value={{ movimientos: enriquecerMovimiento, loading }}>
            {children}
        </MovimientosContext.Provider>
    );
}

export const useMovimientos = () => useContext(MovimientosContext);
