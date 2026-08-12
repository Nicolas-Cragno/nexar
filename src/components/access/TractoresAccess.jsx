//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_TRUCK.png";
import FormTractor from "../formularios/FormTractor";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useTractores } from "../../contexto/TractoresContext";

const TractoresAccess = () => {
  const { tractores } = useTractores();
  const [texto, setTexto] = useState(<Load className="spinner" />);

  useEffect(() => {
    if (tractores) {
      const cantidadTractores = tractores ? Object.keys(tractores).length : 0;
      const text = `${cantidadTractores} ${cantidadTractores > 1 ? "activos" : cantidadTractores === 1 ? "activo" : null}`;
      setTexto(text);
    }
  }, [tractores]);

  const TITLE = "Tractores";
  const COLECCION = "tractores";
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
        coleccion={tractores}
        entity="tractores"
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        onClickForm={handleOpen}
      />
      {formVisible && <FormTractor onClose={handleClose} />}
    </>
  );
};

export default TractoresAccess;
