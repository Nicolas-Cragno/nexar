// uso para botones true/false de verificaciones en porteria

const FormGroups = ({ grupos, formData, setFormData }) => {
  if (!grupos.length) return null;

  return (
    <>
      {grupos.map((grupo) => (
        <div key={grupo.key}>
          <label>
            <strong className="form-info-title">{grupo.label}</strong>
          </label>

          <div className="form-info-box">
            <div className="check-grid">
              {grupo.items.map((item) => {
                const activo = formData[grupo.key]?.[item.key] || false;

                return (
                  <label
                    key={item.key}
                    className={`check-item ${activo ? "activo" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={activo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [grupo.key]: {
                            ...prev[grupo.key],
                            [item.key]: e.target.checked,
                          },
                        }))
                      }
                    />

                    {item.label.toUpperCase()}
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FormGroups;
