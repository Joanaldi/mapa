import pandas as pd
import tkinter as tk
from tkinter import filedialog
import os

def seleccionar_archivos():
    root = tk.Tk()
    root.withdraw()
    archivos = filedialog.askopenfilenames(title="Selecciona archivos de Excel",
                                           filetypes=[("Archivos Excel", "*.xlsx;*.xls")])
    return archivos

def seleccionar_carpeta():
    root = tk.Tk()
    root.withdraw()
    carpeta = filedialog.askdirectory(title="Selecciona la carpeta de destino")
    return carpeta

def excel_a_csv(archivo_excel, carpeta_destino):
    try:
        df = pd.read_excel(archivo_excel, sheet_name=0)
        
        # Asegurar que las columnas necesarias existen
        if df.shape[1] < 3:
            print(f"❌ El archivo {archivo_excel} no tiene suficientes columnas.")
            return
        
        # Renombrar columnas
        df.columns = ["WKT", "nombre", "descripción"]
        
        # Formatear WKT correctamente
        df["WKT"] = df["WKT"].apply(lambda x: f'\"POINT ({x.split("(")[1].split(")")[0]})\"' if "POINT" in x else x)

        
        # Obtener nombre del archivo sin extensión
        nombre_archivo = os.path.splitext(os.path.basename(archivo_excel))[0]
        ruta_csv = os.path.join(carpeta_destino, f"{nombre_archivo}.csv")
        
        # Guardar el archivo en el formato correcto
        df.to_csv(ruta_csv, index=False, encoding='utf-8', quoting=3)  # quoting=3 evita comillas extras
        
        print(f"✅ Convertido: {ruta_csv}")
    except Exception as e:
        print(f"❌ Error con {archivo_excel}: {e}")

def main():
    archivos_excel = seleccionar_archivos()
    if not archivos_excel:
        print("No se seleccionaron archivos.")
        return

    carpeta_destino = seleccionar_carpeta()
    if not carpeta_destino:
        print("No se seleccionó una carpeta de destino.")
        return

    for archivo in archivos_excel:
        excel_a_csv(archivo, carpeta_destino)

    print("🎉 Conversión finalizada.")

if __name__ == "__main__":
    main()
