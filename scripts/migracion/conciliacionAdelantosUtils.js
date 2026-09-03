const DIA_MS = 24 * 60 * 60 * 1000;

const diasEntre = (origen, destino) =>
  Math.round((Date.parse(`${destino}T00:00:00Z`) - Date.parse(`${origen}T00:00:00Z`)) / DIA_MS);

const compararObjetivo = (a, b) => {
  if (a.asignados !== b.asignados) return a.asignados - b.asignados;
  return b.costo - a.costo;
};

const conciliarGrupo = (filasEntrada, movimientosEntrada) => {
  const filas = [...filasEntrada].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.fila - b.fila);
  const movimientos = [...movimientosEntrada].sort((a, b) =>
    a.fechaNormalizada.localeCompare(b.fechaNormalizada) || a.id.localeCompare(b.id));
  const memo = new Map();

  const resolver = (i, j) => {
    const clave = `${i}:${j}`;
    if (memo.has(clave)) return memo.get(clave);
    if (i === filas.length) {
      const fin = { asignados: 0, costo: 0, opciones: [] };
      memo.set(clave, fin);
      return fin;
    }

    const opciones = [{ movimientoIndex: null, siguienteJ: j, siguiente: resolver(i + 1, j), distancia: 0 }];
    for (let k = j; k < movimientos.length; k += 1) {
      const distancia = Math.abs(diasEntre(filas[i].fecha, movimientos[k].fechaNormalizada));
      opciones.push({ movimientoIndex: k, siguienteJ: k + 1, siguiente: resolver(i + 1, k + 1), distancia });
    }
    const evaluadas = opciones.map((opcion) => ({
      ...opcion,
      asignados: opcion.siguiente.asignados + (opcion.movimientoIndex === null ? 0 : 1),
      costo: opcion.siguiente.costo + opcion.distancia,
    }));
    let mejor = evaluadas[0];
    for (const opcion of evaluadas.slice(1)) {
      if (compararObjetivo(opcion, mejor) > 0) mejor = opcion;
    }
    const resultado = {
      asignados: mejor.asignados,
      costo: mejor.costo,
      opciones: evaluadas.filter((opcion) => compararObjetivo(opcion, mejor) === 0),
    };
    memo.set(clave, resultado);
    return resultado;
  };

  const raiz = resolver(0, 0);
  const posibilidades = new Map(filas.map((fila) => [fila.fila, new Set()]));
  const visitados = new Set();
  const recorrer = (i, j) => {
    const clave = `${i}:${j}`;
    if (visitados.has(clave) || i === filas.length) return;
    visitados.add(clave);
    const estado = resolver(i, j);
    for (const opcion of estado.opciones) {
      posibilidades.get(filas[i].fila).add(
        opcion.movimientoIndex === null ? null : movimientos[opcion.movimientoIndex].id,
      );
      recorrer(i + 1, opcion.siguienteJ);
    }
  };
  recorrer(0, 0);

  const porId = new Map(movimientos.map((movimiento) => [movimiento.id, movimiento]));
  const resultados = filas.map((fila) => {
    const opciones = [...posibilidades.get(fila.fila)];
    const ids = opciones.filter((id) => id !== null);
    if (opciones.length === 1 && ids.length === 1) {
      const movimiento = porId.get(ids[0]);
      const deltaDias = diasEntre(fila.fecha, movimiento.fechaNormalizada);
      return { estado: "ASIGNADO", fila, movimiento, deltaDias, distancia: Math.abs(deltaDias) };
    }
    if (opciones.length === 1 && opciones[0] === null) {
      return { estado: "SIN_MOVIMIENTO", fila, candidatos: [] };
    }
    return {
      estado: "AMBIGUO",
      fila,
      candidatos: ids.map((id) => {
        const movimiento = porId.get(id);
        const deltaDias = diasEntre(fila.fecha, movimiento.fechaNormalizada);
        return { id, fecha: movimiento.fechaNormalizada, deltaDias, distancia: Math.abs(deltaDias) };
      }),
      puedeQuedarSinAsignar: opciones.includes(null),
    };
  });

  const asignadosIniciales = resultados.filter((item) => item.estado === "ASIGNADO");
  const gruposIntercambiables = asignadosIniciales.map((resultado) => {
    const intercambiables = asignadosIniciales.filter((otro) =>
      otro !== resultado
      && (otro.fila.fecha === resultado.fila.fecha
        || otro.movimiento.fechaNormalizada === resultado.movimiento.fechaNormalizada));
    const candidatos = [resultado, ...intercambiables].map((item) => {
      const deltaDias = diasEntre(resultado.fila.fecha, item.movimiento.fechaNormalizada);
      return { id: item.movimiento.id, fecha: item.movimiento.fechaNormalizada, deltaDias, distancia: Math.abs(deltaDias) };
    });
    return { resultado, candidatos };
  });
  for (const { resultado, candidatos } of gruposIntercambiables) {
    if (candidatos.length === 1) continue;
    resultado.estado = "AMBIGUO";
    resultado.candidatos = candidatos;
    resultado.puedeQuedarSinAsignar = false;
    delete resultado.movimiento;
    delete resultado.deltaDias;
    delete resultado.distancia;
  }

  return { resultados, asignadosOptimos: raiz.asignados, distanciaTotalOptima: raiz.costo };
};

module.exports = { conciliarGrupo, diasEntre };
