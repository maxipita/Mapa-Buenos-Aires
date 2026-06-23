// ============================================
// VISTA: EL COSTO DE LA DEMORA DIAGNÓSTICA
// ============================================
function abrirCostoDemora() {
  document.getElementById('menuInicio').style.display = 'none';
  document.getElementById('vistaCostoDemora').style.display = 'flex';
}

function cerrarCostoDemora() {
  document.getElementById('vistaCostoDemora').style.display = 'none';
  document.getElementById('menuInicio').style.display = '';
}
