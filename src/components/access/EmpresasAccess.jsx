//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_PRINCIPAL2.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import {
  capitalizarTexto,
  formatearMonto,
} from "../../functions/dataFunctions";
import { useEmpresas } from "../../contexto/EmpresasContext";
import { useData } from "../../contexto/DataContext";
import FormEmpresa from "../formularios/FormEmpresa";

const EmpresasAccess = ({ filtro = "propia" }) => {
  const { empresas, loading } = useEmpresas();
  const { cuentaCorriente } = useData();
  const [texto, setTexto] = useState(<Load className="spinner" />);
  const [listado, setListado] = useState([]);

  useEffect(() => {
    let txt = "";
    if (filtro === "propia") {
      const empresa = empresas.find((em) => em.id === "33719349949");
      txt = empresa ? `$ ${empresa.monto || 0}` : "";
      setListado(empresa);
    } else if (filtro === "clientes") {
      const clientes = empresas.filter((em) => em.tipo === "cliente");
      txt = "Listado";
      setListado(clientes);
    }

    setTexto(txt);
  }, [empresas, loading]);

  const TITLE =
    filtro === "propia" ? "Empresas propias" : "Clientes / Proveedores";
  const COLECCION = "empresas";
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
        coleccion={listado}
        title={TITLE}
        logo={Logo}
        headers={headers}
        text={texto}
        filtro={filtro}
        onClickForm={handleOpen}
      />
      {formVisible && <FormEmpresa onClose={handleClose} />}
    </>
  );
};

export default EmpresasAccess;
