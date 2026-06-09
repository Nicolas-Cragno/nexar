//------------------------------------------------------ externos
import { memo, useState } from "react";
//------------------------------------------------------ elementos
import TextButton from "../buttons/TextButton.jsx";
import CloseButton from "../buttons/CloseButton";
import FormGestor from "../formularios/FormGestor.jsx";
//------------------------------------------------------ funciones
import {
  formatearCampoFirestore,
  formatearMonto,
} from "../../functions/dataFunctions";
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
  const estadoSubtitulo = estado ? "ACTIVO" : "DADO DE BAJA";
  const [formEditarVisible, setFormEditarVisible] = useState(false);
  const eventosPorteria = eventos.porteria;
  const eventosViaje = eventos.viajes;

  const auxCampos =
    coleccion?.toLowerCase() || area?.toLowerCase() || "personas";

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
        <p className="status">{estadoSubtitulo}</p>
        <div className="ficha-subheader">
          {campos.map((campo, index) => {
            const valor = elemento[campo.key];

            if (!valor || campo.type !== "subtitle") return null;

            return <span>{valor}</span>;
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
                        {formatearCampoFirestore(
                          valor,
                          campo.soloFecha,
                        ).toUpperCase()}
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
              <strong className="ficha-info-title">Otros datos</strong>
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

        {elemento.tramos?.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Tramos</strong>
            </label>

            <div className="ficha-info-box ficha-tramos">
              {elemento.tramos.map((tramo, index) => (
                <div key={index} className="ficha-tramo">
                  <div className="ficha-tramo-header">
                    <strong>
                      {tramo.lugarSalidaLabel} → {tramo.lugarLlegadaLabel}
                    </strong>
                  </div>

                  <div className="ficha-tramo-fechas">
                    <div>
                      <span className="ficha-tramo-label">Inicio</span>
                      <span>
                        {tramo.fechaSalida
                          ? formatearCampoFirestore(tramo.fechaSalida, true)
                          : "-"}
                      </span>
                    </div>

                    <div>
                      <span className="ficha-tramo-label">Fin</span>
                      <span>
                        {tramo.fechaLlegada
                          ? formatearCampoFirestore(tramo.fechaLlegada, true)
                          : "-"}
                      </span>
                    </div>
                  </div>
                  {tramo.detalle && (
                    <div className="ficha-tramo-detalle">{tramo.detalle}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {elemento.adelantosRegistrados?.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Adelantos</strong>
            </label>

            <div className="ficha-info-box">
              {elemento.adelantosRegistrados.map((adelanto, index) => (
                <div key={adelanto.id || index} className="ficha-info">
                  <div className="obj-info-body">
                    <strong className="obj-info-fecha">
                      {adelanto.fecha && (
                        <span>
                          {formatearCampoFirestore(adelanto.fecha, true)}
                        </span>
                      )}
                    </strong>
                    <span className="obj-info-monto">
                      ${formatearMonto(adelanto.monto)}
                    </span>
                  </div>
                  <div className="obj-info-footer">
                    {adelanto.operadorCompleto}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {elemento.crucesRegistrados?.length > 0 && (
          <>
            <label>
              <strong className="ficha-info-title">Cruces de barcaza</strong>
            </label>

            <div className="ficha-info-box">
              {elemento.crucesRegistrados.map((cruce, index) => (
                <div key={cruce.id || index} className="ficha-info">
                  <div className="obj-info-body">
                    <strong className="obj-info-fecha">
                      {cruce.fecha && (
                        <span>
                          {formatearCampoFirestore(cruce.fecha, true)}
                        </span>
                      )}
                    </strong>
                    <span className="obj-info-id">{cruce.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {formEditarVisible && (
          <FormGestor
            elemento={elemento}
            tipo={coleccion}
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
                  <span>
                    {formatearCampoFirestore(
                      valor,
                      campo.soloFecha,
                    ).toUpperCase()}
                  </span>
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
