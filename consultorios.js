// ============================================
// DATOS DE CONSULTORIOS EXTERNOS
// Formato de cada entrada:
// { nombre: "...", direccion: "...", lat: 0.0, lng: 0.0, tipo: "Consultorio", imagen: "Imagenes/xxx.jpg" }
// ============================================
const consultoriosData = {
  1: {
    localidades: [
       { nombre: "ARENALES963", direccion: "Arenales 963, C1061 AAE, Cdad. Autónoma de Buenos Aires", lat: -34.5940, lng: -58.3808, tipo: "Consultorio" },
       { nombre: "OSCOMM", direccion: "Av. Montes de Oca 284, C1270 Cdad. Autónoma de Buenos Aires", lat: -34.6361, lng: -58.3759, tipo: "Consultorio" }
    ]
  },
  2: {
    localidades: [
      { nombre: "STAFE2534", direccion: "Av. Sta. Fe 2534, C1425BGN Cdad. Autónoma de Buenos Aires", lat: -34.5942, lng: -58.4030, tipo: "Consultorio" },
      { nombre: "ARENALES2893", direccion: "Arenales 2893, C1425BEG Cdad. Autónoma de Buenos Aires", lat: -34.5906, lng: -58.4060, tipo: "Consultorio" },
      { nombre: "LASHERAS2048", direccion: "Av. Gral. Las Heras 2048, C1113 Cdad. Autónoma de Buenos Aires", lat: -34.5897, lng: -58.3946, tipo: "Consultorio"},
      { nombre: "LASHERAS2048", direccion: "Av. Pueyrredón 1789, C1119ACA Cdad. Autónoma de Buenos Aires", lat: -34.5904, lng: -58.4003, tipo: "Consultorio" },
      { nombre: "JUNCAL2951", direccion: "Juncal 2951, C1425 Cdad. Autónoma de Buenos Aires", lat: -34.5874, lng: -58.4066, tipo: "Consultorio" },
      { nombre: "ARENALES1942", direccion: "Arenales 1942, C1124AAD Cdad. Autónoma de Buenos Aires", lat: -34.5947, lng: -58.3951, tipo: "Consultorio" },
      { nombre: "MTALVEAR2320", direccion: "Marcelo Torcuato de Alvear 2320, C1122 Cdad. Autónoma de Buenos Aires", lat: -34.5967, lng: -58.4005, tipo: "Consultorio" },
      { nombre: "RPENA912", direccion: "Rodríguez Peña 912, C1020ADT Cdad. Autónoma de Buenos Aires", lat: -34.5977, lng: -58.3919, tipo: "Consultorio" },
      { nombre: "ARENALES3195", direccion: "Arenales 3195, C1425BEM Cdad. Autónoma de Buenos Aires", lat: -34.5885, lng: -58.4086, tipo: "Consultorio" }
    ]
  },
  3: {
    localidades: [
      { nombre: "GRALSARMIENTO1870", direccion: "Sarmiento 1870, C1044AAB Cdad. Autónoma de Buenos Aires", lat: -34.6055, lng: -58.3931, tipo: "Consultorio" }
    ]
  },
  4: {
    localidades: []
  },
  5: {
    localidades: [
       { nombre: "RIVADAVIA4370", direccion: "Av. Rivadavia 4370, C1205 Cdad. Autónoma de Buenos Aires", lat: -34.6141, lng: -58.4270, tipo: "Consultorio" },
       { nombre: "33ORIENTALES37", direccion: "Treinta y Tres Orientales 37, C1208 Cdad. Autónoma de Buenos Aires", lat: -34.6135, lng: -58.4249, tipo: "Consultorio" }
    ]
  },
  6: {
    localidades: [
     
    ]
  },
  7: {
    localidades: []
  },
  8: {
    localidades: []
  },
  9: {
    localidades: []
  },
  10: {
    localidades: [

    ]
  },
  11: {
    localidades: [
      { nombre: "BARCA2776", direccion: "Pedro Calderón de la Barca 2776, C1417CIT Cdad. Autónoma de Buenos Aires", lat: -34.6158, lng: -58.5197, tipo: "Consultorio" },
      { nombre: "TINOGASTA3275", direccion: "Tinogasta 3275, C1417EHQ Cdad. Autónoma de Buenos Aires", lat: -34.6009, lng: -58.4967, tipo: "Consultorio" }
    ]
  },
  12: {
    localidades: [
      { nombre: "TINOGASTA3275", direccion: "Tinogasta 3275, C1417EHQ Cdad. Autónoma de Buenos Aires", lat: -34.6009, lng: -58.4967, tipo: "Consultorio" },
      { nombre: "ALVTHOMAS3106", direccion: "Av. Álvarez Thomas 3106, C1431 Cdad. Autónoma de Buenos Aires", lat: -34.57188, lng: -58.4828, tipo: "Consultorio" }
    ]
  },
  13: {
    localidades: [
      { nombre: "ARCOS2400", direccion: "Arcos 2400, C1428AFL Cdad. Autónoma de Buenos Aires", lat: -34.5575, lng: -58.4564, tipo: "Consultorio" },
      { nombre: "CABILDO2720", direccion: "Av. Cabildo 2720, C1428 Cdad. Autónoma de Buenos Aires", lat: -34.5566, lng: -58.4616, tipo: "Consultorio" },
      { nombre: "PALPA2570", direccion: "Palpa 2570, C1426DOF Cdad. Autónoma de Buenos Aires", lat: -34.5566, lng: -58.4616, tipo: "Consultorio" },
      { nombre: "ROOSEVELT2177", direccion: "Franklin D. Roosevelt 2177, C1428BOE Cdad. Autónoma de Buenos Aires", lat: -34.5558, lng: -58.4585, tipo: "Consultorio" },
      { nombre: "VARREDONDO2474", direccion: "Virrey Arredondo 2474, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5679, lng: -58.4513, tipo: "Consultorio" },
      { nombre: "CABILDO714", direccion: "Av. Cabildo 714, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5703, lng: -58.4443, tipo: "Consultorio" }
      
    ]
  },
  14: {
    localidades: [
      { nombre: "CABILDO1133", direccion: "Av. Cabildo 1133, C1426AAK Cdad. Autónoma de Buenos Aires", lat: -34.5682, lng: -58.4473, tipo: "Consultorio" },
      { nombre: "COSTA RICA 5108", direccion: "Costa Rica 5108, C1414BST Cdad. Autónoma de Buenos Aires", lat: -34.5858, lng: -58.4308, tipo: "Consultorio" },
      { nombre: "MIGUELETES1203", direccion: "Migueletes 1203, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5633, lng: -58.4389, tipo: "Consultorio" },
      { nombre: "AMENABAR80", direccion: "Amenábar 80, C1426 AIB, Cdad. Autónoma de Buenos Aires", lat: -34.5768, lng: -58.4397, tipo: "Consultorio" },
      { nombre: "ARAOZ28708B", direccion: "Aráoz 2870, C1425BPD Cdad. Autónoma de Buenos Aires", lat: -34.5768, lng: -58.4397, tipo: "Consultorio" },
      { nombre: "AREVALO1409", direccion: "Arévalo 1409, C1414CQC Cdad. Autónoma de Buenos Aires", lat: -34.5833, lng: -58.4432, tipo: "Consultorio" }

    ]
  },
  15: {
    localidades: [
      { nombre: "FOREST1166", direccion: "Av. Forest 1166, C1427 Cdad. Autónoma de Buenos Aires", lat: -34.5784, lng: -58.4601, tipo: "Consultorio" },
      { nombre: "CABILDO714", direccion: "Andonaegui 1091, C1427BEC Cdad. Autónoma de Buenos Aires", lat: -34.5893, lng: -58.4774, tipo: "Consultorio" },
      { nombre: "BENCALADA48925A", direccion: "Blanco Encalada 4892, C1431CDJ Cdad. Autónoma de Buenos Aires", lat: -34.5741, lng: -58.4847, tipo: "Consultorio" }
    ]
  }
};
