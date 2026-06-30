//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import FormMovimientoCuenta from "../formularios/FormMovimientoCuenta";
import Logo from "../../assets/logos/LOGO_BANK.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useMovimientos } from "../../contexto/MovimientosContext";

const CuentasAccess = () => {
  const { movimientos } = useMovimientos();

  const TITLE = "CUENTA CORRIENTE";
  const COLECCION = "movimientos";
  const headers = columnas[COLECCION];
  const [formVisible, setFormVisible] = useState(false);

  const handleOpen = () => {
    setFormVisible(true);
  };

  const handleClose = () => {
    setFormVisible(false);
  };

  return (
    <>
      <Access
        coleccion={movimientos}
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={"REGISTROS"}
        onClickForm={handleOpen}
        editable={false}
      />
      {formVisible && <FormMovimientoCuenta onClose={handleClose} />}
    </>
  );
};

export default CuentasAccess;
