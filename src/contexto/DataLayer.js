import { PersonasProvider } from "./PersonasContext";
import { FurgonesProvider } from "./FurgonesContext";
import { TractoresProvider } from "./TractoresContext";
import { EmpresasProvider } from "./EmpresasContext";
import { MovimientosProvider } from "./MovimientosContext";
import { DataProvider } from "./DataContext";


const DataLayer = ({ children }) => {
    return (
        <DataProvider>
            <EmpresasProvider>
                <PersonasProvider>
                    <TractoresProvider>
                        <FurgonesProvider>
                            <MovimientosProvider>
                                {children}
                            </MovimientosProvider>
                        </FurgonesProvider>
                    </TractoresProvider>
                </PersonasProvider>
            </EmpresasProvider>
        </DataProvider>
    )
}

export default DataLayer;