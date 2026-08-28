import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
import MovimientosList, {
  crearMovimientoVacio,
} from "./components/MovimientosList";
import { submitMovimientosCuenta } from "./data/Submits";
import {
  movimientoCuentaCamposComunes,
  movimientoCuentaCamposItem,
} from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
import { useViajes } from "../../contexto/ViajesContext";
import { usePersonas } from "../../contexto/PersonasContext";
import "./css/Forms.css";

const FormMovimientoCuenta = ({
  elemento = null,
  onGuardar,
  onClose,
  desdeViaje = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [datosComunes, setDatosComunes] = useState({
    viaje: elemento?.viaje || "",
    operador: elemento?.operador || "",
    persona: elemento?.persona || elemento?.personas || "",
  });
  const [movimientos, setMovimientos] = useState([]);
  const [cuentaError, setCuentaError] = useState("");

  const { ubicaciones, cuentaCorriente } = useData();
  const { viajes } = useViajes();
  const { personas } = usePersonas();

  useEffect(() => {
    if (!desdeViaje || !elemento) return;

    const cuentaPersona = cuentaCorriente.find(
      (cuenta) => String(cuenta.dni) === String(elemento.persona),
    );

    setCuentaError(
      cuentaPersona ? "" : "El chofer del viaje no tiene una cuenta corriente asociada.",
    );
    setDatosComunes({
      viaje: elemento.id,
      operador: elemento.operador || "",
      persona: cuentaPersona?.id || "",
    });
    setReadOnly(true);
  }, [cuentaCorriente, desdeViaje, elemento]);

  useEffect(() => {
    if (desdeViaje) return;

    if (!datosComunes.viaje) {
      setCuentaError("");
      setReadOnly(false);
      return;
    }

    const viajeSeleccionado = viajes.find(
      (viaje) => String(viaje.id) === String(datosComunes.viaje),
    );

    if (!viajeSeleccionado) {
      setCuentaError("El viaje seleccionado ya no está disponible.");
      setReadOnly(false);
      return;
    }

    const cuentaPersona = cuentaCorriente.find(
      (cuenta) => String(cuenta.dni) === String(viajeSeleccionado.persona),
    );

    if (!cuentaPersona) {
      setCuentaError("El chofer del viaje no tiene una cuenta corriente asociada.");
      setDatosComunes((previo) => ({ ...previo, persona: "" }));
      setReadOnly(true);
      return;
    }

    setCuentaError("");
    setDatosComunes((previo) => ({ ...previo, persona: cuentaPersona.id }));
    setReadOnly(true);
  }, [cuentaCorriente, datosComunes.viaje, desdeViaje, viajes]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (cuentaError) {
      await Swal.fire({
        title: "Cuenta corriente no disponible",
        text: cuentaError,
        icon: "error",
        confirmButtonColor: "#4161bd",
      });
      return;
    }

    const operador = personas.find(
      (persona) => String(persona.id) === String(datosComunes.operador),
    );

    await submitMovimientosCuenta({
      datosComunes,
      movimientos,
      ubicaciones,
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
        <div className="doble-form-content movimiento-form-content">
          <FormHeader title="Movimiento" subTitle="Cuenta Corriente" onClose={onClose} />
          <div className="doble-form-modal movimiento-form-layout">
            <FormContent
              elemento={elemento}
              campos={movimientoCuentaCamposComunes}
              data={datosComunes}
              setData={setDatosComunes}
              readOnly={readOnly}
              isDouble
            />
            <div className="doble-form-right">
              {cuentaError && <p className="complete">{cuentaError}</p>}
              <MovimientosList
                campos={movimientoCuentaCamposItem}
                movimientos={movimientos}
                onChange={setMovimientos}
                maximo={25}
                movimientoInicial={crearMovimientoVacio({
                  tipo: elemento?.tipo || (desdeViaje ? "PAGO" : ""),
                  monto: elemento?.monto || elemento?.adelanto || "",
                  detalle:
                    elemento?.detalle ||
                    (desdeViaje && elemento?.id ? `ADELANTO VIAJE ${elemento.id}` : ""),
                })}
              />
            </div>
          </div>
          <div className="form-buttons">
            <TextButton text="Guardar movimientos" type="button" onClick={handleSubmit} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormMovimientoCuenta;
