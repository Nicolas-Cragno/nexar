import { createContext, useContext, useMemo } from "react";
import { useData } from "./DataContext";
import { usePersonas } from "./PersonasContext";
import { useTractores } from "./TractoresContext";
import { useFurgones } from "./FurgonesContext";

const CrucesContext = createContext();

export function CrucesProvider({ children }) {
    const { cruces, viajes, loading } = useData();
    const { tractores } = useTractores();
    const { furgones } = useFurgones();
    const { personas } = usePersonas();

    const enriquecerCruces = useMemo(() => {
        if (loading) return [];
        let listado = [];

        listado = cruces.map((cr) => {
            const viaje = viajes.find((vj) => String(cr.viaje) === String(vj.id));
            const persona = personas.find((ps) => String(cr.persona) === String(ps.id));
            const tractor = tractores.find((tr) => String(cr.tractor) === String(tr.id));
            const idsFurgones = Array.isArray(cr.furgon)
                ? cr.furgon
                : cr.furgon
                    ? [cr.furgon]
                    : [];
            const furgonesCruce = furgones.filter((fg) =>
                idsFurgones.some((id) => String(id) === String(fg.id))
            );
            //const personaLabel = persona?.nombreCompleto;
            const cruceLabel = `${cr.viaje} ${cr.fecha}`;

            return {
                ...cr,
                viajeCompleto: viaje?.label || "-",
                personaCompleta: persona?.label || "-",
                tractorCompleto: tractor?.label || "-",
                furgonCompleto: furgonesCruce.map((fg) => fg.label).join(", ") || "-",
                furgonesCompletos: furgonesCruce,
                label: cruceLabel
            };
        });

        return listado.sort((a, b) => b.fecha - a.fecha);
    }, [cruces, viajes, tractores, furgones, personas, loading]);

    return (
        <CrucesContext.Provider value={{ cruces: enriquecerCruces, loading }}>
            {children}
        </CrucesContext.Provider>
    );
}

export const useCruces = () => useContext(CrucesContext);
