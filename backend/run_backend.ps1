Set-Location $PSScriptRoot
.\venv\Scripts\uvicorn.exe main:app --host 127.0.0.1 --port 8000
