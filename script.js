console.log("Script cargado correctamente");

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar el mapa centrado en Bilbao

    // Definir los límites del mapa (ajústalos según la zona deseada)
    var bounds = L.latLngBounds(
        [42.328264820398175, -4.576714073980302], // Esquina suroeste (lat, lon)
        [43.7040921776393,  -0.9858262359075255]  // Esquina noreste (lat, lon)
    );

    // Inicializar el mapa con límites de zoom y movimiento
    var map = L.map("map", {
        center: [43.263, -2.935], 
        zoom: 13, 
        minZoom: 9, // Límite de zoom mínimo
        maxBounds: bounds, // Restringir el movimiento dentro de los límites
        maxBoundsViscosity: 1.0 // Evita que el usuario salga del área
    });




    // Añadir capa base de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);


    var busColores = ['#29f933', '#ff9100', '#0091ff', '#fa4848', '#eaea00']; // Colores para buses
    var otrosColores = ['#1abc9c','#3498db','#2980b9','#8e44ad','#9b59b6','#e74c3c','#ba4a00','#ca6f1e','#d68910','#d4ac0d','#28b463','#229954']
       ; // Colores para taxis, casas y colegios
    var lineaColores = {}; // Objeto para almacenar el color de cada línea

    
    // Función para crear un icono con tamaño dinámico
function createCustomIcon(size) {
    return L.icon({
        iconUrl: 'imagenes/Logo color.png',
        iconSize: [size, size * 1.14], // Ajustar tamaño proporcionalmente
        iconAnchor: [size / 2, size * 1.14], 
        popupAnchor: [0, -size * 1.14]
    });
}

// Tamaño inicial del icono
var initialSize = 42;

// Crear el marcador con el icono inicial
var fixedMarker = L.marker([43.278780, -2.838355], { icon: createCustomIcon(initialSize) }).addTo(map);

// Evento para cambiar el tamaño del icono al hacer zoom
map.on('zoomend', function () {
    var zoomLevel = map.getZoom();
    
    // Ajustar el tamaño del icono en función del zoom
    var newSize = Math.max(15, initialSize * (zoomLevel / 13)); // Mínimo 15 px

    // Actualizar el icono con el nuevo tamaño
    fixedMarker.setIcon(createCustomIcon(newSize));
});
 

    // Almacenar los marcadores de cada archivo CSV dentro de markerClusters
    var archivosEnCluster = {}; 



    var markerClusters = L.markerClusterGroup({
        disableClusteringAtZoom: 15,
        maxClusterRadius: function (zoom) {
            return zoom > 14 ? 20 : 50; // Reduce la distancia de agrupación al hacer zoom
        },
        spiderfyOnMaxZoom: true, // Expande los puntos en zoom alto en lugar de agruparlos
        iconCreateFunction: function(cluster) {
            var markers = cluster.getAllChildMarkers();
            var lineName = markers[0].options.linea || "default";
            var color = lineaColores[lineName] || "#000000";
            return L.divIcon({
                html: `<div style="background-color: ${color}; color: black; border-radius: 50%; 
                            width: 30px; height: 30px; display: flex; align-items: center; 
                            justify-content: center; font-weight: bold; font-size: 14px;">
                            ${cluster.getChildCount()}
                        </div>`,
                className: 'marker-cluster',
                iconSize: L.point(30, 30)
            });
        }
    });
    
    map.addLayer(markerClusters);

    var clusterEnabled = true; // Estado inicial del cluster

    var clusterEnabled = true; // Estado inicial: cluster activado


    document.getElementById("toggleCluster").addEventListener("change", function () {
        if (this.checked) {
            console.log("🔹 Activando clusterización...");
    
            markerClusters.clearLayers(); // Vaciar el cluster antes de llenarlo
    
            // Mover los puntos de archivosEnCluster al cluster
            Object.keys(archivosEnCluster).forEach(nombreArchivo => {
                var sanitizedFileName = nombreArchivo.replace(/[\s\(\)]/g, "_");
                var checkbox = document.querySelector(`#file-${sanitizedFileName} input[type="checkbox"]`);
    
                if (checkbox && checkbox.checked) {
                    console.log(`➕ Agregando al cluster: ${nombreArchivo}`);
    
                    archivosEnCluster[nombreArchivo].eachLayer(layer => {
                        markerClusters.addLayer(layer);
                        map.removeLayer(layer); // Solo ocultar si se ha agregado al cluster
                    });
                }
            });
    
            map.addLayer(markerClusters);
            clusterEnabled = true;
        } else {
            console.log("🔹 Desactivando clusterización...");
    
            // Primero, eliminamos el cluster del mapa
            map.removeLayer(markerClusters);
    
            // Restaurar los puntos individuales al mapa desde el cluster
            markerClusters.eachLayer(layer => {
                console.log(`✔ Restaurando punto: ${layer.options.linea || "sin nombre"}`);
                map.addLayer(layer);
            });
    
            clusterEnabled = false;
        }
    });
    
    // 🔹 **Gestionar el cambio de capas en la leyenda sin perder puntos individuales**
    document.addEventListener("change", function (event) {
        if (event.target.type === "checkbox" && event.target.closest(".checkbox-container")) {
            var nombreArchivo = event.target.closest(".checkbox-container").id.replace("file-", "");
    
            if (event.target.checked) {
                if (clusterEnabled) {
                    console.log(`➕ Añadiendo al cluster: ${nombreArchivo}`);
                    archivosEnCluster[nombreArchivo].eachLayer(layer => {
                        markerClusters.addLayer(layer);
                        map.removeLayer(layer); // Ocultar solo si entra en el cluster
                    });
                    map.addLayer(markerClusters);
                } else {
                    console.log(`✔ Mostrando individualmente: ${nombreArchivo}`);
                    map.addLayer(archivosEnCluster[nombreArchivo]);
                }
            } else {
                console.log(`❌ Eliminando capa: ${nombreArchivo}`);
                markerClusters.removeLayer(archivosEnCluster[nombreArchivo]);
                map.removeLayer(archivosEnCluster[nombreArchivo]);
            }
        }
    });
    
    
    
    

    



    function cargarCSVDesdeTexto(csvText, fileName, tipo) {
        var nombreArchivo = fileName.replace(".csv", "");
        var nombreLinea = nombreArchivo.split(" ")[0];
    
        // Asignar colores dependiendo del tipo
        if (!lineaColores[nombreLinea]) {
            if (tipo === "Linea") {
                // Si es un bus, usar la paleta de buses
                lineaColores[nombreLinea] = busColores[Object.keys(lineaColores).length % busColores.length];
            } else {
                // Para taxis, casas y colegios, usar la otra paleta
                lineaColores[nombreLinea] = otrosColores[Object.keys(lineaColores).length % otrosColores.length];
            }
        }
    
        var color = lineaColores[nombreLinea];
    
        console.log(`Asignando color a ${nombreLinea}: ${color}`);
    
        // Crear una lista para almacenar los marcadores de este archivo
        var marcadoresArchivo = [];
    
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                results.data.forEach(row => {
                    if (row.WKT) {
                        let matches = row.WKT.match(/POINT \((-?\d+\.\d+) (-?\d+\.\d+)\)/);
                        if (matches) {
                            let lon = parseFloat(matches[1]);
                            let lat = parseFloat(matches[2]);
    
                            var customIcon = L.divIcon({
                                className: 'custom-marker',
                                html: getIconHtml(tipo, color),
                                iconSize: [20, 20]
                            });
    
                            var marker = L.marker([lat, lon], {
                                linea: nombreLinea,
                                archivo: nombreArchivo,
                                icon: customIcon
                            }).bindPopup(`<b>${row.nombre || ""}</b><br>${row.descripción || ""}`);
    
                            marcadoresArchivo.push(marker);
                        }
                    }
                });
    
                if (marcadoresArchivo.length > 0) {
                    archivosEnCluster[nombreArchivo] = L.layerGroup(marcadoresArchivo);
                }
    
                actualizarLeyenda(nombreLinea, nombreArchivo, color, tipo);
            }
        });
    }
    
    

    


    function getIconHtml(tipo, color) {
        if (tipo === "Taxi") {
            return `<div style="font-size: 15px; border-radius: 30%; background-color: ${color};">🚕</div>`;
        } else if (tipo === "Casa") {
            return `<div style="font-size: 15px;  border-radius: 30%; background-color: ${color};">🏠</div>`;
        } else if (tipo === "Colegio") {
            return `<div style="font-size: 15px;  border-radius: 30%; background-color: ${color};">🏫</div>`;
        } else if (tipo == "Linea"){
            return `<div style="font-size: 15px;  border-radius: 30%; background-color: ${color};">🚌</div>`;
        }
    }
    
        
    

    function actualizarLeyenda(linea, nombreArchivo, color, tipo) {
        var sanitizedFileName = nombreArchivo.replace(/[\s\(\)]/g, "_"); // Reemplaza espacios y paréntesis con "_"
        var legendContainerId = "legend-content";
    
        if (tipo === "Taxi") {
            legendContainerId = "legend-content-taxis";
        } else if (tipo === "Casa") {
            legendContainerId = "legend-content-casas";
        } else if (tipo === "Colegio") {
            legendContainerId = "legend-content-colegios";
        }
    
        var legendContainer = document.getElementById(legendContainerId);
        var lineHeader = document.getElementById('line-header-' + linea);
    
        var formattedName;
        var nameWithoutExtension = nombreArchivo.replace(".csv", "");
        var nameParts = nameWithoutExtension.split(" ");
    
        if (tipo === "Linea") {
            formattedName = "Línea " + nameParts[0];
        } else if (tipo === "Taxi") {
            formattedName = "Ruta " + nameParts.slice(0, 2).join(" ");
        } else if (tipo === "Casa") {
            formattedName = "Domicilios " + nameWithoutExtension;
        } else if (tipo === "Colegio") {
            formattedName = "Centro Educativo " + nameWithoutExtension;
        } else {
            formattedName = nombreArchivo;
        }
    
        if (!lineHeader) {
            lineHeader = document.createElement('div');
            lineHeader.id = 'line-header-' + linea;
            lineHeader.style.border = `4px solid ${color}`;
            lineHeader.style.backgroundColor = 'transparent';
            lineHeader.style.padding = '5px';
            lineHeader.style.marginBottom = '5px';
    
            var title = document.createElement('h4');
            title.textContent = formattedName;
            title.style.color = 'black';
            title.style.alignContent = 'center';
            title.style.fontSize = '1.5em';
            title.style.marginBottom = '7px';
            title.style.marginTop = '7px';
    
            lineHeader.appendChild(title);
            legendContainer.appendChild(lineHeader);
        }
    
        var fileContainer = document.createElement('div');
        fileContainer.id = 'file-' + sanitizedFileName; // Usamos el nombre de archivo sanitizado
        fileContainer.style.display = 'flex';
        fileContainer.style.alignItems = 'center';
        fileContainer.style.justifyContent = 'space-between';
    
        var checkboxLabelDiv = document.createElement('div');
        checkboxLabelDiv.style.display = 'flex';
        checkboxLabelDiv.style.alignItems = 'center';
    
        var checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = false;
    
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                if (clusterEnabled) {
                    markerClusters.addLayer(archivosEnCluster[nombreArchivo]);
                    map.addLayer(markerClusters);
                } else {
                    map.addLayer(archivosEnCluster[nombreArchivo]);
                }
            } else {
                markerClusters.removeLayer(archivosEnCluster[nombreArchivo]);
                map.removeLayer(archivosEnCluster[nombreArchivo]);
            }
        });
    
        var label = document.createElement('label');
        label.textContent = nombreArchivo;
        label.style.marginLeft = '5px';
    
        checkboxLabelDiv.appendChild(checkbox);
        checkboxLabelDiv.appendChild(label);
    
        var removeButtonDiv = document.createElement('div');
        removeButtonDiv.style.display = 'flex';
        removeButtonDiv.style.justifyContent = 'flex-end';
    
        var removeButton = document.createElement('button');
        removeButton.textContent = "❌";
        removeButton.className = 'remove-button';
        removeButton.addEventListener("click", function () {
            eliminarArchivoCSV(nombreArchivo, fileContainer, lineHeader);
        });
    
        removeButtonDiv.appendChild(removeButton);
        fileContainer.appendChild(checkboxLabelDiv);
        fileContainer.appendChild(removeButtonDiv);
        lineHeader.appendChild(fileContainer);
    }
    
    
    
    
    
    
    
    

    function eliminarArchivoCSV(nombreArchivo, fileContainer, lineHeader) {
        Swal.fire({
            title: "¿Estás seguro?",
            text: `Eliminarás la línea "${nombreArchivo}". Tendrás que volver a cargar la capa para poder visualizarla.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                // Procede con la eliminación si el usuario confirma
                if (archivosEnCluster[nombreArchivo]) {
                    markerClusters.removeLayer(archivosEnCluster[nombreArchivo]);
                    delete archivosEnCluster[nombreArchivo];
    
                    if (markerClusters.getLayers().length === 0) {
                        map.removeLayer(markerClusters);
                    }
                }
    
                if (fileContainer) {
                    fileContainer.remove();
                }
    
                if (lineHeader.childElementCount === 1) {
                    lineHeader.remove();
                }
    
                console.log(`Archivo CSV eliminado: ${nombreArchivo}`);
    
                Swal.fire("Eliminado", `La línea "${nombreArchivo}" ha sido eliminada.`, "success");
            }
        });
    }
    
    
    
    
    
    
    
    
    

function cargarCSVsPrecargados() {
    const categorias = [
        { tipo: "Linea", carpeta: "lineas", leyenda: "legend-content" },
        { tipo: "Taxi", carpeta: "taxis", leyenda: "legend-content-taxis" },
        { tipo: "Casa", carpeta: "casas", leyenda: "legend-content-casas" },
        { tipo: "Colegio", carpeta: "colegios", leyenda: "legend-content-colegios" }
    ];

    categorias.forEach(categoria => {
        fetch(`data/${categoria.carpeta}/listado.json`)
            .then(response => response.json())
            .then(files => {
                console.log(`Archivos encontrados en ${categoria.carpeta}:`, files);
                files.forEach(file => {
                    let filePath = `data/${categoria.carpeta}/${file}`;
                    console.log(`Intentando cargar: ${filePath}`);

                    //  AHORA hacemos fetch al CSV para obtener su contenido real 
                    fetch(filePath)
                        .then(response => response.text()) // Extraer contenido del archivo
                        .then(csvText => {
                            console.log(`Contenido de ${file}:`, csvText.substring(0, 200)); // Mostrar solo una parte del contenido
                            cargarCSVDesdeTexto(csvText, file, categoria.tipo);
                        })
                        .catch(error => console.error(`Error cargando CSV ${file}:`, error));
                });
            })
            .catch(error => console.error(`Error cargando lista de CSVs en ${categoria.carpeta}:`, error));
    });
}



    function crearInputArchivo(tipo) {
        var fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".csv";
        fileInput.multiple = true;
        fileInput.addEventListener("change", function(event) {
            var files = event.target.files;
            Array.from(files).forEach(file => {
                var reader = new FileReader();
                reader.onload = function(e) {
                    // Si el tipo es "Línea", asegúrate de que el parámetro es correcto
                    var tipoFinal = tipo === "Linea" ? "" : tipo; 
                    cargarCSVDesdeTexto(e.target.result, file.name, tipoFinal);
                };
                reader.readAsText(file);
            });
        });
        fileInput.click();
    }
    
    

    document.getElementById("addLayerButton").addEventListener("click", function() {
        crearInputArchivo("Linea");
    });
    
    document.getElementById("addTaxiButton").addEventListener("click", function() {
        crearInputArchivo("Taxi");
    });
    
    document.getElementById("addCasaButton").addEventListener("click", function() {
        crearInputArchivo("Casa");
    });
    
    document.getElementById("addColegioButton").addEventListener("click", function() {
        crearInputArchivo("Colegio");
    });
    

    cargarCSVsPrecargados();
});

// Hacer `openTab` accesible globalmente
window.openTab = function(evt, tabName) {
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
};
