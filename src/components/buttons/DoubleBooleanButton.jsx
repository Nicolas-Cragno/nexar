import "./css/Buttons.css";

const DoubleBooleanButton = ({ optionA, optionB, state, setState }) => {
  const txt1 = typeof optionA === "string" ? optionA.toUpperCase() : "ACTIVO";
  const txt2 =
    typeof optionB === "string" ? optionB.toUpperCase() : "INNACTIVO";

  return (
    <div className="doubleButton">
      <button
        type="button"
        className={state === optionA ? "type-btn active" : "type-btn"}
        onClick={() => setState(optionA)}
      >
        {txt1}
      </button>

      <button
        type="button"
        className={state === optionB ? "type-btn active" : "type-btn"}
        onClick={() => setState(optionB)}
      >
        {txt2}
      </button>
    </div>
  );
};

export default DoubleBooleanButton;
