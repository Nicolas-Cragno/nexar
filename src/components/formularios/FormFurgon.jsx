//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { submitFurgon } from "./data/Submits";
import { elementos } from "./data/FormContent";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormFurgon = ({ elemento = null, onGuardar, onClose }) => {
  const modoEdicion = !!elemento;
  const titulo = modoEdicion ? "Editar" : "Agregar";
  const subtitulo = "Furgon";
  const campos = elementos["furgones"];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // información específica
    id: elemento?.id || "",
    chasis: elemento?.chasis || "",
    dominio: elemento?.dominio || "",
    marca: elemento?.marca || "",
    modelo: elemento?.modelo || "",
    motor: elemento?.motor || "",
    // información laboral
    interno: elemento?.interno || "",
    empresa: elemento?.empresa || "",
    persona: elemento?.persona || "",
    satelital: elemento?.satelital || "",
    estado: elemento?.estado || false,
    // detalles y comentarios
    detalle: elemento?.detalle || "",
    comentarioSatelital: elemento?.comentarioSatelital || "",
    detalleSatelital: elemento?.detalleSatelital || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitFurgon(
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

export default FormFurgon;
