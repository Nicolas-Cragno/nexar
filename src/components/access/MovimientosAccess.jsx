import { useState } from "react";
import Logo from "../../assets/logos/LOGO_BANK.png";
import Access from "./Access";
import FormMovimientoCuenta from "../formularios/FormMovimientoCuenta";
import { columnas } from "../modales/data/Columnas";
import { useMovimientos } from "../../contexto/MovimientosContext";

const MovimientosAccess = () => {
  const { movimientos } = useMovimientos();
  const [formVisible, setFormVisible] = useState(false);

  return (
    <>
      <Access
        coleccion={movimientos}
        entity="movimientos"
        title="MOVIMIENTOS"
        logo={Logo}
        headers={columnas.movimientos}
        text={`${movimientos.length} REGISTROS`}
        onClickForm={() => setFormVisible(true)}
        editable={false}
      />
      {formVisible && <FormMovimientoCuenta onClose={() => setFormVisible(false)} />}
    </>
  );
};

export default MovimientosAccess;
