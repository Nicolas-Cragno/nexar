//------------------------------------------------------ externos
import { useEffect, useState } from "react";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/logoPrincipal.png";
import CardLogo from "../../components/cards/CardLogo";
import Modal from "../modales/Modal";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { capitalizarTexto } from "../../functions/dataFunctions";
import { useData } from "../../contexto/DataContext";

const PersonasAccess = ({ filtro = null }) => {
  const { personas } = useData();
  const TITLE = filtro ? capitalizarTexto(filtro) : "Personas";
  const COLECCION = filtro ? filtro : "personas";
  const [modalVisible, setModalVisible] = useState(false);
  const headers = columnas[COLECCION];

  const handleOpen = () => {
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <CardLogo
        title={TITLE}
        logo={Logo}
        onClick={() => handleOpen()}
        onClose={() => handleClose()}
      />

      {modalVisible && headers.length > 0 && (
        <Modal
          title={TITLE}
          coleccion={COLECCION}
          data={personas}
          headers={headers}
          onClose={() => handleClose()}
        />
      )}
    </>
  );
};

export default PersonasAccess;
