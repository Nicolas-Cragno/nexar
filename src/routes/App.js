import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Resources from "../sections/Resources";
import Actions from "../sections/Actions";
import Dashboard from "../sections/Dashboard";
import Loading from "./Loading";
import { useData } from "../contexto/DataContext";
import './css/App.css';

function App() {
  const { loading } = useData();

  if (loading) {
    return <Loading />
  }


  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/movimientos" element={<Actions />} />
          <Route path="/recursos" element={<Resources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
