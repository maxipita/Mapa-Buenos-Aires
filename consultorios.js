// ============================================
// DATOS DE CONSULTORIOS EXTERNOS
// Formato de cada entrada:
// { nombre: "...", direccion: "...", lat: 0.0, lng: 0.0, tipo: "Consultorio", imagen: "Imagenes/xxx.jpg" }
// ============================================
const consultoriosData = {
  1: {
    localidades: [
       { nombre: "ARENALES963", direccion: "Arenales 963, C1061 AAE, Cdad. Autónoma de Buenos Aires", lat: -34.5940, lng: -58.3808, tipo: "Consultorio" },
       { nombre: "QUINTANA89", direccion: "Av. Pres. Manuel Quintana 89, C1014ACA Cdad. Autónoma de Buenos Aires", lat: -34.5915, lng: -58.3856, tipo: "Consultorio" },
       { nombre: "PARAGUAY1327", direccion: "Paraguay 1327, C1057AAU Cdad. Autónoma de Buenos Aires", lat: -34.5978, lng: -58.3859, tipo: "Consultorio" },
       {nombre: "ARENALES1131", direccion: "Arenales 1131, C1061AAI Cdad. Autónoma de Buenos Aires", lat: -34.5939, lng: -58.3833, tipo: "Consultorio" },
       { nombre: "PARANA1087", direccion: "Paraná 1087, C1018ADA Cdad. Autónoma de Buenos Aires", lat: -34.5915, lng: -58.3856, tipo: "Consultorio" },
       { nombre: "GRALSARMIENTO1339", direccion: "Sarmiento 1339, C1041 Cdad. Autónoma de Buenos Aires", lat: -34.6051, lng: -58.3856, tipo: "Consultorio" }
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
      { nombre: "ARENALES3195", direccion: "Arenales 3195, C1425BEM Cdad. Autónoma de Buenos Aires", lat: -34.5885, lng: -58.4086, tipo: "Consultorio" },
      { nombre: "CALLAO875_2C", direccion: "Av. Callao 875, C1060 Cdad. Autónoma de Buenos Aires", lat: -34.5987, lng: -58.3927, tipo: "Consultorio" },
      { nombre: "CALLAO875_4H", direccion: "Av. Callao 875, C1060 Cdad. Autónoma de Buenos Aires", lat: -34.5988, lng: -58.3927, tipo: "Consultorio" },
      { nombre: "STAFE1592", direccion: "Av. Sta. Fe 1592, C1060ABO Cdad. Autónoma de Buenos Aires", lat: -34.5958, lng: -58.3898, tipo: "Consultorio" },
      { nombre: "STAFE1780", direccion: "Av. Sta. Fe 1780, C1060ABQ Cdad. Autónoma de Buenos Aires", lat: -34.5959, lng: -58.3929, tipo: "Consultorio" },
      { nombre: "STAFE1886", direccion: "Av. Sta. Fe 1886, C1023 Cdad. Autónoma de Buenos Aires", lat: -34.5959, lng: -58.3945, tipo: "Consultorio" },
      { nombre: "STAFE2088", direccion: "Av. Sta. Fe 2088, C1123AAP Cdad. Autónoma de Buenos Aires", lat: -34.5956, lng: -58.3971, tipo: "Consultorio" },
      { nombre: "BERUTI3240", direccion: "Beruti 3240, C1425BBP Cdad. Autónoma de Buenos Aires", lat: -34.5879, lng: -58.4085, tipo: "Consultorio" },
      { nombre: "COPERNICO2390", direccion: "Copernico 2390, C1425CAB Cdad. Autónoma de Buenos Aires", lat: -34.5858, lng: -58.3982, tipo: "Consultorio" },
      { nombre: "JUNCAL3088", direccion: "Juncal 3088, C1425AYN C1425AYN, Cdad. Autónoma de Buenos Aires", lat: -34.5866, lng: -58.4081, tipo: "Consultorio" },
      { nombre: "LAPRIDA1963", direccion: "Laprida 1963, C1119 Cdad. Autónoma de Buenos Aires", lat: -34.5879, lng: -58.4003, tipo: "Consultorio" },
      { nombre: "CALLAO1134", direccion: "Av. Callao 1134, C1023AAR Cdad. Autónoma de Buenos Aires", lat: -34.5951, lng: -58.3933, tipo: "Consultorio" },
      { nombre: "LASHERAS1621", direccion: "Av. Gral. Las Heras 1621, C1018AAA Cdad. Autónoma de Buenos Aires", lat: -34.5927, lng: -58.3900, tipo: "Consultorio" },
      { nombre: "STAFE1955", direccion: "Av. Sta. Fe 1955, C1021 AAB, Cdad. Autónoma de Buenos Aires", lat: -34.5952, lng: -58.3954, tipo: "Consultorio" },
      { nombre: "STAFE2483", direccion: "Av. Sta. Fe 2483, C1123AAG Cdad. Autónoma de Buenos Aires", lat: -34.5942, lng: -58.4021, tipo: "Consultorio" },
      { nombre: "JUNN933", direccion: "Junín 933, C1122 Cdad. Autónoma de Buenos Aires", lat: -34.5980, lng: -58.3917, tipo: "Consultorio" },
      { nombre: "PARAGUAY1615", direccion: "Paraguay 1615, C1019 Cdad. Autónoma de Buenos Aires", lat: -34.5982, lng: -58.3899, tipo: "Consultorio" },
      { nombre: "PARAGUAY2342", direccion: "Paraguay 2342, C1121ABL Cdad. Autónoma de Buenos Aires", lat: -34.5979, lng: -58.4013, tipo: "Consultorio" },
      { nombre: "PARAGUAY2440", direccion: "Paraguay 2440, C1121ABN Cdad. Autónoma de Buenos Aires", lat: -34.5977, lng: -58.4026, tipo: "Consultorio" },
      { nombre: "PARAGUAY2468_2", direccion: "Paraguay 2468, C1121ABN Cdad. Autónoma de Buenos Aires", lat: -34.5975, lng: -58.4029, tipo: "Consultorio" },
      { nombre: "PARAGUAY2468_7", direccion: "Paraguay 2468, C1121ABN Cdad. Autónoma de Buenos Aires", lat: -34.5976, lng: -58.4029, tipo: "Consultorio" },
      { nombre: "URUGUAY1280", direccion: "Uruguay 1280, C1016ACF Cdad. Autónoma de Buenos Aires", lat: -34.5930, lng: -58.3877, tipo: "Consultorio" },
      { nombre: "URIBURU1054_6C", direccion: "Pres. José Evaristo Uriburu 1054, C1114AAF Cdad. Autónoma de Buenos Aires", lat: -34.5961, lng: -58.3988, tipo: "Consultorio" },
      { nombre: "PARAGUAY2523", direccion: "Paraguay 2523, C1425 Cdad. Autónoma de Buenos Aires", lat: -34.5972, lng: -58.4039, tipo: "Consultorio" },
      { nombre: "PARAGUAY2571", direccion: "Paraguay 2571, C1425BRA Cdad. Autónoma de Buenos Aires", lat: -34.5970, lng: -58.4046, tipo: "Consultorio" },
      { nombre: "JUNIN1054_1", direccion: "Junín 1054, C1113AAE Cdad. Autónoma de Buenos Aires", lat: -34.5964, lng: -58.3976, tipo: "Consultorio" }
      
    ]
  },
  3: {
    localidades: [
      { nombre: "GRALSARMIENTO1870", direccion: "Sarmiento 1870, C1044AAB Cdad. Autónoma de Buenos Aires", lat: -34.6055, lng: -58.3931, tipo: "Consultorio" },
      { nombre: "GRALURQUIZA1062", direccion: "Gral. Urquiza 1062, C1221 Cdad. Autónoma de Buenos Aires", lat: -34.6227, lng: -58.4090, tipo: "Consultorio" }
    ]
  },
  4: {
    localidades: [
      { nombre: "Centro Osetya", direccion: "Benito Quinquela Martín 1738, C1296ADJ, C1288 Cdad. Autónoma de Buenos Aires", lat: -34.6437, lng: -58.3742, tipo: "Consultorio" },
      { nombre: "USPALLATA980Q", direccion: "Uspallata 980, C1268AFF Cdad. Autónoma de Buenos Aires", lat: -34.6323, lng: -58.3747, tipo: "Consultorio" },
      { nombre: "OSCOMM", direccion: "Av. Montes de Oca 284, C1270 Cdad. Autónoma de Buenos Aires", lat: -34.6361, lng: -58.3759, tipo: "Consultorio" },
    ]
  },
  5: {
    localidades: [
       { nombre: "RIVADAVIA4370", direccion: "Av. Rivadavia 4370, C1205 Cdad. Autónoma de Buenos Aires", lat: -34.6141, lng: -58.4270, tipo: "Consultorio" },
       { nombre: "33ORIENTALES37", direccion: "Treinta y Tres Orientales 37, C1208 Cdad. Autónoma de Buenos Aires", lat: -34.6135, lng: -58.4249, tipo: "Consultorio" },
       { nombre: "QUITO4330", direccion: "Quito 4330, C1212ABP Cdad. Autónoma de Buenos Aires", lat: -34.6135, lng: -58.4249, tipo: "Consultorio" },
       { nombre: "NEUQUEN554", direccion: "Neuquén 554, C1405CKB Cdad. Autónoma de Buenos Aires", lat: -34.6170, lng: -58.4279, tipo: "Consultorio" }
    ]
  },
  6: {
    localidades: [
     { nombre: "RIVADAVIA5466_5B", direccion: "Av. Rivadavia 5466, C1424CEW Cdad. Autónoma de Buenos Aires", lat: -34.6212, lng: -58.4421, tipo: "Consultorio" },
     { nombre: "RIVADAVIA5466_5B", direccion: "Av. Rivadavia 5466, C1424CEW Cdad. Autónoma de Buenos Aires", lat: -34.6213, lng: -58.4421, tipo: "Consultorio" },
     { nombre: "RIVADAVIA5748", direccion: "Av. Rivadavia 5748, C1424CEW Cdad. Autónoma de Buenos Aires", lat: -34.6226, lng: -58.4464, tipo: "Consultorio" },
    ]
  },
  7: {
    localidades: []
  },
  8: {
    localidades: []
  },
  9: {
    localidades: [
      { nombre: "CAAGUAZU6093", direccion: "Caaguazú 6093, C1408ETG Cdad. Autónoma de Buenos Aires", lat: -34.6427, lng: -58.5144, tipo: "Consultorio" }
    ]
  },
  10: {
    localidades: [

    ]
  },
  11: {
    localidades: [
      { nombre: "BARCA2776", direccion: "Pedro Calderón de la Barca 2776, C1417CIT Cdad. Autónoma de Buenos Aires", lat: -34.6158, lng: -58.5197, tipo: "Consultorio" },
      { nombre: "TINOGASTA3275", direccion: "Tinogasta 3275, C1417EHQ Cdad. Autónoma de Buenos Aires", lat: -34.6009, lng: -58.4967, tipo: "Consultorio" },
      { nombre: "TINOGASTA3275", direccion: "Tinogasta 3275, C1417EHQ Cdad. Autónoma de Buenos Aires", lat: -34.6009, lng: -58.4967, tipo: "Consultorio" }
    ]
  },
  12: {
    localidades: [
      
      { nombre: "ALVTHOMAS3106", direccion: "Av. Álvarez Thomas 3106, C1431 Cdad. Autónoma de Buenos Aires", lat: -34.57188, lng: -58.4828, tipo: "Consultorio" },
      { nombre: "BENCALADA48925A", direccion: "Blanco Encalada 4892, C1431CDJ Cdad. Autónoma de Buenos Aires", lat: -34.5741, lng: -58.4847, tipo: "Consultorio" },
      { nombre: "RAMALLO2606", direccion: "Ramallo 2606, C1429DUT Cdad. Autónoma de Buenos Aires", lat: -34.5436, lng: -58.4738, tipo: "Consultorio" },
      { nombre: "CDLP3779", direccion: "Cdad. de la Paz 3779, C1429 Acq, Cdad. Autónoma de Buenos Aires", lat: -34.5470, lng: -58.4703, tipo: "Consultorio" }
    ]
  },
  13: {
    localidades: [
      { nombre: "ARCOS2400", direccion: "Arcos 2400, C1428AFL Cdad. Autónoma de Buenos Aires", lat: -34.5575, lng: -58.4564, tipo: "Consultorio" },
      { nombre: "CABILDO2720", direccion: "Av. Cabildo 2720, C1428 Cdad. Autónoma de Buenos Aires", lat: -34.5566, lng: -58.4616, tipo: "Consultorio" },
      { nombre: "PALPA2570", direccion: "Palpa 2570, C1426DOF Cdad. Autónoma de Buenos Aires", lat: -34.5566, lng: -58.4616, tipo: "Consultorio" },
      { nombre: "ROOSEVELT2177", direccion: "Franklin D. Roosevelt 2177, C1428BOE Cdad. Autónoma de Buenos Aires", lat: -34.5558, lng: -58.4585, tipo: "Consultorio" },
      { nombre: "VARREDONDO2474", direccion: "Virrey Arredondo 2474, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5679, lng: -58.4513, tipo: "Consultorio" },
      { nombre: "CABILDO714", direccion: "Av. Cabildo 714, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5703, lng: -58.4443, tipo: "Consultorio" },
      { nombre: "MONROE2626", direccion: "Monroe 2626, C1428BLR Cdad. Autónoma de Buenos Aires", lat: -34.5594, lng: -58.4620, tipo: "Consultorio" },
      { nombre: "LIBERTADOR6710", direccion: "Av. del Libertador 6710, C1429BMN Cdad. Autónoma de Buenos Aires", lat: -34.5503, lng: -58.4532, tipo: "Consultorio" },
      { nombre: "LAPAMPA2219", direccion: "La Pampa 2219, C1428EAM Cdad. Autónoma de Buenos Aires", lat: -34.5636, lng: -58.4528, tipo: "Consultorio" },
      { nombre: "DELGADO588", direccion: "Delgado 588, C1426BDF Cdad. Autónoma de Buenos Aires", lat: -34.5799, lng: -58.4506, tipo: "Consultorio" },
      { nombre: "CESPEDES2410", direccion: "Céspedes 2410, C1426DUH Cdad. Autónoma de Buenos Aires", lat: -34.5684, lng: -58.4480, tipo: "Consultorio" },
      { nombre: "CDLP1234", direccion: "Cdad. de la Paz 1234, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5689, lng: -58.4503, tipo: "Consultorio" },
      { nombre: "ECHEVERRIA2182", direccion: "Echeverría 2182, C1428 Cdad. Autónoma de Buenos Aires, C1428 Cdad. Autónoma de Buenos Aires", lat: -34.5616, lng: -58.4536, tipo: "Consultorio" },
      { nombre: "OHIGGINS2062_5", direccion: "O'Higgins 2062, C1428AGF Cdad. Autónoma de Buenos Aires", lat: -34.5600, lng: -58.4527, tipo: "Consultorio" },
      { nombre: "OHIGGINS2062_9", direccion: "O'Higgins 2062, C1428AGF Cdad. Autónoma de Buenos Aires", lat: -34.5601, lng: -58.4527, tipo: "Consultorio" }
    ]
  },
  14: {
    localidades: [
      { nombre: "CABILDO1133", direccion: "Av. Cabildo 1133, C1426AAK Cdad. Autónoma de Buenos Aires", lat: -34.5682, lng: -58.4473, tipo: "Consultorio" },
      { nombre: "COSTA RICA 5108", direccion: "Costa Rica 5108, C1414BST Cdad. Autónoma de Buenos Aires", lat: -34.5858, lng: -58.4308, tipo: "Consultorio" },
      { nombre: "MIGUELETES1203", direccion: "Migueletes 1203, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5633, lng: -58.4389, tipo: "Consultorio" },
      { nombre: "AMENABAR80", direccion: "Amenábar 80, C1426 AIB, Cdad. Autónoma de Buenos Aires", lat: -34.5768, lng: -58.4397, tipo: "Consultorio" },
      { nombre: "ARAOZ28708B", direccion: "Aráoz 2870, C1425BPD Cdad. Autónoma de Buenos Aires", lat: -34.5768, lng: -58.4397, tipo: "Consultorio" },
      { nombre: "AREVALO1409", direccion: "Arévalo 1409, C1414CQC Cdad. Autónoma de Buenos Aires", lat: -34.5833, lng: -58.4432, tipo: "Consultorio" },
      { nombre: "CABILDO597", direccion: "Av. Cabildo 597, C1426 Cdad. Autónoma de Buenos Aires", lat: -34.5705, lng: -58.4424, tipo: "Consultorio" },
      { nombre: "CNELDIAZ1794", direccion: "Av. Cnel. Díaz 1794, C1425DQQ Cdad. Autónoma de Buenos Aires", lat: -34.5902, lng: -58.4115, tipo: "Consultorio" },
      { nombre: "STAFE3252", direccion: "Av. Sta. Fe 3252, C1425 Cdad. Autónoma de Buenos Aires", lat: -34.5885, lng: -58.4117, tipo: "Consultorio" },
      { nombre: "STAFE3373_2B", direccion: "Av. Sta. Fe 3373, C1425 Cdad. Autónoma de Buenos Aires", lat: -34.5885, lng: -58.4117, tipo: "Consultorio" },
      { nombre: "STAFE3553_1_5", direccion: "Av. Sta. Fe 3553, C1425BGX Cdad. Autónoma de Buenos Aires", lat: -34.5858, lng: -58.4144, tipo: "Consultorio" },
      { nombre: "CABELLO3957", direccion: "Cabello 3957, C1425APS Cdad. Autónoma de Buenos Aires", lat: -34.5791, lng: -58.4146, tipo: "Consultorio" },
      { nombre: "GORRITI6015", direccion: "Gorriti 6015, C1414BKM Cdad. Autónoma de Buenos Aires", lat: -34.5809, lng: -58.4414, tipo: "Consultorio" },
      { nombre: "ARAOZ2241", direccion: "Aráoz 2241, C1425DGG Cdad. Autónoma de Buenos Aires", lat: -34.5878, lng: -58.4183, tipo: "Consultorio" },
      { nombre: "SORTIZ2356_3", direccion: "Raúl Scalabrini Ortiz 2356, C1425DBS Cdad. Autónoma de Buenos Aires", lat: -34.5849, lng: -58.4159, tipo: "Consultorio" },
      { nombre: "SORTIZ2356_6", direccion: "Raúl Scalabrini Ortiz 2356, C1425DBS Cdad. Autónoma de Buenos Aires", lat: -34.5850, lng: -58.4159, tipo: "Consultorio" },
      { nombre: "BULNES2548", direccion: "Bulnes 2548, C1425 Cdad. Autónoma de Buenos Aires", lat: -34.5824, lng: -58.4070, tipo: "Consultorio" },
      { nombre: "JALVAREZ2430", direccion: "Julián Álvarez 2430, C1425 Cdad. Autónoma de Buenos Aires", lat: -34.5869, lng: -58.4153, tipo: "Consultorio" },
      { nombre: "GOROSTI2355_10", direccion: "Gorostiaga 2355, C1426CTQ Cdad. Autónoma de Buenos Aires", lat: -34.5700, lng: -58.4426, tipo: "Consultorio" },
      { nombre: "GOROSTI2355_12", direccion: "Gorostiaga 2355, C1426CTQ Cdad. Autónoma de Buenos Aires", lat: -34.5703, lng: -58.4426, tipo: "Consultorio" },
      { nombre: "MAURE1730", direccion: "Maure 1730, C1426CUF Cdad. Autónoma de Buenos Aires", lat: -34.5669, lng: -58.4361, tipo: "Consultorio" },


    ]
  },
  15: {
    localidades: [
      { nombre: "FOREST1166", direccion: "Av. Forest 1166, C1427 Cdad. Autónoma de Buenos Aires", lat: -34.5784, lng: -58.4601, tipo: "Consultorio" },
      { nombre: "CABILDO714", direccion: "Andonaegui 1091, C1427BEC Cdad. Autónoma de Buenos Aires", lat: -34.5893, lng: -58.4774, tipo: "Consultorio" },
      
    ]
  }
};
