import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Resources from "../sections/Resources";
import Actions from "../sections/Actions";
import Dashboard from "../sections/Dashboard";
import DataLayer from "../contexto/DataLayer";
import './css/App.css';

function App() {
  return (
    <DataLayer>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/movimientos" element={<Actions />} />
            <Route path="/recursos" element={<Resources />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataLayer>
  );
}

export default App;
