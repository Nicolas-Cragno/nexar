import Select from "react-select";
import { formatearCampoFirestore } from "../../functions/dataFunctions";
import FormList from "../funcionales/FormList";

const InputForm = ({ campo, value, onChange, opciones, modoEdicion }) => {
  const disabled = modoEdicion && campo.isId && campo.notChange;

  return (
    <div className="form-info">
      {campo.inputType !== "boolean" && (
        <strong>
          {campo.label}
          {campo.important && <span className="complete"> * obligatorio</span>}
        </strong>
      )}

      {/* INPUT */}
      {campo.inputType === "input" && (
        <input
          className="form-input"
          style={
            campo.dato === "text" ? { textTransform: "uppercase" } : undefined
          }
          type={campo.dato === "number" ? "number" : "text"}
          value={value ?? ""}
          onChange={(e) => onChange(campo.key, e.target.value)}
          disabled={disabled}
        />
      )}

      {/* TEXTAREA */}
      {campo.inputType === "textarea" && (
        <textarea
          className="form-textarea"
          value={value ?? ""}
          onChange={(e) => onChange(campo.key, e.target.value)}
          disabled={disabled}
        />
      )}

      {/* SELECT (inputOptions)*/}
      {campo.inputType === "inputOptions" && (
        <Select
          className="form-input"
          classNamePrefix="react-select"
          options={[
            { value: "", label: "SIN ASIGNAR" },
            ...(opciones[campo.optionsList] || []),
          ]}
          value={
            (opciones[campo.optionsList] || []).find(
              (opt) => opt.value === formatearCampoFirestore(value),
            ) || null
          }
          onChange={(opt) => onChange(campo.key, opt ? opt.value : "")}
          isClearable
          placeholder="Seleccionar..."
          noOptionsMessage={() => "Sin opciones"}
        />
      )}

      {/* MULTI SELECT (multiOptions) */}
      {campo.inputType === "multiOptions" && (
        <Select
          isMulti
          className="form-input"
          classNamePrefix="react-select"
          options={opciones[campo.optionsList] || []}
          value={(opciones[campo.optionsList] || []).filter((opt) =>
            (value || []).includes(opt.value),
          )}
          onChange={(opts) =>
            onChange(campo.key, opts ? opts.map((o) => o.value) : [])
          }
          placeholder="Seleccionar..."
          noOptionsMessage={() => "Sin opciones"}
        />
      )}

      {/* BOOLEAN */}
      {campo.inputType === "boolean" && (
        <div className="boolean-container">
          <button
            type="button"
            className={`boolean-btn ${value ? "activo" : ""}`}
            onClick={() => onChange(campo.key, !value)}
          >
            {value ? campo.positive : campo.negative}
          </button>
        </div>
      )}

      {/* BOOLEAN DOUBLE */}
      {campo.inputType === "booleanDouble" && (
        <div className="type-container">
          <button
            type="button"
            className={
              value === campo.optionOne ? "type-btn active" : "type-btn"
            }
            onClick={() => onChange(campo.key, campo.optionOne)}
          >
            {campo.optionOne}
          </button>

          <button
            type="button"
            className={
              value === campo.optionTwo ? "type-btn active-green" : "type-btn"
            }
            onClick={() => onChange(campo.key, campo.optionTwo)}
          >
            {campo.optionTwo}
          </button>
        </div>
      )}

      {/* GROUP */}
      {campo.type === "group" && <div className="container">aaaaaaa</div>}
    </div>
  );
};

export default InputForm;
