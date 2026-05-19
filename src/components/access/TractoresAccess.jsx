//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/logoPrincipal.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useData } from "../../contexto/DataContext";

const TractoresAccess = () => {
  const { tractores } = useData();
  const [texto, setTexto] = useState(<Load className="spinner" />);

  useEffect(() => {
    if (tractores) {
      const cantidadPersonas = tractores ? Object.keys(tractores).length : 0;
      const text = `${cantidadPersonas} ${cantidadPersonas > 1 ? "activos" : cantidadPersonas === 1 ? "activo" : null}`;
      setTexto(text);
    }
  }, [tractores]);

  const TITLE = "Tractores";
  const COLECCION = "tractores";
  const headers = columnas[COLECCION];

  return (
    <Access
      coleccion={tractores}
      title={TITLE}
      logo={Logo}
      headers={headers}
      text={texto}
    />
  );
};

export default TractoresAccess;
