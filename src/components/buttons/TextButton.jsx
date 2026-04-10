import "./css/Buttons.css";

const TextButton = ({
  text = "",
  text2 = null,
  doble = false,
  type = "button",
  mini = false,
  onClick,
}) => {
  return (
    <button
      className={mini ? "btn-body-mini" : doble ? "btn-body-doble" : "btn-body"}
      onClick={onClick}
      type={type}
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
