import { PersonasProvider } from "./PersonasContext";
import { FurgonesProvider } from "./FurgonesContext";
import { TractoresProvider } from "./TractoresContext";
import { EmpresasProvider } from "./EmpresasContext";
import { MovimientosProvider } from "./MovimientosContext";
import { LiquidacionesProvider } from "./LiquidacionesContext";
import { ViajesProvider } from "./ViajesContext";
import { CrucesProvider } from "./CrucesContext";
import { DataProvider } from "./DataContext";


const DataLayer = ({ children }) => {
    return (
        <DataProvider>
            <EmpresasProvider>
                <PersonasProvider>
                    <TractoresProvider>
                        <FurgonesProvider>
                            <MovimientosProvider>
                                <LiquidacionesProvider>

                                    <CrucesProvider>
                                        <ViajesProvider>
                                            {children}
                                        </ViajesProvider>
                                    </CrucesProvider>
                                </LiquidacionesProvider>
                            </MovimientosProvider>
                        </FurgonesProvider>
                    </TractoresProvider>
                </PersonasProvider>
            </EmpresasProvider>
        </DataProvider>
    )
}

export default DataLayer;