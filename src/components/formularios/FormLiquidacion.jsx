import { useEffect, useMemo, useState } from "react";
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
import { eventos } from "./data/FormContent";
import {
  calcularImpactoMovimiento,
  submitLiquidacion,
} from "./data/Submits";
import { formatearMonto } from "../../functions/dataFunctions";
import { useData } from "../../contexto/DataContext";
import { useMovimientos } from "../../contexto/MovimientosContext";
import { usePersonas } from "../../contexto/PersonasContext";
import "./css/Forms.css";

const FormLiquidacion = ({ onGuardar, onClose, cuentaInicial = "" }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cuenta: cuentaInicial,
    operador: "",
    detalle: "",
    movimientos: [],
  });
  const { ubicaciones, contadores } = useData();
  const { movimientos } = useMovimientos();
  const { personas } = usePersonas();

  const pendientes = useMemo(
    () =>
      movimientos.filter(
        (movimiento) =>
          movimiento.estado === false && movimiento.anulado !== true &&
          String(movimiento.cuenta || movimiento.persona) ===
            String(formData.cuenta),
      ),
    [movimientos, formData.cuenta],
  );

  const seleccionados = useMemo(
    () =>
      pendientes.filter((movimiento) =>
        formData.movimientos.includes(movimiento.id),
      ),
    [pendientes, formData.movimientos],
  );

  const resumen = useMemo(() => {
    const total = (tipo) =>
      seleccionados
        .filter((movimiento) =>
          tipo === "ADELANTO"
            ? movimiento.tipo === "ADELANTO" || movimiento.tipo === "PAGO"
            : movimiento.tipo === tipo,
        )
        .reduce((suma, movimiento) => suma + (Number(movimiento.monto) || 0), 0);

    return {
      adelantos: total("ADELANTO"),
      gastos: total("GASTO"),
      cobros: total("COBRO"),
      saldo: seleccionados.reduce(
        (suma, movimiento) => suma + calcularImpactoMovimiento(movimiento),
        0,
      ),
    };
  }, [seleccionados]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, movimientos: [] }));
  }, [formData.cuenta]);

  const toggleMovimiento = (id) => {
    setFormData((prev) => ({
      ...prev,
      movimientos: prev.movimientos.includes(id)
        ? prev.movimientos.filter((movimientoId) => movimientoId !== id)
        : [...prev.movimientos, id],
    }));
  };

  const seleccionarTodos = () => {
    setFormData((prev) => ({
      ...prev,
      movimientos:
        prev.movimientos.length === pendientes.length
          ? []
          : pendientes.map((movimiento) => movimiento.id),
    }));
  };

  const tipoCierre =
    resumen.saldo > 0
      ? "COBRO"
      : resumen.saldo < 0
        ? "ADELANTO (requiere confirmación)"
        : "SIN MOVIMIENTO";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const operador = personas.find(
      (persona) => String(persona.id) === String(formData.operador),
    );

    await submitLiquidacion({
      formData: { ...formData, movimientos: seleccionados },
      ubicaciones,
      contadores,
      sucursal: operador?.sucursal || "01",
      loading: setLoading,
      onGuardar,
      onClose,
    });
  };

  return (
    <div className="doble-form">
      {loading ? (
        <Loading />
      ) : (
        <div className="doble-form-content">
          <FormHeader
            title="Registro"
            subTitle="Liquidación"
            onClose={onClose}
          />
          <div className="doble-form-modal">
            <FormContent
              campos={eventos.liquidaciones}
              data={formData}
              setData={setFormData}
              isDouble={true}
            />

            <div className="doble-form-left">
              <label>
                <strong className="form-info-title">Movimientos pendientes</strong>
              </label>
              <div className="form-info-box">
                {!formData.cuenta && <p>Seleccione una cuenta corriente.</p>}
                {formData.cuenta && pendientes.length === 0 && (
                  <p>No hay movimientos pendientes para esta cuenta.</p>
                )}
                {pendientes.length > 0 && (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={seleccionados.length === pendientes.length}
                        onChange={seleccionarTodos}
                      />{" "}
                      Seleccionar todos ({pendientes.length})
                    </label>
                    {pendientes.map((movimiento) => (
                      <label key={movimiento.id} style={{ display: "block", marginTop: 8 }}>
                        <input
                          type="checkbox"
                          checked={formData.movimientos.includes(movimiento.id)}
                          onChange={() => toggleMovimiento(movimiento.id)}
                        />{" "}
                        {movimiento.id} · {movimiento.tipo} · ${" "}
                        {formatearMonto(movimiento.monto)}
                      </label>
                    ))}
                  </>
                )}
              </div>

              <label>
                <strong className="form-info-title">Resumen</strong>
              </label>
              <div className="form-info-box">
                <p>Adelantos: $ {formatearMonto(resumen.adelantos)}</p>
                <p>Gastos: $ {formatearMonto(resumen.gastos)}</p>
                <p>Cobros: $ {formatearMonto(resumen.cobros)}</p>
                <p><strong>Saldo neto: $ {formatearMonto(resumen.saldo)}</strong></p>
                <p>Cierre: <strong>{tipoCierre}</strong></p>
              </div>
            </div>
          </div>
          <div className="form-buttons">
            <TextButton
              text="Liquidar"
              type="button"
              onClick={handleSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormLiquidacion;
