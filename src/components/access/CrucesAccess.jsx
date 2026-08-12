//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_SHIP.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useCruces } from "../../contexto/CrucesContext";
import FormCruce from "../formularios/FormCruce";

const CrucesAccess = ({ filtro = null }) => {
  const { cruces } = useCruces();
  //const [texto, setTexto] = useState(<Load className="spinner" />);

  const TITLE = "CRUCES DE BARCAZA";
  const COLECCION = "cruces";
  const [formVisible, setFormVisible] = useState(false);
  const headers = columnas[COLECCION];
  const texto = "Registro de Cruces";

  const handleOpen = () => {
    setFormVisible(true);
  };

  const handleClose = () => {
    setFormVisible(false);
  };

  return (
    <>
      <Access
        coleccion={cruces}
        entity="cruces"
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        filtro={filtro}
        onClickForm={handleOpen}
        editable={false}
      />
      {formVisible && <FormCruce onClose={handleClose} />}
    </>
  );
};

export default CrucesAccess;
