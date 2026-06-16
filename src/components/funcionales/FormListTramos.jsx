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
import { formatearCampoParaCarga } from "../../functions/dataFunctions";

const FormListTramos = ({
  items = [],
  value = [],
  opciones = [],
  title = "Destinos",
  onChange,
}) => {
  const [nuevoRegistro, setNuevoRegistro] = useState({});

  const handleCampoChange = (key, valor, label = null) => {
    setNuevoRegistro((prev) => ({
      ...prev,
      [key]: valor,
      [`${key}Label`]: label,
    }));
  };

  const handleModificarTramo = (index, campo, valor) => {
    const nuevosTramos = [...value];

    nuevosTramos[index] = {
      ...nuevosTramos[index],
      [campo]: formatearCampoParaCarga(valor, "date"),
    };
    console.log("TRAMOS:", nuevosTramos);
    onChange(nuevosTramos);
  };

  const handleAgregar = () => {
    const ahora = new Date();

    const nuevoTramo = {
      ...nuevoRegistro,
      fechaSalida: ahora,
      fechaLlegada: ahora,
    };

    let nuevosTramos = [...value];

    // cerrar tramo anterior por defecto con fecha de inicio del nuevo tramo
    /*
    if (nuevosTramos.length > 0) {
      const ultimoIndex = nuevosTramos.length - 1;
      
      nuevosTramos[ultimoIndex] = {
        ...nuevosTramos[ultimoIndex],
        fechaLlegada: fechaSalida,
        lugarLlegada: nuevoRegistro.lugarSalida,
      };
    }
    */

    onChange([...nuevosTramos, nuevoTramo]);

    setNuevoRegistro({});
  };

  const handleEliminar = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="form-list-tramos-tb">
      <div className="form-list-tramos-top">
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

      <div className="form-list-tramos-bottom">
        {value.length > 0 && (
          <ul className="form-box">
            {value.map((registro, index) => (
              <TripCard
                key={index}
                order={index + 1}
                dateInit={registro.fechaSalida}
                placeInit={registro.lugarSalidaLabel}
                dateEnd={registro.fechaLlegada}
                placeEnd={registro.lugarLlegadaLabel}
                coments={registro.detalle}
                onClick={() => handleEliminar(index)}
                onChange={(campo, valor) =>
                  handleModificarTramo(index, campo, valor)
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FormListTramos;
