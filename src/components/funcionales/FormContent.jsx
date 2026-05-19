import InputForm from "../inputs/InputForm";
import FormList from "./FormList";

import { useData } from "../../contexto/DataContext";
import { cargarSelects } from "../../functions/dataFunctions";
const FormContent = ({
  elemento,
  campos,
  //opciones,
  data,
  setData,
  listado,
  isDouble = false,
}) => {
  const modoEdicion = !!elemento;

  const handleChange = (key, value) => {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // info para selects
  const { personas, tractores, furgones, empresas, ubicaciones } = useData();

  const listarOpciones = (col) => {
    let listado;
    switch (col) {
      case "personas":
        listado = cargarSelects("personas", personas);
        break;
      case "tractores":
        listado = tractores;
        break;
      case "furgones":
        listado = furgones;
        break;
      case "empresasPropias":
        listado = cargarSelects("empresas", empresas);
        break;
      case "tipoEmpleados":
        listado = cargarSelects("tipoEmpleado");
        break;
      case "puestos":
        listado = cargarSelects("puestos");
        break;
      case "ubicaciones":
        listado = cargarSelects("ubicaciones", ubicaciones);
        break;
      default:
        listado = [];
        break;
    }
    return listado;
  };

  const bloquePrincipal = campos.filter((cp) => cp.type === "principal");
  const bloqueSecondary = campos.filter((cp) => cp.type === "secondary");
  const bloqueComplete = campos.filter((cp) => cp.type === "group"); // ej: para cargar listas de repuestos
  const bloqueSecret = campos.filter((cp) => cp.type === "secret");

  return (
    <>
      {bloquePrincipal.length > 0 && (
        <div className={`${isDouble ? "doble-form-left" : ""}`}>
          <label>
            <strong className="form-info-title">Información</strong>
          </label>
          <div className="form-info-box">
            {bloquePrincipal.map((campo) => (
              <InputForm
                campo={campo}
                value={data[campo.key]}
                onChange={handleChange}
                opciones={listarOpciones(campo.optionsList)}
                modoEdicion={modoEdicion}
              />
            ))}
          </div>
        </div>
      )}
      {bloqueSecondary.length > 0 && (
        <div className={`${isDouble ? "doble-form-left" : ""}`}>
          <label>
            <strong className="form-info-title">Otros datos</strong>
          </label>
          <div className="form-info-box">
            {bloqueSecondary.map((campo) => (
              <InputForm
                campo={campo}
                value={data[campo.key]}
                onChange={handleChange}
                opciones={listarOpciones(campo.optionsList)}
                modoEdicion={modoEdicion}
              />
            ))}
          </div>
        </div>
      )}
      {bloqueComplete.length > 0 && (
        <div className="doble-form-right">
          <label>
            <strong className="form-info-title">Registrar</strong>
          </label>
          <div className="form-info-box">
            <FormList
              articulos={listado}
              value={data.ingresos || []}
              onChange={(nuevoListado) =>
                handleChange("ingresos", nuevoListado)
              }
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FormContent;
