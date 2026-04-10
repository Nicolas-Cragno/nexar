import "./css/MiniCard.css";

const Card = ({ title, value = null, onClick = null }) => {
  return (
    <>
      <div className="mini-card" onClick={onClick}>
        {value ? (
          <>
            <div className="mini-card-section">
              <h3 className="mini-card-title">{title}</h3>
            </div>
            <div className="mini-card-section">
              <p className="mini-card-value big">{value}</p>
            </div>
          </>
        ) : (
          <>
            <div className="mini-card-section">
              <h1 className="mini-card-title">{title}</h1>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Card;
