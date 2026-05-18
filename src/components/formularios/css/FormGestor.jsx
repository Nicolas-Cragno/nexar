import FormPersona from "./FormPersona";
import FormTractor from "./FormTractor";
import FormFurgon from "./FormFurgon";

const FormGestor = ({ tipo = "std", elemento = null, onGuardar, onClose }) => {
  switch (tipo) {
    case "tractores":
      return (
        <FormTractor
          elemento={elemento}
          onGuardar={onGuardar}
          onClose={onClose}
        />
      );
      break;
    case "furgones":
      return (
        <FormFurgon
          elemento={elemento}
          onGuardar={onGuardar}
          onClose={onClose}
        />
      );
      break;
    case "personas":
      return (
        <FormPersona
          elemento={elemento}
          onGuardar={onGuardar}
          onClose={onClose}
        />
      );
      break;

    default:
      return (
        <FormPersona
          elemento={elemento}
          onGuardar={onGuardar}
          onClose={onClose}
        />
      );
      break;
  }
};

export default FormGestor;
