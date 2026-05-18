// cargarColeccion.js
// Uso: node cargarColeccion.js <coleccion> <archivoJSON> [idRef]

const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

const serviceAccount = require("../clave-firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cargarColeccion(coleccion, archivoJSON, batchSize = 100, idRef = null) {
  try {
    const rutaJSON = path.join(__dirname, archivoJSON);
    const data = JSON.parse(fs.readFileSync(rutaJSON, "utf-8"));

    for (let i = 0; i < data.length; i += batchSize) {
      const chunk = data.slice(i, i + batchSize);

      const promesas = chunk.map(async (item) => {
        const docId = idRef === null ? item.id : item[idRef];
        if (docId === undefined) {
          console.warn("Item sin ID válido, se omite:", item);
          return;
        }

        const docRef = db.collection(coleccion).doc(docId.toString());
        const docSnap = await docRef.get();

        // Convertir campos fecha y recepcion a Timestamp si existen
        const itemConTimestamp = {
          ...item,
          fecha: item.fecha ? admin.firestore.Timestamp.fromDate(new Date(item.fecha)) : null,
          recepcion: item.recepcion ? admin.firestore.Timestamp.fromDate(new Date(item.recepcion)) : null
        };

        if (docSnap.exists) {
          await docRef.update(itemConTimestamp);
          console.log(`Documento actualizado: ${docId}`);
        } else {
          await docRef.set(itemConTimestamp);
          console.log(`Documento agregado: ${docId}`);
        }
      });

      await Promise.all(promesas);
    }

    console.log(`Todos los datos de ${archivoJSON} cargados/actualizados en ${coleccion}`);
  } catch (error) {
    console.error("Error al cargar la colección:", error);
  }
}

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Uso: node cargarColeccion.js <coleccion> <archivoJSON> [idRef]");
  process.exit(1);
}

const [coleccion, archivoJSON, idRef] = args;

cargarColeccion(coleccion, archivoJSON, 100, idRef || null);
