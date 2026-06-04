//------------------------------------------------------ externos
import { useState } from "react";
import Swal from "sweetalert2";
//------------------------------------------------------ elementos
import FormMovimientoCuenta from "./FormMovimientoCuenta";
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import {
  submitCruce,
  submitMovimientoCuenta,
  submitViaje,
} from "./data/Submits";
import { eventos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormViaje = ({ elemento = null, onGuardar, onClose }) => {
  const titulo = "Registro";
  const subtitulo = "Viaje";
  const campos = eventos["viajes"];
  const [loading, setLoading] = useState(false);
  const [formMovimientoCuentaVisible, setFormMovimientoCuentaVisible] =
    useState(false);
  const [formData, setFormData] = useState({
    area: "TRAFICO",
    tipo: elemento?.tipo || "",
    operador: elemento?.operador || "",
    persona: elemento?.persona || "",
    adelanto: 0, // total de adelantos (para submit y crear evento de mov de cuenta)
    adelantos: [], // listado de adelantos que se reinicia a cero
    detalle: elemento?.detalle || "",
    monto: elemento?.monto || 0,
  });
  const { contadores, ubicaciones, sectores, cuentaCorriente } = useData();
  const [nuevoViaje, setNuevoViaje] = useState(null);

  const handleCloseFormMovimientoCuenta = () => {
    setFormMovimientoCuentaVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const viajeCreado = await submitViaje(
      formData,
      campos,
      contadores,
      ubicaciones,
      setLoading,
      onGuardar,
      onClose,
      false,
      elemento?.id,
    );

    if (!viajeCreado) return;

    setNuevoViaje(viajeCreado);

    // registrar evento de movimiento de cuenta (por adelantos)

    if (viajeCreado.movimiento) {
      const cuentaPersona = cuentaCorriente.find(
        (cc) => String(cc.dni) === String(viajeCreado.persona),
      );

      await submitMovimientoCuenta(
        {
          viaje: viajeCreado.id,
          tipo: "PAGO",
          operador: viajeCreado.operador,
          persona: cuentaPersona.id,
          monto: viajeCreado.adelanto,
        },
        eventos.cuentaCorriente,
        sectores,
        setLoading,
      );
    }

    // generar cruce de barcaza (opcional)
    const cruce = await Swal.fire({
      title: "Viaje registrado",
      text: "¿Desea generar cruce de barcaza?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí",
      cancelButtonText: "No",
      confirmButtonColor: "#4161bd",
    });

    if (cruce.isConfirmed) {
      await submitCruce(
        {
          viaje: viajeCreado.id,
          persona: viajeCreado.persona,
          tractor: viajeCreado.tractor,
          furgon: viajeCreado.furgon,
        },
        eventos.cruces,
        contadores,
        ubicaciones,
        setLoading,
        onGuardar,
        onClose,
      );
    } else {
      onClose();
    }
  };

  return (
    <>
      <div className="doble-form">
        {loading ? (
          <Loading />
        ) : (
          <div className="doble-form-content">
            <FormHeader title={titulo} subTitle={subtitulo} onClose={onClose} />

            <div className="doble-form-modal">
              <FormContent
                elemento={elemento}
                campos={campos}
                data={formData}
                setData={setFormData}
                isDouble={true}
              />
            </div>
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
      {formMovimientoCuentaVisible && (
        <FormMovimientoCuenta
          elemento={nuevoViaje}
          onClose={handleCloseFormMovimientoCuenta}
          desdeViaje={true}
        />
      )}
    </>
  );
};

export default FormViaje;
