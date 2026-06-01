//------------------------------------------------------ externos
import { serverTimestamp } from "firebase/firestore";
import { useState } from "react";
//------------------------------------------------------ elementos
import InputForm from "../inputs/InputForm";
import DeleteButton from "../buttons/DeleteButton";
import TextButton from "../buttons/TextButton";
import TripCard from "../cards/TripCard";
//------------------------------------------------------ estilos
import "../formularios/css/Forms.css";

const FormListTramos = ({
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
    const fechaSalida = new Date();

    const nuevoTramo = {
      ...nuevoRegistro,
      fechaSalida,
    };

    let nuevosTramos = [...value];

    // cerrar tramo anterior por defecto con fecha de inicio del nuevo tramo
    if (nuevosTramos.length > 0) {
      const ultimoIndex = nuevosTramos.length - 1;

      nuevosTramos[ultimoIndex] = {
        ...nuevosTramos[ultimoIndex],
        fechaLlegada: fechaSalida,
        lugarLlegada: nuevoRegistro.lugarSalida,
      };
    }

    onChange([...nuevosTramos, nuevoTramo]);

    setNuevoRegistro({});
  };

  const handleEliminar = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="form-list-tramos">
      <div className="form-list-tramos-left">
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
      </div>

      <div className="form-list-tramos-right">
        {value.length > 0 && (
          <ul className="form-box">
            {value.map((registro, index) => (
              <TripCard
                key={index}
                order={index + 1}
                dateInit={registro.fechaSalida}
                placeInit={registro.lugarSalida}
                dateEnd={registro.fechaLlegada}
                placeEnd={registro.lugarLlegada}
                coments={registro.detalle}
                onClick={() => handleEliminar(index)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FormListTramos;
