//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import FormMovimientoCuenta from "../formularios/FormMovimientoCuenta";
import Logo from "../../assets/logos/logoPrincipal.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useData } from "../../contexto/DataContext";

const CuentasAccess = () => {
  const { cuentaCorriente, loading } = useData();
  const [texto, setTexto] = useState(<Load className="spinner" />);

  useEffect(() => {
    let txt = "";
    const empresa = cuentaCorriente?.find((em) => em.id === "33719349949");
    txt = empresa ? `$ ${empresa.monto || 0}` : "";

    setTexto(txt);
  }, [cuentaCorriente, loading]);

  const TITLE = "CUENTA CORRIENTE";
  const COLECCION = "cuentaCorriente";
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
        coleccion={cuentaCorriente}
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        onClickForm={handleOpen}
      />
      {formVisible && <FormMovimientoCuenta onClose={handleClose} />}
    </>
  );
};

export default CuentasAccess;
