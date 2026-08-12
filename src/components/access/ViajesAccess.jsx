//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_ROUTE.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useViajes } from "../../contexto/ViajesContext";
import FormViaje from "../formularios/FormViaje";

const ViajesAccess = ({ filtro = null }) => {
  const { viajes } = useViajes();
  //const [texto, setTexto] = useState(<Load className="spinner" />);

  const TITLE = "VIAJES";
  const COLECCION = "viajes";
  const [formVisible, setFormVisible] = useState(false);
  const headers = columnas[COLECCION];
  const texto = "Registro de Viajes";

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
        entity="viajes"
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        filtro={filtro}
        onClickForm={handleOpen}
        editable={false}
      />
      {formVisible && <FormViaje onClose={handleClose} />}
    </>
  );
};

export default ViajesAccess;
