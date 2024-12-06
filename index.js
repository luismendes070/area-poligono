// Import stylesheets
import './style.css';

// Write Javascript code!
const appDiv = document.getElementById('app');
appDiv.innerHTML = `<h1>Area do Polígono LeafletJS JS Starter</h1>`;

// ChatGPT
// Inicializa o mapa
const map = L.map('map').setView([-15.7995, -47.8645], 13); // Brasília como exemplo

// Adiciona um tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Inicializa os controles de desenho
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: true,
    polyline: false,
    circle: false,
    rectangle: false,
    marker: false,
  }
});
map.addControl(drawControl);

// Função para calcular área
function calculateArea(layer) {
    const latlngs = layer.getLatLngs()[0]; // Pegando as coordenadas do polígono
    const area = L.GeometryUtil.geodesicArea(latlngs); // Área em m²
    return area / 1e6; // Converte para km²
  }
  
  // Evento para detectar o desenho
  map.on(L.Draw.Event.CREATED, function (event) {
    const layer = event.layer;
    drawnItems.addLayer(layer);
  
    const areaKm2 = calculateArea(layer);
    alert(`Área do polígono: ${areaKm2.toFixed(2)} km²`);
  });
  
  const ws = new WebSocket('ws://localhost:8080'); // URL do seu servidor WebSocket

map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer;
  drawnItems.addLayer(layer);

  const geoJson = layer.toGeoJSON(); // Converte o polígono para GeoJSON
  ws.send(JSON.stringify(geoJson)); // Envia para o servidor WebSocket

  ws.onmessage = (message) => {
    console.log('Resposta do servidor:', message.data);
  };
});
