import CloseButton from "../buttons/CloseButton";
import "./css/FormHeader.css";

const FormHeader = ({ title, subTitle, onClose }) => {
  return (
    <>
      <CloseButton onClose={onClose} />
      <h1 className="form-header">
        <span className="form-titlebottom">{title}</span>
        <strong className="form-title">{subTitle}</strong>
      </h1>
      <hr />
    </>
  );
};

export default FormHeader;
