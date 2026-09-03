export const formatearNroAdelanto = (ubicacion, correlativo) => {
  const codigo = String(ubicacion ?? "").trim();
  const numero = Number(correlativo);

  if (!/^\d{1,4}$/.test(codigo)) {
    throw new Error(`Código de ubicación inválido para adelantos: ${codigo || "vacío"}.`);
  }
  if (!Number.isSafeInteger(numero) || numero < 1 || numero > 99999999) {
    throw new Error(`Correlativo de adelanto inválido: ${correlativo}.`);
  }

  return `${codigo.padStart(4, "0")}-${String(numero).padStart(8, "0")}`;
};

export const asignarNrosAdelanto = (movimientos, ubicacion, ultimoCorrelativo) => {
  const ultimo = Number(ultimoCorrelativo);
  if (!Number.isSafeInteger(ultimo) || ultimo < 0) {
    throw new Error(`Contador de adelantos inválido para la sucursal ${ubicacion}.`);
  }

  let correlativo = ultimo;
  const elementos = movimientos.map((movimiento) => {
    if (movimiento.tipo !== "PAGO") return movimiento;
    correlativo += 1;
    return {
      ...movimiento,
      nroAdelanto: formatearNroAdelanto(ubicacion, correlativo),
    };
  });

  return {
    elementos,
    cantidad: correlativo - ultimo,
    ultimo: correlativo,
  };
};
