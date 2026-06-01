//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { submitViaje } from "./data/Submits";
import { eventos } from "./data/FormContent";
import { useData } from "../../contexto/DataContext";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormMovimientoCuenta = ({ elemento = null, onGuardar, onClose }) => {
  const titulo = "Movimiento";
  const subtitulo = "Cuenta Corriente";
  const campos = eventos["viajes"];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    area: "ADMINISTRACION",
    tipo: elemento?.tipo || "",
    operador: elemento?.operador || "",
    persona: elemento?.persona || "",
    detalle: elemento?.detalle || "",
    monto: elemento?.monto || 0,
  });
  const { sectores } = useData();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitViaje(
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
  );
};

export default FormMovimientoCuenta;
