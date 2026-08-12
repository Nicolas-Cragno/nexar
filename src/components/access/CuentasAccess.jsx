//------------------------------------------------------ externos
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_BANK.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useData } from "../../contexto/DataContext";

const CuentasAccess = () => {
  const { cuentaCorriente } = useData();

  const TITLE = "CUENTAS CORRIENTES";
  const headers = columnas.cuentaCorriente;
  return (
      <Access
        coleccion={cuentaCorriente}
        entity="cuentaCorriente"
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={`${cuentaCorriente.length} CUENTAS`}
        editable={false}
      />
  );
};

export default CuentasAccess;
