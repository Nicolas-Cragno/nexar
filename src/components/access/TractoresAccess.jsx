//------------------------------------------------------ externos
import { useEffect, useState } from "react";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/logoPrincipal.png";
import CardLogo from "../../components/cards/CardLogo";
import Modal from "../modales/Modal";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useData } from "../../contexto/DataContext";

const TractoresAccess = () => {
  const { tractores } = useData();
  const TITLE = "Tractores";
  const COLECCION = "tractores";
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
          data={tractores}
          headers={headers}
          onClose={() => setModalVisible(false)}
        />
      )}
    </>
  );
};

export default TractoresAccess;
