import FormPersona from "./FormPersona";
import FormTractor from "./FormTractor";
import FormFurgon from "./FormFurgon";
import FormViaje from "./FormViaje";

const FormGestor = ({ tipo = "std", elemento = null, onGuardar, onClose }) => {
  const tipoLower = tipo.toLowerCase();

  switch (tipoLower) {
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
    case "viajes":
      return (
        <FormViaje
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
