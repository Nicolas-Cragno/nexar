import InputForm from "../inputs/InputForm";
import FormList from "./FormList";
import FormToDo from "./FormToDo";
import { useData } from "../../contexto/DataContext";
import { useTractores } from "../../contexto/TractoresContext";
import { useFurgones } from "../../contexto/FurgonesContext";
import { cargarSelects } from "../../functions/dataFunctions";
import { useViajes } from "../../contexto/ViajesContext";
import FormListGroup from "./FormListGroup";
import FormListTramos from "./FormListTramos";
import { usePersonas } from "../../contexto/PersonasContext";
import { especializacionOptions } from "../formularios/data/OptionsContent";

const FormContent = ({
  elemento,
  campos = [],
  //opciones,
  data,
  setData,
  listado,
  isDouble = false,
  readOnly = false,
}) => {
  const modoEdicion = !!elemento;

  const handleChange = (key, value) => {
    setData((prev) => {
      const nuevo = {
        ...prev,
        [key]: value,
      };

      // para especializaciones de personas
      if (key === "puesto") {
        nuevo.especializacion = "";
      }

      return nuevo;
    });
  };

  // info para selects
  const { empresas, cuentaCorriente, ubicaciones } = useData();
  const { viajes } = useViajes();
  const { personas } = usePersonas();
  const { tractores } = useTractores();
  const { furgones } = useFurgones();

  const listarOpciones = (col) => {
    let listado;
    switch (col) {
      case "viajes":
        listado = cargarSelects("viajes", viajes);
        break;
      case "viajesActivos":
        const viajesTrue = (viajes || []).filter((vj) => vj.estado);
        listado = cargarSelects("viajes", viajesTrue);
        break;
      case "personas":
        listado = cargarSelects("personas", personas);
        break;
      case "choferes":
        const personasChoferes = (personas || []).filter(
          (ps) => ps?.puesto === "CHOFER",
        );
        listado = cargarSelects("personas", personasChoferes);
        break;
      case "choferesDisponibles":
        listado = cargarSelects(
          "personas",
          personas.filter(
            (ps) =>
              ps?.puesto === "CHOFER" &&
              (!ps.enViaje || String(ps.viajeActivo) === String(elemento?.id)) &&
              !viajes.some(
                (viaje) =>
                  viaje.estado === true &&
                  String(viaje.id) !== String(elemento?.id) &&
                  String(viaje.persona) === String(ps.id),
              ),
          ),
        );
        break;
      case "administrativos":
        const personasAdm = (personas || []).filter(
          (ps) => ps?.puesto === "ADMINISTRATIVO",
        );
        listado = cargarSelects("personas", personasAdm);
        break;
      case "cuentasCorrientes":
        listado = cargarSelects("cuentas", cuentaCorriente);
        break;
      case "tractores":
        listado = cargarSelects("tractores", tractores);
        break;
      case "tractoresDisponibles":
        listado = cargarSelects(
          "tractores",
          tractores.filter(
            (tr) =>
              (!tr.enViaje || String(tr.viajeActivo) === String(elemento?.id)) &&
              !viajes.some(
                (viaje) =>
                  viaje.estado === true &&
                  String(viaje.id) !== String(elemento?.id) &&
                  String(viaje.tractor) === String(tr.id),
              ),
          ),
        );
        break;
      case "furgones":
        listado = cargarSelects("furgones", furgones);
        break;
      case "furgonesDisponibles":
        listado = cargarSelects(
          "furgones",
          furgones.filter(
            (fg) =>
              (!fg.enViaje || String(fg.viajeActivo) === String(elemento?.id)) &&
              !viajes.some(
                (viaje) =>
                  viaje.estado === true &&
                  String(viaje.id) !== String(elemento?.id) &&
                  (viaje.furgon || []).some(
                    (furgonId) => String(furgonId) === String(fg.id),
                  ),
              ),
          ),
        );
        break;
      case "empresasPropias":
        listado = cargarSelects(
          "empresas",
          empresas.filter((em) => em.tipo?.toLowerCase() === "propia"),
        );
        break;
      case "clientes":
        listado = cargarSelects(
          "empresas",
          empresas.filter((em) => em.tipo?.toLowerCase() === "cliente"),
        );
        break;
      case "proveedores":
        listado = cargarSelects(
          "empresas",
          empresas.filter((em) => em.tipo?.toLowerCase() === "proveedor"),
        );
        break;
      case "tipoEmpleados":
        listado = cargarSelects("tipoEmpleado");
        break;
      case "tipoEmpresas":
        listado = cargarSelects("tipoEmpresa");
        break;
      case "puestos":
        listado = cargarSelects("puestos");
        break;
      case "especializaciones":
        listado = especializacionOptions(data?.puesto);
        break;
      case "ubicaciones":
        listado = cargarSelects("ubicaciones", ubicaciones);
        break;
      case "tipoCuentaCorriente":
        listado = cargarSelects("tipoCuentaCorriente");
        break;
      case "localidades":
        listado = cargarSelects("localidades");
        break;
      case "provincias":
        listado = cargarSelects("provincias");
        break;
      case "tipoFurgones":
        listado = cargarSelects("tipoFurgones");
        break;
      default:
        listado = [];
        break;
    }
    return listado;
  };

  const bloquePrincipal = campos.filter((cp) => cp.type === "principal");
  const bloqueSecondary = campos.filter((cp) => cp.type === "secondary");
  const bloqueGroup = campos.filter((cp) => cp.type === "group"); // ej: para cargar listas de repuestos
  const bloqueComplete = campos.filter((cp) => cp.type === "groupComplete");
  const bloqueToDo = campos.filter((cp) => cp.type === "toDo");
  const bloqueTramos = campos.filter((cp) => cp.type === "groupTramos"); // especial para viajes
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
                disabled={readOnly && !campo.neverDisabled}
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
                disabled={readOnly && !campo.neverDisabled}
              />
            ))}
          </div>
        </div>
      )}
      {bloqueGroup.length > 0 && (
        <div className={"doble-form-right"}>
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
      {bloqueComplete.map((campo) => (
        <div className={"doble-form-right"}>
          <label>
            <strong className="form-info-title">Registrar</strong>
            <div className="form-info-box">
              <FormListGroup
                key={campo.key}
                title={campo.label}
                items={campo.items}
                value={data[campo.key] || []}
                onChange={(nuevoListado) =>
                  handleChange(campo.key, nuevoListado)
                }
              />
            </div>
          </label>
        </div>
      ))}
      {bloqueTramos.map((campo) => (
        <div className={"doble-form-right"}>
          <label>
            <strong className="form-info-title">Tramos del viaje</strong>
            <div className="form-info-box">
              <FormListTramos
                key={campo.key}
                items={campo.items}
                value={data[campo.key] || []}
                onChange={(nuevoListado) =>
                  handleChange(campo.key, nuevoListado)
                }
                opciones={cargarSelects("localidades")} // se manda solo esta lista
              />
            </div>
          </label>
        </div>
      ))}
      {!modoEdicion &&
        bloqueToDo.map((campo) => (
          <div className={"doble-form-right"} key={campo.key}>
            <label>
              <strong className="form-info-title">{campo.label}</strong>

              <div className="form-info-box">
                <FormToDo
                  value={data.adelantos || []}
                  onChange={(nuevoListado) => {
                    const total = nuevoListado.reduce(
                      (acc, item) => acc + Number(item.monto || 0),
                      0,
                    );

                    setData((prev) => ({
                      ...prev,
                      adelantos: nuevoListado,
                      adelanto: total,
                    }));
                  }}
                />
              </div>
            </label>
          </div>
        ))}
    </>
  );
};

export default FormContent;
