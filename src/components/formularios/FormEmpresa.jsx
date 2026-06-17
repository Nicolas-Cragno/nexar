//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { submitEmpresa } from "./data/Submits";
import { elementos } from "./data/FormContent";
//------------------------------------------------------ estilos
import "./css/Forms.css";
import { capitalizarTexto } from "../../functions/dataFunctions";

const FormEmpresa = ({
  elemento = null,
  filtro = "empresa",
  onGuardar,
  onClose,
}) => {
  const modoEdicion = !!elemento;
  const titulo = modoEdicion ? "Editar" : "Agregar";
  const subtitulo = capitalizarTexto(filtro);
  const campos = elementos["empresas"];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // información específica
    id: elemento?.id || "",
    cuit: elemento?.cuit || "",
    razonSocial: elemento?.razonSocial || "",
    nombre: elemento?.nombre || "",
    ubicacion: elemento?.ubicacion || "",
    tipo: elemento?.tipo || "",
    // información laboral
    // detalles y comentarios
    detalle: elemento?.detalle || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitEmpresa(
      formData,
      campos,
      setLoading,
      onGuardar,
      onClose,
      modoEdicion,
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

export default FormEmpresa;
