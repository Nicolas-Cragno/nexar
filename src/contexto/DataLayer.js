import { PersonasProvider } from "./PersonasContext";
import { FurgonesProvider } from "./FurgonesContext";
import { TractoresProvider } from "./TractoresContext";
import { DataProvider } from "./DataContext";


const DataLayer = ({ children }) => {
    return (
        <DataProvider>
            <PersonasProvider>
            <TractoresProvider>
                <FurgonesProvider>
                    { children }
                </FurgonesProvider>
            </TractoresProvider>
        </PersonasProvider>
        </DataProvider>
    )
}

export default DataLayer;