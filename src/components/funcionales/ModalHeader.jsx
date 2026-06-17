import "../modales/css/Modales.css";
import CloseButton from "../buttons/CloseButton";

const ModalHeader = ({
  title,
  textoFiltro,
  setTextoFiltro,
  columnasFiltroEspecial,
  filtrosEspeciales,
  toggleFiltroEspecial,
  onClose,
}) => {
  return (
    <>
      <CloseButton onClose={onClose} />
      <div className="modal-header">
        <h1 className="modal-title">{title}</h1>

        <div className="modal-filtro-box">
          <input
            className="modal-filtro"
            placeholder="Buscar..."
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
          />

          {columnasFiltroEspecial.length > 0 && (
            <div className="modal-filtros-section">
              <div className="modal-filtros-container">
                <div className="modal-filtros-title">Filtros</div>

                {columnasFiltroEspecial.map((col) => (
                  <label key={col.key} className="modal-filtro-check">
                    <input
                      type="checkbox"
                      checked={!!filtrosEspeciales[col.key]}
                      onChange={() => toggleFiltroEspecial(col.key)}
                    />
                    <span>{col.label.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ModalHeader;
