import { formatearCampoFirestore } from "../../functions/dataFunctions";
import DeleteButton from "../buttons/DeleteButton";
import "./css/EventCard.css";

const EventCard = ({
  order,
  txt1,
  txt2,
  txt3,
  label1 = "Cliente",
  label2 = "Carga",
  label3 = "Detalle",
  onClick,
}) => {
  return (
    <div className="event-card-wrapper">
      <div className="event-card">
        <div className="event-card-content">
          <div className="event-card-content">
            <span className="event-card-item">
              <strong className="event-card-label">
                {formatearCampoFirestore(txt1)}
              </strong>
              {formatearCampoFirestore(txt2)}
            </span>
          </div>

          <div className="event-card-footer">
            {formatearCampoFirestore(txt3)}
          </div>
        </div>
      </div>

      <DeleteButton onClose={onClick} />
    </div>
  );
};

export default EventCard;
