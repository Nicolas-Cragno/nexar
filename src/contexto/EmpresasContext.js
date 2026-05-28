import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { formatearMonto } from "../functions/dataFunctions";

const EmpresasContext = createContext();

export function EmpresasProvider({ children }) {
    const { empresas, cuentaCorriente, loading } = useData();

    const enriquecerEmpresa = useMemo(() => {
        if (loading) return []; // no enriquecer antes de finalizar carga original
        let listado = [];

        listado = empresas.map((em) => {
            const ctaCorriente = cuentaCorriente.find((ct) => ct.id === em.id);
            const labelCtaCorriente = ctaCorriente ? `$ ${formatearMonto(ctaCorriente.monto)}` : "";

            return {
                ...em,
                cuentaCorriente: labelCtaCorriente,
            };
        });

        return listado;
    }, [empresas, cuentaCorriente, loading]);


    return (
        <EmpresasContext.Provider value={{ empresas: enriquecerEmpresa, loading }}>
            {children}
        </EmpresasContext.Provider>
    );
}

export const useEmpresas = () => useContext(EmpresasContext);
