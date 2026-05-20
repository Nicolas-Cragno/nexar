//------------------------------------------------------ externos
import { memo, useState } from "react";
//------------------------------------------------------ elementos
import TextButton from "../buttons/TextButton.jsx";
import CloseButton from "../buttons/CloseButton";
import FormPersona from "../formularios/FormPersona.jsx";
//------------------------------------------------------ funciones
import { formatearCampoFirestore } from "../../functions/dataFunctions";
import { eventos } from "../formularios/data/FormContent.js";
import { fichaContent } from "./data/FichaContent.js";
//------------------------------------------------------ estilos
import "./css/Fichas.css";

const Ficha = ({
  elemento,
  coleccion = null,
  area = null,
  onRender,
  container = Object.keys(elemento),
  reload = null,
  onClose,
}) => {
  const titulado = container.find((campo) => campo.type === "title");
  const tituladoAbajo = container.find((campo) => campo.type === "secondtitle");
  const titulo = titulado ? elemento[titulado.key] : elemento["id"];
  const tituloAbajo = tituladoAbajo ? elemento[tituladoAbajo.key] : null;
  const estado = container.find((campo) => campo.type === "state");
  const estadoSubtitulo = estado === true ? "ACTIVO" : "DADO DE BAJA";
  const [formEditarVisible, setFormEditarVisible] = useState(false);
  const eventosPorteria = eventos.porteria;

  const auxCampos = area || coleccion || "personas";

  const campos = fichaContent[auxCampos] ?? [];

  const bloquePrincipal = campos.filter(
    (campo) =>
      campo.type === "principal" &&
      elemento[campo.key] !== undefined &&
      elemento[campo.key] !== null &&
      elemento[campo.key] !== "",
  );

  const bloqueSecundario = campos.filter(
    (campo) =>
      campo.type === "secondary" &&
      elemento[campo.key] !== undefined &&
      elemento[campo.key] !== null &&
      elemento[campo.key] !== "",
  );

  const bloqueBool = campos.filter(
    (campo) =>
      campo.type === "boolean" &&
      elemento[campo.key] !== undefined &&
      elemento[campo.key] !== null &&
      elemento[campo.key] !== "",
  );

  if (!elemento || typeof elemento !== "object") {
    console.log("[Error] Ficha espera recibir un objeto elemento");
    return null;
  }
  console.log(`----------- Render Ficha ${elemento.id}`);

  const handleClose = async () => {
    if (reload) await reload();
    setFormEditarVisible(false);
    onClose();
  };

  return (
    <div className="ficha">
      <div className="ficha-content">
        <CloseButton onClose={onClose} />
        <h1 className="ficha-header">
          <strong className="ficha-id">{titulo}</strong>
          {tituladoAbajo && <span className="nombres">{tituloAbajo}</span>}{" "}
        </h1>
        <hr />
        {/*
        <p className="status">{estadoSubtitulo}</p>
        */}
        <div className="ficha-subheader">
          {campos.map((campo, index) => {
            const valor = elemento[campo.key];

            if (!valor || campo.type !== "subtitle") return null;

            return <span>{formatearCampoFirestore(valor)}</span>;
          })}
        </div>

        {bloquePrincipal.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Información</strong>
            </label>
            <div className="ficha-info-box">
              {campos.map((campo, index) => {
                const valor = elemento[campo.key];

                if (!valor || campo.type !== "principal") return null;

                return (
                  <div key={campo.key || index}>
                    <div className="ficha-info">
                      <strong>{campo.label} : </strong>
                      <span>
                        {formatearCampoFirestore(valor).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {bloqueSecundario.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Información</strong>
            </label>
            <div className="ficha-info-box">
              {campos.map((campo, index) => {
                const valor = elemento[campo.key];

                if (!valor || campo.type !== "secondary") return null;

                return (
                  <div key={campo.key || index}>
                    <div className="ficha-info">
                      <strong>{campo.label} : </strong>
                      <span>
                        {formatearCampoFirestore(valor).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {bloqueBool.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Documentación</strong>
            </label>
            <div className="ficha-info-box">
              {campos.map((campo, index) => {
                const valor = elemento[campo.key];

                if (!valor || campo.type !== "boolean") return null;

                return (
                  <span
                    key={campo.key}
                    className={`chequeo-item ${
                      valor ? "chequeo-ok" : "chequeo-fail"
                    }`}
                  >
                    {campo.label}
                  </span>
                );
              })}
            </div>
          </>
        )}

        {elemento.chequeos && (
          <>
            <label>
              <strong className="ficha-info-title">Chequeos</strong>
            </label>
            <div className="checkbox-list">
              {eventosPorteria
                .find((campo) => campo.key === "chequeos")
                ?.items.map((item) => {
                  const valor = elemento.chequeos?.[item.key];

                  return (
                    <span
                      key={item.key}
                      className={`chequeo-item ${
                        valor ? "chequeo-ok" : "chequeo-fail"
                      }`}
                    >
                      {item.label}
                    </span>
                  );
                })}
            </div>
          </>
        )}

        {formEditarVisible && coleccion !== "personas" && (
          <FormPersona
            elemento={elemento}
            coleccion={coleccion}
            onGuardar={handleClose}
            onClose={handleClose}
          />
        )}

        <div className="ficha-info-footer">
          {container.map((campo, index) => {
            const valor = elemento[campo.key];

            if (!valor || campo.type !== "footer") return null;

            return (
              <div key={campo.key || index}>
                <div className="ficha-data">
                  <strong>{campo.label} : </strong>
                  <span>{formatearCampoFirestore(valor).toUpperCase()}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ficha-buttons">
          <TextButton
            text={"EDITAR"}
            onClick={() => setFormEditarVisible(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Ficha);
