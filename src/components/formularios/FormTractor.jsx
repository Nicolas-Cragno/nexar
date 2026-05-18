//------------------------------------------------------ externos
import { useEffect, useState } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { cargarSelects } from "../../functions/dataFunctions";
import { submitTractor } from "./data/Submits";
import { elementos } from "./data/FormContent";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormTractor = ({ elemento = null, onGuardar, onClose }) => {
  const modoEdicion = !!elemento;
  const titulo = modoEdicion ? "Editar" : "Agregar";
  const subtitulo = "Tractor";
  const campos = elementos["tractores"];

  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState({}); //para los selects, recibe un array tipo {tractores: ..., furgones: ...}
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

  useEffect(() => {
    const cargarDatos = async () => {
      const data = await cargarSelects(); // trae TODOS los listados, ver si se puede mejorar desp
      setListas(data);
    };

    cargarDatos();
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitTractor(
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
            opciones={listas}
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

export default FormTractor;
