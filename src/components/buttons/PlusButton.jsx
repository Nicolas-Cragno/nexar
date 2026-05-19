import "./css/Buttons.css";

const PlusButton = ({ onClick }) => {
  return (
    <button className="plus-button" onClick={onClick}>
      +
    </button>
  );
};

export default PlusButton;
