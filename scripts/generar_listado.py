import os
import json

# Definir las carpetas donde están los CSVs
categorias = ["lineas", "taxis", "casas", "colegios"]
base_path = os.path.join(os.path.dirname(__file__), "../src/data")

for categoria in categorias:
    carpeta = os.path.join(base_path, categoria)
    archivo_salida = os.path.join(carpeta, "listado.json")

    # Crear la carpeta si no existe
    if not os.path.exists(carpeta):
        os.makedirs(carpeta)

    # Obtener lista de archivos CSV en la carpeta
    archivos = [f for f in os.listdir(carpeta) if f.endswith(".csv")]

    # Guardar la lista en un archivo JSON
    with open(archivo_salida, "w", encoding="utf-8") as f:
        json.dump(archivos, f, indent=4)

    print(f"Archivo {archivo_salida} generado con {len(archivos)} archivos.")
