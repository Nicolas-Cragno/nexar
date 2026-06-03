import { useState } from "react";
import TextButton from "../buttons/TextButton";
import DeleteButton from "../buttons/DeleteButton";

const FormToDo = ({ value = [], onChange, title = "Adelantos" }) => {
  const [nuevoMonto, setNuevoMonto] = useState("");

  const handleAgregar = () => {
    if (!nuevoMonto || Number(nuevoMonto) <= 0) return;

    const nuevoRegistro = {
      fecha: new Date(),
      monto: Number(nuevoMonto),
    };

    onChange([...value, nuevoRegistro]);
    setNuevoMonto("");
  };

  const handleEliminar = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const total = value.reduce((acc, item) => acc + Number(item.monto || 0), 0);

  return (
    <div className="form-list-tramos-tb">
      <div className="form-list-tramos-top">
        <input
          className="form-input"
          type="number"
          placeholder="Monto"
          value={nuevoMonto}
          onChange={(e) => setNuevoMonto(e.target.value)}
        />

        <TextButton
          text="+ Agregar"
          mini={true}
          type="button"
          onClick={handleAgregar}
        />
      </div>

      <div className="form-list-tramos-bottom">
        {value.length > 0 && (
          <div className="adelanto-list">
            {value.map((registro, index) => (
              <div key={index} className="adelanto-card">
                <div className="adelanto-info">
                  <strong className="adelanto-monto">
                    ${Number(registro.monto || 0).toLocaleString("es-AR")}
                  </strong>

                  {registro.fecha && (
                    <span className="adelanto-fecha">
                      {new Date(registro.fecha).toLocaleDateString("es-AR")}
                    </span>
                  )}
                </div>

                <DeleteButton
                  mini={true}
                  onClose={() => handleEliminar(index)}
                />
              </div>
            ))}
          </div>
        )}

        <div className="form-list-total">
          <strong>Total Adelantos: ${total.toLocaleString("es-AR")}</strong>
        </div>
      </div>
    </div>
  );
};

export default FormToDo;
