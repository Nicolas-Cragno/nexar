//------------------------------------------------------ externos
import { useState } from "react";
//------------------------------------------------------ elementos
import InputForm from "../inputs/InputForm";
import DeleteButton from "../buttons/DeleteButton";
import TextButton from "../buttons/TextButton";
import EventCard from "../cards/EventCard";
//------------------------------------------------------ estilos
import "../formularios/css/Forms.css";

const FormListGroup = ({
  items = [],
  value = [],
  opciones = [],
  title = "Destinos",
  onChange,
}) => {
  const [nuevoRegistro, setNuevoRegistro] = useState({});

  const handleCampoChange = (key, valor) => {
    setNuevoRegistro((prev) => ({
      ...prev,
      [key]: valor,
    }));
  };

  const handleAgregar = () => {
    onChange([...value, nuevoRegistro]);

    setNuevoRegistro({});
  };

  const handleEliminar = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="form-box-doble">
      {items.map((item) => (
        <InputForm
          key={item.key}
          campo={item}
          value={nuevoRegistro[item.key]}
          onChange={handleCampoChange}
          opciones={opciones}
        />
      ))}

      <TextButton
        text="+ Agregar"
        mini={true}
        type="button"
        onClick={handleAgregar}
      />

      {value.length > 0 && (
        <ul className="form-box">
          {value.map((registro, index) => (
            <EventCard
              key={index}
              order={index + 1}
              date={registro.fecha}
              txt1={registro.cliente}
              txt2={registro.carga}
              txt3={registro.detalle}
              onClick={() => handleEliminar(index)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormListGroup;
