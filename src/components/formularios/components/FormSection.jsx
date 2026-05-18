import InputForm from "../../inputs/InputForm";
import "../css/Forms.css";

const FormSection = ({
  title,
  campos,
  formData,
  handleChange,
  cargarOpciones,
  modoEdicion,
}) => {
  if (!campos.length) return null;

  return (
    <>
      <label>
        <strong className="form-info-title">{title}</strong>
      </label>

      <div className="form-info-box">
        {campos.map((campo) => (
          <InputForm
            key={campo.key}
            campo={campo}
            value={formData[campo.key]}
            onChange={handleChange}
            cargarOpciones={cargarOpciones}
            modoEdicion={modoEdicion}
          />
        ))}
      </div>
    </>
  );
};

export default FormSection;
