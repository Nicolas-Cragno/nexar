//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_PRINCIPAL.png";
import CardLogoText from "../../components/cards/CardLogoText";
import Modal from "../modales/Modal";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { capitalizarTexto } from "../../functions/dataFunctions";
import { useData } from "../../contexto/DataContext";

const Access = ({
  coleccion,
  title,
  logo = Logo,
  headers,
  text = "",
  filtro = null,
  onClickForm = null,
  editable = true,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpen = () => {
    setModalVisible(true);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <CardLogoText
        title={title}
        text={text}
        logo={logo}
        onClick={() => handleOpen()}
        onClick2={onClickForm}
        onClose={() => handleClose()}
      />

      {modalVisible && headers?.length > 0 && (
        <Modal
          title={title}
          tipo={coleccion}
          coleccion={title}
          data={coleccion}
          headers={headers}
          onClose={() => handleClose()}
          editable={editable}
        />
      )}

      {}
    </>
  );
};

export default Access;
