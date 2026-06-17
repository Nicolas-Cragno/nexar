//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_CONTAINER.png";
import FormFurgon from "../formularios/FormFurgon";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../modales/data/Columnas";
import { useFurgones } from "../../contexto/FurgonesContext";

const FurgonesAccess = () => {
  const { furgones } = useFurgones();
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
        coleccion={furgones}
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        onClickForm={handleOpen}
      />
      {formVisible && <FormFurgon onClose={handleClose} />}
    </>
  );
};

export default FurgonesAccess;
