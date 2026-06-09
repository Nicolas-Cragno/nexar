import { formatearCampoFirestore } from "../../functions/dataFunctions";
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
}) => {
  return (
    <div className="trip-card-wrapper">
      <div className="trip-card">
        <div className="trip-card-content">
          <div className="trip-card-content">
            <span className="trip-card-item">
              <strong className="trip-card-label hour">
                {formatearCampoFirestore(dateInit, true)}
              </strong>
              <span className="trip-card-label">
                {formatearCampoFirestore(placeInit)}
              </span>
            </span>
          </div>
          <div className="trip-card-content">
            <span className="trip-card-item">
              <strong className="trip-card-label hour">
                {formatearCampoFirestore(dateEnd, true)}
              </strong>
              <span className="trip-card-label">
                {formatearCampoFirestore(placeEnd)}
              </span>
            </span>
          </div>
          {/*
          <div className="trip-card-footer">
            {formatearCampoFirestore(coments)}
          </div>
            */}
        </div>
      </div>

      <DeleteButton onClose={onClick} mini={true} />
    </div>
  );
};

export default TripCard;
