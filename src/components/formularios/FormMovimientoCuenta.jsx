//------------------------------------------------------ externos
import { useState, useEffect } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { submitMovimientoCuenta } from "./data/Submits";
import { eventos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
import { useViajes } from "../../contexto/ViajesContext";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormMovimientoCuenta = ({
  elemento = null,
  onGuardar,
  onClose,
  desdeViaje = false,
}) => {
  const titulo = "Movimiento";
  const subtitulo = "Cuenta Corriente";
  const campos = eventos["cuentaCorriente"];

  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const [formData, setFormData] = useState({
    area: "ADMINISTRACION",
    viaje: "",
    tipo: "",
    operador: "",
    persona: "",
    detalle: "",
    monto: 0,
  });

  const { sectores } = useData();
  const { viajes } = useViajes();

  useEffect(() => {
    if (!desdeViaje || !elemento) return;

    setFormData({
      area: "ADMINISTRACION",
      viaje: elemento?.id,
      tipo: "PAGO",
      operador: elemento?.operador,
      persona: elemento?.persona,
      tractor: elemento?.tractor,
      detalle: `ADELANTO VIAJE ${elemento?.id}`,
      monto: elemento?.monto || 0,
    });

    setReadOnly(true);
  }, [elemento, desdeViaje]);

  useEffect(() => {
    if (desdeViaje) return;

    if (!formData.viaje) {
      setReadOnly(false);
      return;
    }

    const viajeSeleccionado = viajes.find((vj) => vj.id === formData.viaje);

    if (!viajeSeleccionado) {
      setReadOnly(false);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      persona: viajeSeleccionado.persona,
    }));

    setReadOnly(true);
  }, [formData.viaje, viajes, desdeViaje]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitMovimientoCuenta(
      formData,
      campos,
      sectores,
      setLoading,
      onGuardar,
      onClose,
      false,
      elemento?.id,
    );
  };

  return (
    <div className="form">
      {loading ? (
        <Loading />
      ) : (
        <div className="form-content">
          <FormHeader title={titulo} subTitle={subtitulo} onClose={onClose} />

          <FormContent
            elemento={elemento}
            campos={campos}
            data={formData}
            setData={setFormData}
            readOnly={readOnly}
            desdeViaje={desdeViaje}
          />

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

export default FormMovimientoCuenta;
