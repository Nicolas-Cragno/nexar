//------------------------------------------------------ externos
import { useEffect, useState } from "react";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/logoPrincipal.png";
import CardLogo from "../cards/CardLogo";
import Modal from "../modales/Modal";
//------------------------------------------------------ funciones
import { columnas } from "../modales/data/Columnas";
import { useData } from "../../contexto/DataContext";

const FurgonesAccess = () => {
  const { furgones } = useData();
  const TITLE = "Furgones";
  const COLECCION = "furgones";
  const [modalVisible, setModalVisible] = useState(false);
  const headers = columnas[COLECCION];

  return (
    <>
      <CardLogo
        title={TITLE}
        logo={Logo}
        onClick={() => setModalVisible(true)}
        onClose={() => setModalVisible(false)}
      />

      {modalVisible && headers.length > 0 && (
        <Modal
          title={TITLE}
          coleccion={COLECCION}
          data={furgones}
          headers={headers}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default FurgonesAccess;
