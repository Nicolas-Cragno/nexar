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
            const persona = cuentaCorriente.find((ps) => String(ps.id) === String(mv.persona));
            const operador = personas.find((ps) => String(ps.id) === String(mv.operador));
            const monto = formatearMonto(mv.monto);
            return {
                ...mv,
                personaCompleta: `${persona?.nombre} (${mv.persona})`,
                operadorCompleto: `${operador?.nombreCompleto} (${mv.operador})`,
                montoCompleto: `$ ${monto}`
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
