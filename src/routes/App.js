import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import DataLayer from "../contexto/DataLayer";
import { useData } from "../contexto/DataContext";
import Layout from "../components/layout/Layout";
import Resources from "../sections/Resources";
import Actions from "../sections/Actions";
import Dashboard from "../sections/Dashboard";
import Cuentas from "../sections/Cuentas";
import Login from "./Login";
import Loading from "./Loading";
import ProtectedRoute from "./ProtectedRoute";
import './css/App.css';

const DataLayerContent = () => {
  const { loading } = useData();

  return loading ? <Loading /> : <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><DataLayer><DataLayerContent /></DataLayer></ProtectedRoute>}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/operaciones" element={<Actions />} />
            <Route path="/cuentas" element={<Cuentas />} />
            <Route path="/recursos" element={<Resources />} />
            <Route path="/movimientos" element={<Navigate to="/operaciones" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
