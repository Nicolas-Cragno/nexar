import "./css/Buttons.css";

const DeleteButton = ({ onClose }) => {
  return (
    <button className="delete-button" onClick={onClose}>
      ✕
    </button>
  );
};

export default DeleteButton;
