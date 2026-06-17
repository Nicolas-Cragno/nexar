import { useEffect, useState } from "react";
import {
  formatearCampoFirestore,
  formatearFechaInput,
} from "../../functions/dataFunctions";
import DeleteButton from "../buttons/DeleteButton";
import "./css/TripCard.css";

const TripCard = ({
  order,
  dateInit = new Date(),
  placeInit,
  dateEnd,
  placeEnd = "",
  coments = "",
  onClick,
  onChange,
}) => {
  const [fechaSalida, setFechaSalida] = useState(formatearFechaInput(dateInit));

  const [fechaLlegada, setFechaLlegada] = useState(
    formatearFechaInput(dateEnd),
  );

  // Si el padre cambia los datos, sincronizar
  useEffect(() => {
    setFechaSalida(formatearFechaInput(dateInit));
  }, [dateInit]);

  useEffect(() => {
    setFechaLlegada(formatearFechaInput(dateEnd));
  }, [dateEnd]);

  return (
    <div className="trip-card-wrapper">
      <div className="trip-card">
        <div className="trip-card-content">
          <div className="trip-card-content">
            <span className="trip-card-item">
              <span className="trip-card-label">
                <strong className="form-label">INICIO / SALIDA</strong>
                {formatearCampoFirestore(placeInit)}
              </span>

              <input
                className="form-input-small"
                type="date"
                value={fechaSalida}
                onChange={(e) => setFechaSalida(e.target.value)}
                onBlur={() => onChange("fechaSalida", fechaSalida)}
              />
            </span>
          </div>

          <div className="trip-card-content">
            <span className="trip-card-item">
              <span className="trip-card-label">
                <strong className="form-label">FIN / LLEGADA</strong>
                {formatearCampoFirestore(placeEnd)}
              </span>

              <input
                className="form-input-small"
                type="date"
                value={fechaLlegada}
                onChange={(e) => setFechaLlegada(e.target.value)}
                onBlur={() => onChange("fechaLlegada", fechaLlegada)} // para modificar solo al salir del campo
              />
            </span>
          </div>
        </div>
      </div>

      <DeleteButton onClose={onClick} mini={true} />
    </div>
  );
};

export default TripCard;
