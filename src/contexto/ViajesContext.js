import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { usePersonas } from "./PersonasContext";
import { useTractores } from "./TractoresContext";
import { useFurgones } from "./FurgonesContext";

const ViajesContext = createContext();

export function ViajesProvider({ children }) {
    const { viajes, empresas, loading } = useData();
    const { tractores } = useTractores();
    const { furgones } = useFurgones();
    const { personas } = usePersonas();

    const enriquecerViajes = useMemo(() => {
        if (loading) return [];
        let listado = [];

        listado = viajes.map((vj) => {
            const cliente = empresas.find((em) => String(em.id) === String(vj.empresa) || String(em.cuit) === String(vj.empresa));
            const persona = personas.find((ps) => String(vj.persona) === String(ps.id));
            const tractor = tractores.find((tr) => String(vj.tractor) === String(tr.id));
            const furgon = furgones.find((fg) => String(fg.furgon) === String(fg.id));
            const personaLabel = persona?.nombreCompleto;
            const label = `${vj.id} ${personaLabel} (${vj.tractor} ${vj.furgon ? " / " + vj.furgon : ""})`;

            return {
                ...vj,
                label: label,
                personaCompleta: personaLabel || "-",
                tractorCompleto: tractor?.label || "-",
                furgonCompleto: furgon?.label || "-",
                clienteCompleto: cliente?.label || "-"
            };
        });

        return listado;
    }, [viajes, tractores, furgones, empresas, personas, loading]);

    return (
        <ViajesContext.Provider value={{ viajes: enriquecerViajes, loading }}>
            {children}
        </ViajesContext.Provider>
    );
}

export const useViajes = () => useContext(ViajesContext);
