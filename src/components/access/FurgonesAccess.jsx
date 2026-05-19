//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/logoPrincipal.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../modales/data/Columnas";
import { useData } from "../../contexto/DataContext";

const FurgonesAccess = () => {
  const { furgones } = useData();
  const [texto, setTexto] = useState(<Load className="spinner" />);

  useEffect(() => {
    if (furgones) {
      const cantidadPersonas = furgones ? Object.keys(furgones).length : 0;
      const text = `${cantidadPersonas} ${cantidadPersonas > 1 ? "activos" : cantidadPersonas === 1 ? "activo" : null}`;
      setTexto(text);
    }
  }, [furgones]);

  const TITLE = "Furgones";
  const COLECCION = "furgones";
  const headers = columnas[COLECCION];

  return (
    <Access
      coleccion={furgones}
      title={TITLE}
      logo={Logo}
      headers={headers}
      text={texto}
    />
  );
};

export default FurgonesAccess;
