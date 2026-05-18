//------------------------------------------------------ externos
import { useEffect, useState } from "react";
//------------------------------------------------------ elementos
import FormContent from "../funcionales/FormContent";
import FormHeader from "../funcionales/FormHeader";
import TextButton from "../buttons/TextButton";
import Loading from "../../routes/Loading";
//------------------------------------------------------ funciones
import { cargarSelects } from "../../functions/dataFunctions";
import { submitPersona } from "./data/Submits";
import { elementos } from "./data/FormContent";
//------------------------------------------------------ estilos
import "./css/Forms.css";

const FormPersona = ({ elemento = null, onGuardar, onClose }) => {
  const modoEdicion = !!elemento;
  const titulo = modoEdicion ? "Editar" : "Agregar";
  const subtitulo = "Persona";
  const campos = elementos["personas"];

  const [loading, setLoading] = useState(true);
  const [listas, setListas] = useState({}); //para los selects, recibe un array tipo {tractores: ..., furgones: ...}
  const [formData, setFormData] = useState({
    // información personal
    id: elemento?.id || "",
    apellido: elemento?.apellido || "",
    nombres: elemento?.nombres || "",
    nacimiento: elemento?.nacimiento || "",
    ubicacion: elemento?.ubicacion || "",
    // información laboral
    legajo: elemento?.legajo || "",
    empresa: elemento?.empresa || "",
    tipo: elemento?.tipo || "",
    puesto: elemento?.puesto || "",
    especializacion: elemento?.especializacion || "",
    sucursal: elemento?.sucursal || "",
    ingreso: elemento?.ingreso || "",
    // detalles y comentarios
    detalle: elemento?.detalle || "",
    comentario: elemento?.comentario || "",
    alerta: elemento?.alerta || "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      const data = await cargarSelects(); // trae TODOS
      setListas(data);
    };

    cargarDatos();
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await submitPersona(
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

export default FormPersona;
