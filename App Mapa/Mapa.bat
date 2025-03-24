@echo off
echo Comprobando si Python está instalado...

:: Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python no está instalado. Instalando ahora...
    echo Descargando Python...
    
    :: Descargar el instalador de Python
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.10.9/python-3.10.9-amd64.exe' -OutFile 'python_installer.exe'}"

    echo Instalando Python...
    start /wait python_installer.exe InstallAllUsers=1 PrependPath=1
    
    echo Eliminando instalador...
    del python_installer.exe
    
    echo Python instalado correctamente.
)

:: Verificar que la instalación fue exitosa
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Hubo un error al instalar Python. Por favor, instálalo manualmente e intenta de nuevo.
    pause
    exit /b
)

@echo off
echo Generando listado de archivos CSV...

cd /d "%~dp0\scripts"
python generar_listado.py

cd /d "%~dp0\src"
echo Iniciando servidor...
start "" python -m http.server 8000 --bind 0.0.0.0

:: Abrir la web en el navegador predeterminado
start "" http://localhost:8000


pause