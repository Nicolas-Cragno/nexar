//------------------------------------------------------ externos
import { useState, useEffect } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { submitCruce } from "./data/Submits";
import { eventos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
//------------------------------------------------------ estilos
import "./css/Forms.css";
import { useViajes } from "../../contexto/ViajesContext";

const FormCruce = ({ elemento = null, onGuardar, onClose }) => {
  const titulo = "Solicitud";
  const subtitulo = "Cruce de barcaza";
  const campos = eventos["cruces"];
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [formData, setFormData] = useState({
    area: "TRAFICO",
    viaje: elemento?.viaje || "",
    persona: elemento?.persona || "",
    tractor: elemento?.tractor || "",
    furgon: elemento?.furgon || "",
    detalle: elemento?.detalle || "",
  });
  const { contadores, ubicaciones } = useData();
  const { viajes } = useViajes();

  useEffect(() => {
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
      tractor: viajeSeleccionado.tractor,
      furgon: viajeSeleccionado.furgon,
    }));
    setReadOnly(true);
  }, [formData.viaje, viajes]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitCruce(
      formData,
      campos,
      contadores,
      ubicaciones,
      setLoading,
      onGuardar,
      onClose,
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
            isDouble={true}
            readOnly={readOnly}
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

export default FormCruce;
