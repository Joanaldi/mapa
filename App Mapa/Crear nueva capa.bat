@echo off
echo Instalando pandas y openpyxl...
pip install pandas openpyxl --user

echo Agregando Python al PATH temporalmente...
set PATH=%PATH%;C:\Users\alvar\AppData\Roaming\Python\Python310\Scripts

echo Ejecutando el script...
cd /d "C:\Users\alvar\OneDrive\Escritorio\App Mapa\scripts"
python convertirExcel.py

pause
