import { useMemo, useState, memo } from "react";
import "./css/Modales.css";
import "./css/Tablas.css";
import CloseButton from "../buttons/CloseButton";
import TextButton from "../buttons/TextButton";
import {
  capitalizarTexto,
  renderizarValor,
} from "../../functions/dataFunctions";
import { fichaContent } from "../fichas/data/FichaContent";
import Ficha from "../fichas/Ficha";
import Loading from "../../routes/Loading";
import FormGestor from "../formularios/FormGestor";

const Modal = ({
  title,
  coleccion,
  subcoleccion,
  index = "id",
  data = [],
  headers = null,
  filtroSector,
  reload = null,
  onClose,
}) => {
  console.log(`----------- Render Modal ${title}`);
  const [textoFiltro, setTextoFiltro] = useState("");
  const [limiteFiltro, setLimiteFiltro] = useState(false);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);
  const [formAgregarVisible, setFormAgregarVisible] = useState(false);
  const [filtrosEspeciales, setFiltrosEspeciales] = useState({});

  const rows = data ?? [];
  const columnas = headers ?? Object.keys(rows?.[0] ?? {});

  const columnasFiltroEspecial = headers?.filter((h) => h.filtroEspecial) ?? [];

  const toggleFiltroEspecial = (key) => {
    setFiltrosEspeciales((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const dataFiltrada = useMemo(() => {
    if (!textoFiltro) return rows;

    const filtro = textoFiltro.toLowerCase();

    const filtrosActivos = Object.keys(filtrosEspeciales).filter(
      (key) => filtrosEspeciales[key],
    );

    return rows.filter((row) => {
      if (filtrosActivos.length > 0) {
        return filtrosActivos.some((key) =>
          row[key]?.toString().toLowerCase().includes(filtro),
        );
      }

      if (limiteFiltro) {
        return row[index]?.toString().toLowerCase().includes(filtro);
      }

      return Object.entries(row).some(([key, value]) =>
        renderizarValor(value, key)?.toString().toLowerCase().includes(filtro),
      );
    });
  }, [textoFiltro, limiteFiltro, filtrosEspeciales, data]);

  const handleCloseFicha = async () => {
    if (reload) await reload();
    setItemSeleccionado(null);
  };

  if (!data) return <Loading />;

  return (
    <div className="modal">
      <div className="modal-content-2">
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

        <div className="table-scroll-wrapper">
          <table className="table-lista">
            <thead className="table-titles">
              <tr>
                {columnas.map((col) => (
                  <th key={col.key}>{col.label.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
          </table>

          <div className="table-body-wrapper">
            <table className="table-lista">
              <tbody className="table-doby">
                {dataFiltrada.map((row, i) => (
                  <tr key={i} onClick={() => setItemSeleccionado(row)}>
                    {columnas.map((col) => (
                      <td key={col.key}>
                        {renderizarValor(row[col.key], col.key, "upper")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* LO MANEJO DIRECTAMENTE DESDE LOS BOTONES
        {coleccion !== "eventos" && (
          <div className="modal-buttons">
            <TextButton
              text={"AGREGAR"}
              onClick={() => setFormAgregarVisible(true)}
            />
          </div>
        )}
            */}
      </div>

      {itemSeleccionado && (
        <Ficha
          elemento={itemSeleccionado}
          coleccion={coleccion}
          area={subcoleccion}
          container={
            filtroSector
              ? fichaContent[filtroSector.toLowerCase()]
              : (fichaContent[itemSeleccionado.area?.toLowerCase()] ??
                fichaContent[title?.toLowerCase()] ??
                [])
          }
          onClose={handleCloseFicha}
        />
      )}
      {formAgregarVisible && (
        <FormGestor
          tipo={coleccion}
          coleccion={filtroSector ? `${coleccion}${filtroSector}` : coleccion}
          area={subcoleccion}
          onClose={() => setFormAgregarVisible(false)}
          reload={reload}
        />
      )}
    </div>
  );
};

export default memo(Modal);
