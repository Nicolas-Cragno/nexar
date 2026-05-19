//------------------------------------------------------
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
//------------------------------------------------------
import CloseButton from "../buttons/CloseButton";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------
import {
  capitalizarTexto,
  formatearCampoFirestore,
  formatearFechaInput,
  idCorrelativo,
} from "../../functions/dataFunctions";
import { elementos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
//------------------------------------------------------
import "./css/Forms.css";
const FormStandard = ({
  elemento = null,
  coleccion,
  area,
  onGuardar,
  onClose,
}) => {
  const modoEdicion = !!elemento;
  const titulo = modoEdicion ? "Editar" : "Agregar";
  const subtitulo = coleccion ? capitalizarTexto(coleccion) : "Formulario";
  const [loading, setLoading] = useState(true);
  const [empresas, setEmpresas] = useState([]); // para listado de empresas
  const [personas, setPersonas] = useState([]); // para listado de personas
  const [sucursales, setSucursales] = useState([]); // para listado de sucursales
  const campos = elementos[coleccion] || [];

  const [formData, setFormData] = useState(
    campos.reduce((acc, campo) => {
      acc[campo.key] = elemento?.[campo.key] || "";
      return acc;
    }, {}),
  );

  useEffect(() => {
    // lo agregue porqeu con la fecha se renderizaba a cada rato
    if (!elemento) return;

    const nuevosDatos = campos.reduce((acc, campo) => {
      let valor = elemento[campo.key] ?? "";

      if (campo.dato === "date" && valor) {
        valor = formatearFechaInput(valor);
      }

      acc[campo.key] = valor;
      return acc;
    }, {});

    setFormData(nuevosDatos);
  }, [elemento, campos]);

  const cargarOpciones = (col) => {
    switch (col) {
      case "empresas":
        return empresas
          .filter((e) => e.tipo === "propia")
          .map((e) => ({
            value: e.id,
            label: `${e.nombre} (${e.cuit})`,
            raw: e,
          }));

      case "personas":
        return personas.map((p) => ({
          value: p.id,
          label: `${p.apellido}, ${p.nombres}`,
          raw: p,
        }));

      case "proveedores":
        return empresas
          .filter((e) => e.tipo === "proveedor")
          .map((e) => ({
            value: e.id,
            label: `${e.nombre} (${e.cuit})`,
            raw: e,
          }));

      case "sucursales":
        return sucursales.map((s) => ({
          value: s.id,
          label: `${s.nombre} (${s.id})`,
          raw: s,
        }));
      default:
        return [];
    }
  };

  const cargarDatos = async () => {
    try {
      const [listadoEmpresas, listadoPersonas, listadoSucursales] =
        await Promise.all([
          listarColeccion("empresas"),
          listarColeccion("personas"),
          listarColeccion("ubicaciones"),
        ]);

      setEmpresas(Array.isArray(listadoEmpresas) ? listadoEmpresas : []);
      setPersonas(Array.isArray(listadoPersonas) ? listadoPersonas : []);
      setSucursales(Array.isArray(listadoSucursales) ? listadoSucursales : []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    const iniciarlizar = async () => {
      await cargarDatos();
      setLoading(false);
    };

    iniciarlizar();
  }, []);

  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const camposObligatorios = campos.filter((cp) => cp.important);

    const camposCompletados = campos.filter(
      (cp) =>
        cp.important &&
        formData[cp.key] !== null &&
        formData[cp.key] !== undefined &&
        formData[cp.key].toString().trim() !== "",
    );

    if (camposObligatorios.length !== camposCompletados.length) {
      Swal.fire({
        title: "Faltan datos",
        text: "Complete los campos obligatorios.",
        icon: "question",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4161bd",
      });
      return;
    }

    setLoading(true);

    const elementoAGuardar = campos.reduce((acc, cp) => {
      if (cp.use !== "database") return acc;

      let valor = formData[cp.key];

      // estandarizar campos
      switch (cp.dato) {
        case "number":
          valor = valor === "" ? null : Number(valor);
          break;

        case "text":
          valor = valor === "" ? null : String(valor).toUpperCase();
          break;

        case "date":
          valor = valor ? new Date(valor) : null;
          break;

        case "boolean":
          valor = Boolean(valor);
          break;

        default:
          valor = valor === "" ? null : valor;
          break;
      }

      acc[cp.key] = valor;
      return acc;
    }, {});

    try {
      if (modoEdicion) {
        await modificarDocumento(coleccion, elemento.id, {
          ...elementoAGuardar,
          ultimaModificacion: new Date(),
        });

        Swal.fire(
          "Actualizado",
          `Elemento ${elemento.id} de ${coleccion} actualizado correctamente.`,
          "success",
        );
      } else {
        const campoId = campos.find((cp) => cp.isId);

        let idDocumento;

        if (campoId) {
          idDocumento = String(formData[campoId.key]);

          const existe = await obtenerDocumento(coleccion, idDocumento);

          if (existe) {
            Swal.fire({
              title: "Elemento existente",
              text: `El elemento ${idDocumento} ya está registrado en ${coleccion}.`,
              icon: "warning",
              confirmButtonColor: "#4161bd",
            });
            setLoading(false);
            return;
          }
        } else {
          const listado = await refreshCache(coleccion);
          idDocumento = idCorrelativo(listado);
        }

        await crearDocumento(coleccion, String(idDocumento), {
          ...elementoAGuardar,
          area: area,
        });

        Swal.fire(
          "Carga correcta",
          `Elemento ${idDocumento} de ${coleccion} creado correctamente.`,
          "success",
        );
      }

      if (onGuardar) await onGuardar();

      refreshCache(coleccion);
      onClose();
    } catch (error) {
      console.error("[Error] al intentar guardar", error);

      Swal.fire({
        title: "Error",
        text: "No hemos podido procesar la solicitud.",
        icon: "error",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#4161bd",
      });
    } finally {
      setLoading(false);
    }
  };

  const bloquePrincipal = campos.filter((cp) => cp.type === "principal");
  const bloqueSecondary = campos.filter((cp) => cp.type === "secondary");
  const bloqueSecret = campos.filter((cp) => cp.type === "secret");

  return (
    <div className="form">
      {loading ? (
        <Loading />
      ) : (
        <div className="form-content">
          <CloseButton onClose={onClose} />

          <h1 className="form-header">
            <span className="form-titlebottom">{titulo}</span>
            <strong className="form-title">{subtitulo}</strong>
          </h1>

          <hr />

          {bloquePrincipal.length > 0 && (
            <>
              <label>
                <strong className="form-info-title">Información</strong>
              </label>
              <div className="form-info-box">
                {bloquePrincipal.map((campo) => (
                  <div key={campo.key}>
                    <div className="form-info">
                      <strong>
                        {campo.label}{" "}
                        {campo.important && (
                          <span className="complete">* obligatorio</span>
                        )}
                      </strong>
                      {campo.inputType === "input" && (
                        <input
                          className="form-input"
                          style={
                            campo.dato === "text"
                              ? { textTransform: "uppercase" }
                              : undefined
                          }
                          type={campo.dato}
                          value={formData[campo.key] ?? ""}
                          onChange={(e) =>
                            handleChange(campo.key, e.target.value)
                          }
                          disabled={
                            modoEdicion && campo.isId && campo.notChange
                          }
                        />
                      )}
                      {campo.inputType === "textarea" && (
                        <textarea
                          className="form-textarea"
                          value={formData[campo.key] ?? ""}
                          onChange={(e) =>
                            handleChange(campo.key, e.target.value)
                          }
                          disabled={
                            modoEdicion && campo.isId && campo.notChange
                          }
                        />
                      )}
                      {campo.inputType === "inputOptions" && (
                        <select
                          className="form-input"
                          value={
                            formatearCampoFirestore(formData[campo.key]) || ""
                          }
                          onChange={(e) =>
                            handleChange(campo.key, e.target.value)
                          }
                        >
                          <option value="">SIN ASIGNAR</option>

                          {cargarOpciones(campo.optionsList).map((opt) => (
                            <option key={opt.key} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {bloqueSecondary.length > 0 && (
            <>
              <label>
                <strong className="form-info-title">Otros datos</strong>
              </label>
              <div className="form-info-box">
                {bloqueSecondary.map((campo) => (
                  <div key={campo.key}>
                    <div className="form-info">
                      <strong>
                        {campo.label}{" "}
                        {campo.important && (
                          <span className="complete">* obligatorio</span>
                        )}
                      </strong>
                      {campo.inputType === "input" && (
                        <input
                          className="form-input"
                          style={
                            campo.dato === "text"
                              ? { textTransform: "uppercase" }
                              : undefined
                          }
                          type={campo.dato}
                          value={formData[campo.key] ?? ""}
                          onChange={(e) =>
                            handleChange(campo.key, e.target.value)
                          }
                          disabled={
                            modoEdicion && campo.isId && campo.notChange
                          }
                        />
                      )}
                      {campo.inputType === "textarea" && (
                        <textarea
                          className="form-textarea"
                          value={formData[campo.key] ?? ""}
                          onChange={(e) =>
                            handleChange(campo.key, e.target.value)
                          }
                          disabled={
                            modoEdicion && campo.isId && campo.notChange
                          }
                        />
                      )}
                      {campo.inputType === "inputOptions" && (
                        <select
                          className="form-input"
                          value={
                            formatearCampoFirestore(formData[campo.key]) || ""
                          }
                          onChange={(e) =>
                            handleChange(campo.key, e.target.value)
                          }
                        >
                          <option value="">SIN ASIGNAR</option>

                          {cargarOpciones(campo.optionsList).map((opt) => (
                            <option key={opt.key} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="form-buttons">
            <TextButton
              text={"Guardar"}
              type={"button"}
              onClick={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormStandard;
