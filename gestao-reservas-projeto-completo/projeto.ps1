# Projeto.ps1 - menu para iniciar/parar LOCAL e DOCKER (ajusta backend e frontend automaticamente)

$ErrorActionPreference = "Stop"

function Write-Title($t) {
  Write-Host ""
  Write-Host "===================================" -ForegroundColor Cyan
  Write-Host ("   {0}" -f $t) -ForegroundColor Yellow
  Write-Host "===================================" -ForegroundColor Cyan
  Write-Host ""
}

function Get-Root {
  if ($PSScriptRoot) { return $PSScriptRoot }
  if ($PSCommandPath) { return (Split-Path -Parent $PSCommandPath) }
  return (Get-Location).Path
}

# Caminhos principais
$ROOT      = Get-Root
$BACKEND   = Join-Path $ROOT "gestao-reservas-backend"
$FRONTEND  = Join-Path $ROOT "gestao-reservas-frontend"
$VENV      = Join-Path $ROOT "venv"
$PYTHON    = Join-Path $VENV "Scripts\python.exe"
$PIP       = Join-Path $VENV "Scripts\pip.exe"

function Ensure-Venv {
  if (-not (Test-Path $VENV)) {
    Write-Host "-> Criando venv..." -ForegroundColor Cyan
    python -m venv $VENV
  }
}

function Pip-Install($reqFile) {
  Write-Host "-> Instalando dependências do backend..." -ForegroundColor Cyan
  & $PIP install --upgrade pip wheel > $null
  & $PIP install -r $reqFile
}

function Remove-ApiMigrations {
  $mig = Join-Path $BACKEND "api\migrations"
  if (Test-Path $mig) {
    Get-ChildItem $mig -Filter *.py | Where-Object { $_.Name -ne "__init__.py" } | Remove-Item -Force
    Get-ChildItem $mig -Filter *.pyc -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  }
}

function Backend-Migrate {
  Push-Location $BACKEND
  try {
    Write-Host "-> Aplicando migrações..." -ForegroundColor Cyan
    & $PYTHON manage.py makemigrations api
    & $PYTHON manage.py migrate
  } catch {
    $msg = $_.Exception.Message
    if ($msg -match "InconsistentMigrationHistory" -or $msg -match "no such table") {
      Write-Host "⚠️  Migrações inconsistentes detectadas. Fazendo reset seguro..." -ForegroundColor Yellow
      $db = Join-Path $BACKEND "db.sqlite3"
      if (Test-Path $db) { Remove-Item $db -Force }
      Remove-ApiMigrations
      & $PYTHON manage.py makemigrations api
      & $PYTHON manage.py migrate
    } else {
      throw
    }
  } finally { Pop-Location }
}

function Backend-EnsureUsers {
  Push-Location $BACKEND
  Write-Host "-> Garantindo superusuário admin..." -ForegroundColor Cyan
  & $PYTHON manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); u,_=U.objects.get_or_create(username='admin', defaults={'email':'admin@example.com'}); u.is_staff=True; u.is_superuser=True; u.set_password('admin123'); u.save(); print('admin ok')"
  Write-Host "-> Garantindo usuário comum user..." -ForegroundColor Cyan
  & $PYTHON manage.py shell -c "from django.contrib.auth import get_user_model; U=get_user_model(); u,_=U.objects.get_or_create(username='user', defaults={'email':'user@example.com'}); u.is_active=True; u.set_password('user123'); u.save(); print('user ok')"
  Pop-Location
}

function Start-Backend {
  Write-Host "-> Iniciando backend (http://localhost:8000)..." -ForegroundColor Green
  $cmd = "cd `"$BACKEND`"; & `"$PYTHON`" manage.py runserver 0.0.0.0:8000"
  Start-Process powershell -ArgumentList "-NoExit","-Command",$cmd | Out-Null
}

function Npm-Install-Safe {
  Param([string]$dir)
  Push-Location $dir
  try {
    Write-Host "-> Instalando dependências do frontend..." -ForegroundColor Cyan
    # tente um ci; se o lock estiver fora de sincronia, cai para install
    try { npm ci | Out-Null } catch { npm install --legacy-peer-deps | Out-Null }
  } finally { Pop-Location }
}

function Frontend-FixPostCSS {
  # Garante @tailwindcss/postcss e configuração correta
  Push-Location $FRONTEND
  try {
    Write-Host "-> Ajustando PostCSS/Tailwind..." -ForegroundColor Cyan
    npm install -D @tailwindcss/postcss tailwindcss postcss autoprefixer | Out-Null

    $postcss = @"
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
"@
    Set-Content -Path (Join-Path $FRONTEND "postcss.config.js") -Value $postcss -Encoding UTF8

    # Opcional: adiciona "type": "module" para eliminar warning do Vite
    $pkgPath = Join-Path $FRONTEND "package.json"
    if (Test-Path $pkgPath) {
      try {
        $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
        if (-not $pkg.PSObject.Properties.Name.Contains("type")) {
          $pkg | Add-Member -NotePropertyName type -NotePropertyValue "module"
          ($pkg | ConvertTo-Json -Depth 20) | Set-Content -Path $pkgPath -Encoding UTF8
        }
      } catch { }
    }

    # Ajusta CSS principal se estiver com diretivas duplicadas
    $cssPath = Join-Path $FRONTEND "src\index.css"
    if (Test-Path $cssPath) {
      $css = Get-Content $cssPath -Raw
      if ($css -match "@tailwind") {
        # migra para a sintaxe nova
@"
@import "tailwindcss";

body { @apply font-sans; }
"@ | Set-Content -Path $cssPath -Encoding UTF8
      }
    }
  } finally { Pop-Location }
}

function Start-Frontend {
  Write-Host "-> Iniciando frontend (http://localhost:5173)..." -ForegroundColor Green
  $cmd = "cd `"$FRONTEND`"; npm run dev"
  Start-Process powershell -ArgumentList "-NoExit","-Command",$cmd | Out-Null
}

function Start-Local {
  Write-Title "INICIAR LOCAL"
  if (-not (Test-Path $BACKEND)) { throw "Pasta não encontrada: $BACKEND" }
  if (-not (Test-Path $FRONTEND)) { throw "Pasta não encontrada: $FRONTEND" }

  Ensure-Venv
  Pip-Install (Join-Path $BACKEND "requirements.txt")
  Backend-Migrate
  Backend-EnsureUsers
  Start-Backend

  Npm-Install-Safe $FRONTEND
  Frontend-FixPostCSS
  Start-Frontend

  Start-Process "http://localhost:8000/admin/"
  Start-Process "http://localhost:5173/"
  Write-Host "OK - Projeto rodando localmente." -ForegroundColor Green
}

function Stop-Local {
  Write-Title "PARAR LOCAL"
  Get-Process python -ErrorAction SilentlyContinue | ForEach-Object {
    try {
      if ($_.Path -and $_.Path -like "*\venv\Scripts\python.exe") { $_ | Stop-Process -Force }
    } catch {}
  }
  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
  Write-Host "OK - Backend e Frontend locais encerrados." -ForegroundColor Green
}

function Reset-Local {
  Write-Title "RESETAR DB E MIGRAÇÕES"
  Stop-Local
  $db = Join-Path $BACKEND "db.sqlite3"
  if (Test-Path $db) { Remove-Item $db -Force }
  Remove-ApiMigrations
  Start-Local
}

function Start-Docker {
  Write-Title "INICIAR DOCKER"
  Push-Location $ROOT
  try {
    docker compose up --build -d
    Start-Process "http://localhost:8000/admin/"
    Start-Process "http://localhost:5173/"
    Write-Host "OK - Containers no ar." -ForegroundColor Green
  } finally { Pop-Location }
}

function Stop-Docker {
  Write-Title "PARAR DOCKER"
  Push-Location $ROOT
  try {
    docker compose down -v
    Write-Host "OK - Containers e volumes removidos." -ForegroundColor Green
  } finally { Pop-Location }
}

# ===================== MENU =====================

do {
  Clear-Host
  Write-Host "===================================" -ForegroundColor Cyan
  Write-Host "   GESTÃO DE RESERVAS - PROJETO" -ForegroundColor Yellow
  Write-Host "===================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "1 - Iniciar LOCAL (Python + npm)" -ForegroundColor Green
  Write-Host "2 - Iniciar DOCKER" -ForegroundColor Green
  Write-Host "3 - Parar LOCAL" -ForegroundColor Red
  Write-Host "4 - Parar DOCKER" -ForegroundColor Red
  Write-Host "5 - Resetar DB/Migrations (LOCAL)" -ForegroundColor Yellow
  Write-Host "0 - Sair" -ForegroundColor Yellow
  Write-Host ""
  $op = Read-Host "Escolha uma opção"
  try {
    switch ($op) {
      "1" { Start-Local; Read-Host "Pressione Enter para continuar..." | Out-Null }
      "2" { Start-Docker; Read-Host "Pressione Enter para continuar..." | Out-Null }
      "3" { Stop-Local;  Read-Host "Pressione Enter para continuar..." | Out-Null }
      "4" { Stop-Docker; Read-Host "Pressione Enter para continuar..." | Out-Null }
      "5" { Reset-Local; Read-Host "Pressione Enter para continuar..." | Out-Null }
      "0" { }
      default { Write-Host "Opção inválida." -ForegroundColor Red; Start-Sleep -Seconds 1 }
    }
  } catch {
    Write-Host "Erro: $($_.Exception.Message)" -ForegroundColor Red
    Read-Host "Pressione Enter para continuar..." | Out-Null
  }
} while ($op -ne "0")
