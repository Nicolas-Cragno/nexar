import "./css/Buttons.css";

const TextButton = ({
  text = "",
  text2 = null,
  doble = false,
  type = "button",
  mini = false,
  variant = "primary",
  disabled = false,
  onClick,
}) => {
  const baseClass = mini ? "btn-body-mini" : doble ? "btn-body-doble" : "btn-body";

  return (
    <button
      className={`${baseClass} btn-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {doble ? (
        <>
          <span className="btn-doble-text">{text}</span>
          <span className="btn-doble-text">{text2}</span>
        </>
      ) : (
        text
      )}
    </button>
  );
};

export default TextButton;
