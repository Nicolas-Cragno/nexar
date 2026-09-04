import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { formatearMonto } from "../functions/dataFunctions";
import { usePersonas } from "./PersonasContext";

const LiquidacionesContext = createContext();

export function LiquidacionesProvider({ children }) {
    const { liquidaciones, cuentaCorriente, loading } = useData();
    const { personas } = usePersonas();

    const enriquecerLiquidacion = useMemo(() => {
        if (loading) return []; // no enriquecer antes de finalizar carga original
        let listado = [];

        listado = liquidaciones.map((liquidacion) => {
            const cuentaId = liquidacion.cuenta || liquidacion.persona;
            const cuenta = cuentaCorriente.find((ct) => String(ct.id) === String(cuentaId)) || personas.find((ps) => String(ps.id) === String(cuentaId));
            const operador = personas.find((ps) => String(ps.id) === String(liquidacion.operador));
            const saldo = formatearMonto(liquidacion.monto);
            const cantidadMovimientos = liquidacion.movimientos?.length || 0;
            const liquidacionLabel = `${liquidacion.id} ($${saldo} | ${cuenta?.label || cuentaId})${liquidacion.anulado === true ? " | ANULADA" : ""}`;
            return {
                ...liquidacion,
                cuentaCompleta: cuenta?.nombre || cuentaId || "",
                personaCompleta: cuenta?.nombre || cuentaId || "",
                operadorCompleto: operador?.label || "",
                saldoCompleto: `$ ${saldo}`,
                montoCompleto: `$ ${saldo}`,
                cantidadMovimientos,
                tipoCierreCompleto: liquidacion.tipoCierre || "SIN MOVIMIENTO",
                estadoLabel: liquidacion.anulado === true ? "ANULADA" : "VIGENTE",
                label: liquidacionLabel
            };
        }).sort((a, b) => {
            const fechaA = a.fecha?.toDate?.() || 0;
            const fechaB = b.fecha?.toDate?.() || 0;

            return fechaB - fechaA;
        });

        return listado;
    }, [liquidaciones, cuentaCorriente, personas, loading]);


    return (
        <LiquidacionesContext.Provider value={{ liquidaciones: enriquecerLiquidacion, loading }}>
            {children}
        </LiquidacionesContext.Provider>
    );
}

export const useLiquidaciones = () => useContext(LiquidacionesContext);
