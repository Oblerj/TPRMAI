@echo off
echo Generating TPRM Process Flow SVG Diagrams...
echo.

set MMDC=node_modules\.bin\mmdc.cmd
set INPUT_DIR=diagrams\mermaid
set OUTPUT_DIR=diagrams\svg

if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Processing diagrams...

for %%f in (%INPUT_DIR%\*.mmd) do (
    echo   Converting %%~nf.mmd to SVG...
    call %MMDC% -i "%%f" -o "%OUTPUT_DIR%\%%~nf.svg" -b white -w 1200
)

echo.
echo Done! SVG files saved to %OUTPUT_DIR%
echo.
echo You can now import these SVG files into Lucidchart:
echo   1. Open Lucidchart
echo   2. Go to File ^> Import
echo   3. Select the SVG files from diagrams\svg folder
echo.
pause
