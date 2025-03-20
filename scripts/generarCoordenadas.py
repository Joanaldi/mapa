import pandas as pd
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut
import time
import tkinter as tk
from tkinter import filedialog

def get_coordinates(address):
    geolocator = Nominatim(user_agent="geo_locator")
    try:
        location = geolocator.geocode(address, timeout=10)
        if location:
            return f"POINT({location.longitude} {location.latitude})"
        else:
            return None
    except GeocoderTimedOut:
        return None

def process_addresses(file_path):
    df = pd.read_excel(file_path)
    df["WKT"] = None
    df["Calle + Número"] = df["Calle"] + " " + df["Numero"].astype(str)
    
    for index, row in df.iterrows():
        address = f"{row['Calle']} {row['Numero']}, {row['Localidad']}, {row['Provincia']}, España"
        wkt = get_coordinates(address)
        df.at[index, "WKT"] = wkt
        print(f"Procesado: {address} -> {wkt}")
        time.sleep(1)  # Pausa para evitar bloqueos en la API
    
    df = df[["WKT", "Nombre", "Calle Número"]]  # Reorganizar columnas
    output_file = file_path.replace(".xlsx", "_con_coordenadas.xlsx")
    df.to_excel(output_file, index=False)
    print(f"Proceso completado. Archivo guardado como '{output_file}'")

def select_file():
    root = tk.Tk()
    root.withdraw()
    file_path = filedialog.askopenfilename(title="Seleccionar archivo Excel", filetypes=[("Excel files", "*.xlsx")])
    if file_path:
        process_addresses(file_path)
    else:
        print("No se seleccionó ningún archivo.")

# Ejecutar selector de archivo
select_file()
