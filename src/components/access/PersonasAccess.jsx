//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_PERSONS.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { capitalizarTexto } from "../../functions/dataFunctions";
import { usePersonas } from "../../contexto/PersonasContext";
import FormPersona from "../formularios/FormPersona";

const PersonasAccess = ({ filtro = null }) => {
  const { personas } = usePersonas();
  const [texto, setTexto] = useState(<Load className="spinner" />);

  useEffect(() => {
    if (personas) {
      const cantidadPersonas = personas ? Object.keys(personas).length : 0;
      const text = `${cantidadPersonas} ${cantidadPersonas > 1 ? "activas" : cantidadPersonas === 1 ? "activa" : null}`;
      setTexto(text);
    }
  }, [personas]);

  const TITLE = filtro ? capitalizarTexto(filtro) : "Personas";
  const COLECCION = filtro ? filtro : "personas";
  const [formVisible, setFormVisible] = useState(false);
  const headers = columnas[COLECCION];

  const handleOpen = () => {
    setFormVisible(true);
  };

  const handleClose = () => {
    setFormVisible(false);
  };

  return (
    <>
      <Access
        coleccion={personas}
        entity="personas"
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        filtro={filtro}
        onClickForm={handleOpen}
      />
      {formVisible && <FormPersona onClose={handleClose} />}
    </>
  );
};

export default PersonasAccess;
