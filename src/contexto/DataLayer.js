import { PersonasProvider } from "./PersonasContext";
import { FurgonesProvider } from "./FurgonesContext";
import { TractoresProvider } from "./TractoresContext";
import { EmpresasProvider } from "./EmpresasContext";
import { MovimientosProvider } from "./MovimientosContext";
import { ViajesProvider } from "./ViajesContext";
import { DataProvider } from "./DataContext";


const DataLayer = ({ children }) => {
    return (
        <DataProvider>
            <EmpresasProvider>
                <PersonasProvider>
                    <TractoresProvider>
                        <FurgonesProvider>
                            <MovimientosProvider>
                                <ViajesProvider>
                                    {children}
                                </ViajesProvider>
                            </MovimientosProvider>
                        </FurgonesProvider>
                    </TractoresProvider>
                </PersonasProvider>
            </EmpresasProvider>
        </DataProvider>
    )
}

export default DataLayer;