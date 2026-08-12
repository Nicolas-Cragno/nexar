//------------------------------------------------------ externos
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
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
import { usePersonas } from "../../contexto/PersonasContext";
import { generarDocumentoCruce } from "../../functions/docFunctions";

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
    furgon: elemento?.furgon || [],
    detalle: elemento?.detalle || "",
  });
  const { contadores, ubicaciones } = useData();
  const { viajes } = useViajes();
  const { personas } = usePersonas();
  const viajeSeleccionado = viajes.find(
    (viaje) => String(viaje.id) === String(formData.viaje),
  );

  useEffect(() => {
    if (!formData.viaje) {
      setReadOnly(false);
      return;
    }
    const viajeSeleccionado = viajes.find(
      (vj) => String(vj.id) === String(formData.viaje) && vj.estado === true,
    );

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

    if (!viajeSeleccionado || viajeSeleccionado.estado !== true) {
      await Swal.fire({
        title: "Viaje no disponible",
        text: "El viaje seleccionado ya no está activo.",
        icon: "error",
        confirmButtonColor: "#4161bd",
      });
      return;
    }

    const personaOperadora = personas.find(
      (persona) => String(persona.id) === String(formData.operador),
    );
    const sucursalOperadora = personaOperadora?.sucursal || "01";

    const cruceCreado = await submitCruce(
      formData,
      campos,
      ubicaciones,
      contadores,
      sucursalOperadora,
      setLoading,
      onGuardar,
      null,
      viajeSeleccionado,
    );

    if (cruceCreado?.elemento) {
      try {
        await generarDocumentoCruce(viajeSeleccionado, cruceCreado.elemento);
      } catch (error) {
        console.error("[Error] al generar el documento del cruce:", error);
        await Swal.fire({
          title: "Cruce guardado",
          text: "El cruce se guardó correctamente, pero no se pudo generar el PDF.",
          icon: "warning",
          confirmButtonColor: "#4161bd",
        });
      } finally {
        if (onClose) onClose();
      }
    }
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
