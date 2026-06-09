import "./css/Buttons.css";

const DeleteButton = ({ onClose, mini = false }) => {
  return (
    <button className={`delete-button ${mini ? "mini" : ""}`} onClick={onClose}>
      ✕
    </button>
  );
};

export default DeleteButton;
