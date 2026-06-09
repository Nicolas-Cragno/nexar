import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { usePersonas } from "./PersonasContext";
import { useTractores } from "./TractoresContext";
import { useFurgones } from "./FurgonesContext";
import { useEmpresas } from "./EmpresasContext";
import { useMovimientos } from "./MovimientosContext";

const ViajesContext = createContext();

export function ViajesProvider({ children }) {
    const { viajes, cruces, loading } = useData();
    const { movimientos } = useMovimientos();
    const { empresas } = useEmpresas();
    const { tractores } = useTractores();
    const { furgones } = useFurgones();
    const { personas } = usePersonas();

    const enriquecerViajes = useMemo(() => {
        if (loading) return [];
        let listado = [];

        listado = viajes.map((vj) => {
            const persona = personas.find((ps) => String(vj.persona) === String(ps.id));
            const tractor = tractores.find((tr) => String(vj.tractor) === String(tr.id));
            const personaLabel = persona?.nombreCompleto;
            const label = `${vj.id} | ${personaLabel} (TR: ${vj.tractor}${vj.furgon ? " / FG: " + vj.furgon : ""})`;
            const adelantos = movimientos.filter((mv) => String(mv.viaje) === String(vj.id));
            const cruceBarcaza = cruces.filter((cc) => String(cc.viaje) === String(vj.id));
            // arrays
            const clientes = empresas.filter((em) =>
                (vj.cliente || []).some(
                    (id) =>
                        String(id) === String(em.id) ||
                        String(id) === String(em.cuit)
                )
            );
            const furgon = furgones.filter((fg) =>
                vj.furgon?.some((id) => String(id) === String(fg.id))
            );
            const clientesLabel =
                clientes.map((c) => c.label).join(", ") || "-";

            const furgonesLabel =
                furgon.map((f) => f.label).join(", ") || "-";
            return {
                ...vj,
                label: label,
                personaCompleta: persona?.label,
                tractorCompleto: tractor?.label || "-",
                furgonCompleto: furgonesLabel,
                clienteCompleto: clientesLabel,
                adelantosRegistrados: adelantos || [],
                crucesRegistrados: cruceBarcaza || []
            };
        });

        return listado;
    }, [viajes, cruces, movimientos, tractores, furgones, empresas, personas, loading]);

    return (
        <ViajesContext.Provider value={{ viajes: enriquecerViajes, loading }}>
            {children}
        </ViajesContext.Provider>
    );
}

export const useViajes = () => useContext(ViajesContext);
