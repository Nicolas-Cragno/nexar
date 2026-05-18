import "./css/ItemCard.css";

const ItemCard = ({ logo, logoColor = "#000", title, txt1, txt2 }) => {
  return (
    <div className="item-card">
      <div className="item-card-logo col-md-1" style={{ color: logoColor }}>
        {logo}
      </div>
      <div className="item-card-content col-md-11">
        <div className="col-md-2 item-card-content-item">
          <strong>{txt1}</strong>
        </div>
        <div className="col-md-8 item-card-content-item">
          <span>{title}</span>
        </div>
        <div className="col-md-2 item-card-content-item">
          <span>{txt2}</span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
