//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/logoPrincipal.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useViajes } from "../../contexto/ViajesContext";
import FormViaje from "../formularios/FormViaje";

const ViajesAccess = ({ filtro = null }) => {
  const { viajes } = useViajes();
  //const [texto, setTexto] = useState(<Load className="spinner" />);

  const TITLE = "Viajes";
  const COLECCION = "viajes";
  const [formVisible, setFormVisible] = useState(false);
  const headers = columnas[COLECCION];
  const texto = "VIAJES";

  const handleOpen = () => {
    setFormVisible(true);
  };

  const handleClose = () => {
    setFormVisible(false);
  };

  return (
    <>
      <Access
        coleccion={viajes}
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        filtro={filtro}
        onClickForm={handleOpen}
      />
      {formVisible && <FormViaje onClose={handleClose} />}
    </>
  );
};

export default ViajesAccess;
