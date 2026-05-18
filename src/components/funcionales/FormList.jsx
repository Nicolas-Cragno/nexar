//------------------------------------------------------ externos
import { useState } from "react";
import Select from "react-select";
import { FaCirclePlus as LogoPlus } from "react-icons/fa6";
import {
  FaArrowAltCircleUp as LogoUp,
  FaArrowAltCircleDown as LogoDown,
} from "react-icons/fa";
//------------------------------------------------------ elementos
import ItemCard from "../cards/ItemCard";
import DeleteButton from "../buttons/DeleteButton";
//------------------------------------------------------ estilos
import "../formularios/css/Forms.css";
import DoubleBooleanButton from "../buttons/DoubleBooleanButton";
import TextButton from "../buttons/TextButton";

const FormList = ({
  articulos = [],
  value = [],
  onChange,
  mostrarTipoMovimiento = true,
  priceActive = false, // para que puede ser simple listado para stock o con precios para facturas
}) => {
  const [articuloSeleccionado, setArticuloSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [valor, setValor] = useState("");
  const [moneda, setMoneda] = useState("AR$");
  const [tipoMovimiento, setTipoMovimiento] = useState("ALTA");

  //------------------------------------------------------ agregar
  const handleAgregar = () => {
    if (!articuloSeleccionado || !cantidad) return;

    const nuevoArticulo = {
      id: articuloSeleccionado.value,
      descripcion: articuloSeleccionado.label,
      cantidad:
        tipoMovimiento === "BAJA"
          ? -Math.abs(Number(cantidad))
          : Number(cantidad),
      valor: Number(valor) || 0,
      moneda,
      tipo: tipoMovimiento,
    };

    onChange([...value, nuevoArticulo]);

    setArticuloSeleccionado(null);
    setCantidad("");
    setValor("");
    setMoneda("AR$");
  };

  const handleEliminar = (index) => {
    const updated = value.filter((_, i) => i !== index);

    onChange(updated);
  };

  return (
    <div className="form-box-doble">
      {mostrarTipoMovimiento && (
        <>
          <DoubleBooleanButton
            optionA={"ALTA"}
            optionB={"BAJA"}
            state={tipoMovimiento}
            setState={setTipoMovimiento}
          />
        </>
      )}

      <div className="form-row">
        <div>
          <label>
            <strong>Seleccionar Ítem</strong>
          </label>

          <Select
            className="select-grow"
            styles={{
              container: (base) => ({
                ...base,
                width: "75vh",
              }),
            }}
            options={articulos.map((art) => ({
              value: art.value,
              label: `${art.label}`,
            }))}
            value={articuloSeleccionado}
            onChange={setArticuloSeleccionado}
            placeholder="Seleccionar artículo..."
            noOptionsMessage={() => "Sin opciones"}
            isClearable
          />
        </div>
      </div>
      {priceActive && (
        <label>
          <strong>Costo / Valor</strong>
          <div className="form-inline">
            <input
              type="number"
              className="form-input"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
            <DoubleBooleanButton
              optionA={"AR$"}
              optionB={"U$D"}
              state={moneda}
              setState={setMoneda}
            />
          </div>
        </label>
      )}

      <div className="form-row">
        <div>
          <strong>Cantidad</strong>
          <input
            type="number"
            className="form-input"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </div>
        <div className="centrar">
          <TextButton
            text="+Agregar"
            mini={true}
            onClick={handleAgregar}
            type={"button"}
          />
        </div>
      </div>

      {value.length > 0 && (
        <ul className="form-box">
          {value.map((item, index) => (
            <li key={index} className="list-item">
              <ItemCard
                logo={item.cantidad < 0 ? <LogoDown /> : <LogoUp />}
                logoColor={`${item.cantidad < 0 ? "#920e0e" : "#0a8d15c0"}`}
                title={`${item.descripcion}`}
                txt1={item.id}
                txt2={`${item.cantidad} ${priceActive ? `(${item.moneda}${item.valor})` : ""}`}
              />
              <DeleteButton onClose={() => handleEliminar(index)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FormList;
