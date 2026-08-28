import { useRef, useState } from "react";
import InputForm from "../../inputs/InputForm";
import TextButton from "../../buttons/TextButton";
import { calcularImpactoMovimiento } from "../data/Submits";
import { cargarSelects, formatearMonto } from "../../../functions/dataFunctions";

export const crearMovimientoVacio = (valores = {}) => ({ tipo: "", monto: "", detalle: "", ...valores });

const validarMovimiento = (movimiento) => {
  if (!movimiento.tipo) return "Seleccioná el tipo de movimiento.";
  if (!movimiento.monto || Number(movimiento.monto) <= 0) return "Ingresá un monto mayor a cero.";
  return "";
};

const MovimientosList = ({ campos, movimientos, onChange, maximo = 25, movimientoInicial }) => {
  const [borrador, setBorrador] = useState(() => crearMovimientoVacio(movimientoInicial));
  const [indiceEdicion, setIndiceEdicion] = useState(null);
  const [error, setError] = useState("");
  const compositorRef = useRef(null);
  const opcionesTipo = cargarSelects("tipoCuentaCorriente");

  const enfocarCompositor = () => {
    requestAnimationFrame(() => compositorRef.current?.querySelector("input")?.focus());
  };

  const cambiarBorrador = (key, value) => {
    setBorrador((previo) => ({ ...previo, [key]: value }));
    setError("");
  };

  const limpiarCompositor = () => {
    setBorrador(crearMovimientoVacio());
    setIndiceEdicion(null);
    setError("");
    enfocarCompositor();
  };

  const confirmarMovimiento = () => {
    const mensajeError = validarMovimiento(borrador);
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    if (indiceEdicion !== null) {
      onChange(movimientos.map((movimiento, index) =>
        index === indiceEdicion ? crearMovimientoVacio(borrador) : movimiento,
      ));
      limpiarCompositor();
      return;
    }

    if (movimientos.length >= maximo) return;
    onChange([...movimientos, crearMovimientoVacio(borrador)]);
    limpiarCompositor();
  };

  const editarMovimiento = (index) => {
    setBorrador(crearMovimientoVacio(movimientos[index]));
    setIndiceEdicion(index);
    setError("");
    enfocarCompositor();
  };

  const eliminarMovimiento = (index) => {
    onChange(movimientos.filter((_, movimientoIndex) => movimientoIndex !== index));
    if (indiceEdicion === index) limpiarCompositor();
    if (indiceEdicion !== null && index < indiceEdicion) setIndiceEdicion(indiceEdicion - 1);
  };

  const totalPorTipo = (tipo) => movimientos
    .filter((movimiento) => tipo === "ADELANTO"
      ? ["ADELANTO", "PAGO"].includes(movimiento.tipo)
      : movimiento.tipo === tipo)
    .reduce((total, movimiento) => total + (Number(movimiento.monto) || 0), 0);

  const impactoNeto = movimientos.reduce(
    (total, movimiento) => total + calcularImpactoMovimiento(movimiento),
    0,
  );

  return (
    <section className="movimientos-list">
      <div className="movimiento-compositor" ref={compositorRef}>
        <div className="movimientos-list-header">
          <div>
            <strong className="form-info-title">
              {indiceEdicion === null ? "Nuevo movimiento" : `Editando movimiento ${indiceEdicion + 1}`}
            </strong>
            <span className="movimiento-compositor-hint">Completá los datos y agregalo a la lista.</span>
          </div>
          <span>{movimientos.length}/{maximo}</span>
        </div>
        <div className="movimiento-compositor-fields">
          {campos.map((campo) => (
            <InputForm
              key={campo.key}
              campo={campo}
              value={borrador[campo.key]}
              onChange={cambiarBorrador}
              opciones={campo.key === "tipo" ? opcionesTipo : []}
            />
          ))}
        </div>
        {error && <p className="movimiento-compositor-error">{error}</p>}
        <div className="movimiento-compositor-actions">
          {indiceEdicion !== null && (
            <TextButton text="Cancelar edición" variant="secondary" onClick={limpiarCompositor} />
          )}
          <TextButton
            text={indiceEdicion === null ? "Agregar movimiento" : "Actualizar movimiento"}
            onClick={confirmarMovimiento}
            disabled={indiceEdicion === null && movimientos.length >= maximo}
          />
        </div>
      </div>

      <div className="movimientos-list-heading">
        <strong>Movimientos cargados</strong>
        <span>{movimientos.length === 1 ? "1 movimiento" : `${movimientos.length} movimientos`}</span>
      </div>
      <div className="movimientos-list-items">
        {movimientos.length === 0 ? (
          <div className="movimientos-empty">Todavía no agregaste movimientos.</div>
        ) : movimientos.map((movimiento, index) => (
          <article className={`movimiento-item ${indiceEdicion === index ? "is-editing" : ""}`} key={index}>
            <span className="movimiento-item-order">{index + 1}</span>
            <div className="movimiento-item-main">
              <strong>{movimiento.tipo}</strong>
              <span>{movimiento.detalle || "Sin detalle"}</span>
            </div>
            <strong className="movimiento-item-amount">$ {formatearMonto(Number(movimiento.monto) || 0)}</strong>
            <div className="movimiento-item-actions">
              <button type="button" onClick={() => editarMovimiento(index)}>Editar</button>
              <button type="button" onClick={() => eliminarMovimiento(index)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
      <div className="movimientos-summary">
        <div><span>Cantidad</span><strong>{movimientos.length}</strong></div>
        <div><span>Adelantos / Pagos</span><strong>$ {formatearMonto(totalPorTipo("ADELANTO"))}</strong></div>
        <div><span>Gastos</span><strong>$ {formatearMonto(totalPorTipo("GASTO"))}</strong></div>
        <div><span>Cobros</span><strong>$ {formatearMonto(totalPorTipo("COBRO"))}</strong></div>
        <div className="movimientos-summary-total"><span>Impacto neto</span><strong>$ {formatearMonto(impactoNeto)}</strong></div>
      </div>
    </section>
  );
};

export default MovimientosList;
