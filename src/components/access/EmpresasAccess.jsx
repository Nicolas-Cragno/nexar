//------------------------------------------------------ externos
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters as Load } from "react-icons/ai";
//------------------------------------------------------ elementos
import Logo from "../../assets/logos/LOGO_COMPANY.png";
import Access from "./Access";
//------------------------------------------------------ funciones
import { columnas } from "../../components/modales/data/Columnas";
import { useEmpresas } from "../../contexto/EmpresasContext";
import FormEmpresa from "../formularios/FormEmpresa";

const EmpresasAccess = ({ filtro = "propia" }) => {
  const { empresas, loading } = useEmpresas();
  const [texto, setTexto] = useState(<Load className="spinner" />);
  const [titulo, setTitulo] = useState("Empresas");
  const [listado, setListado] = useState([]);

  useEffect(() => {
    let txt = "";
    switch (filtro.toLocaleLowerCase()) {
      case "propia":
        const empresa = empresas.find((em) => em.id === "33719349949");
        txt = empresa ? `$ ${empresa.monto || 0}` : "";
        setListado(empresa);
        setTitulo("Empresas Propias");
        break;
      case "clientes":
        const clientes = empresas.filter((em) => em.tipo === "cliente");
        const cantidadClientes = clientes ? Object.keys(clientes).length : 0;
        txt = `${cantidadClientes} ${cantidadClientes > 1 ? "registrados" : cantidadClientes === 1 ? "registrado" : null}`;
        setListado(clientes);
        setTitulo("Clientes");
        break;
      case "proveedores":
        const proveedores = empresas.filter((em) => em.tipo === "proveedor");
        const cantidadProveedores = proveedores
          ? Object.keys(proveedores).length
          : 0;
        txt = `${cantidadProveedores} ${cantidadProveedores > 1 ? "registrados" : cantidadProveedores === 1 ? "registrado" : null}`;
        setListado(proveedores);
        setTitulo("Proveedores");
        break;
      default:
        setListado(empresas);
        break;
    }

    setTexto(txt);
  }, [empresas, loading]);

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
        title={titulo}
        logo={Logo}
        headers={headers}
        text={texto}
        filtro={filtro}
        onClickForm={handleOpen}
        editable={false}
      />
      {formVisible && <FormEmpresa onClose={handleClose} />}
    </>
  );
};

export default EmpresasAccess;
