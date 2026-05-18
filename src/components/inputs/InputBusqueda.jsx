const InputBusqueda = ({ value, onChange, onEnter }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (onEnter) onEnter(value); // ejecuta filtro
    }
  };

  return (
    <input
      type="text"
      className="table-busqueda"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Buscar..."
    />
  );
};

export default InputBusqueda;
