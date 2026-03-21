# APEX Vault Starter — Windows Setup Script
# Run this once: Right-click → "Run with PowerShell" (or in PowerShell terminal)
# Requires: Windows 10/11, internet connection

$ErrorActionPreference = "Stop"
$VaultRoot = "$env:USERPROFILE\apex-vault"
$RepoRoot  = $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  APEX Vault Starter — Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check Node.js ──────────────────────────────────────────────────
Write-Host "[1/6] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVer = & node --version 2>&1
    Write-Host "  Node.js found: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "  Node.js not found. Installing via winget..." -ForegroundColor Yellow
    try {
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        Write-Host "  Node.js installed. Please restart PowerShell and run setup.ps1 again." -ForegroundColor Green
        Read-Host "Press Enter to exit"
        exit 0
    } catch {
        Write-Host "  ERROR: Could not install Node.js automatically." -ForegroundColor Red
        Write-Host "  Please download from: https://nodejs.org (LTS version)" -ForegroundColor Red
        Write-Host "  Then run this script again." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# ── Step 2: Create vault folder structure ─────────────────────────────────
Write-Host "[2/6] Creating vault at $VaultRoot..." -ForegroundColor Yellow
$dirs = @(
    "Tasks", "KnowledgeBriefs", "Agents", "Skills", "Decisions",
    "Incidents", "Repos", "DailyNotes", "WeeklyReviews",
    "Signals", "Governance", "Leads", "AgentLogs", "PRs"
)
New-Item -ItemType Directory -Force -Path $VaultRoot | Out-Null
foreach ($d in $dirs) {
    New-Item -ItemType Directory -Force -Path "$VaultRoot\$d" | Out-Null
}

# Copy starter notes from repo vault/
$starterVault = Join-Path $RepoRoot "vault"
if (Test-Path $starterVault) {
    Copy-Item -Path "$starterVault\*" -Destination $VaultRoot -Recurse -Force
    Write-Host "  Starter notes copied." -ForegroundColor Green
}
Write-Host "  Vault created at: $VaultRoot" -ForegroundColor Green

# ── Step 3: Install MCP server dependencies ────────────────────────────────
Write-Host "[3/6] Installing MCP server..." -ForegroundColor Yellow
$mcpDir = Join-Path $RepoRoot "mcp-server"
Push-Location $mcpDir
try {
    & npm install --silent
    Write-Host "  MCP server dependencies installed." -ForegroundColor Green
} catch {
    Write-Host "  ERROR: npm install failed. Check Node.js is in PATH." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# ── Step 4: Create .env file ───────────────────────────────────────────────
Write-Host "[4/6] Creating configuration..." -ForegroundColor Yellow
$envFile = Join-Path $RepoRoot ".env"
if (-not (Test-Path $envFile)) {
    $envContent = "VAULT_PATH=$($VaultRoot -replace '\\', '\\')`n"
    Set-Content -Path $envFile -Value $envContent
    Write-Host "  .env created. Vault path set to: $VaultRoot" -ForegroundColor Green
} else {
    Write-Host "  .env already exists, skipping." -ForegroundColor Green
}

# ── Step 5: Wire into Claude Desktop ──────────────────────────────────────
Write-Host "[5/6] Configuring Claude Desktop..." -ForegroundColor Yellow
$claudeConfigDir  = "$env:APPDATA\Claude"
$claudeConfigFile = "$claudeConfigDir\claude_desktop_config.json"
$mcpServerPath    = (Join-Path $mcpDir "index.js") -replace '\\', '\\'
$vaultPathEscaped = $VaultRoot -replace '\\', '\\'

New-Item -ItemType Directory -Force -Path $claudeConfigDir | Out-Null

$newEntry = @{
    command = "node"
    args    = @($mcpServerPath)
    env     = @{ VAULT_PATH = $VaultRoot }
}

if (Test-Path $claudeConfigFile) {
    $config = Get-Content $claudeConfigFile -Raw | ConvertFrom-Json
    if (-not $config.mcpServers) {
        $config | Add-Member -NotePropertyName mcpServers -NotePropertyValue @{} -Force
    }
    $config.mcpServers | Add-Member -NotePropertyName "apex-vault" -NotePropertyValue $newEntry -Force
} else {
    $config = @{
        mcpServers = @{
            "apex-vault" = $newEntry
        }
    }
}

$config | ConvertTo-Json -Depth 10 | Set-Content $claudeConfigFile -Encoding UTF8
Write-Host "  Claude Desktop configured." -ForegroundColor Green
Write-Host "  Config: $claudeConfigFile" -ForegroundColor Gray

# ── Step 6: Create desktop shortcut to open vault in Obsidian ─────────────
Write-Host "[6/6] Creating helper scripts..." -ForegroundColor Yellow

# start-vault-mcp.ps1 (manual launch for debugging)
$startScript = @"
# Start APEX Vault MCP server manually (for testing)
`$env:VAULT_PATH = "$VaultRoot"
node "$($mcpDir -replace '\\','\\')\\index.js"
"@
Set-Content -Path (Join-Path $RepoRoot "start-mcp-debug.ps1") -Value $startScript

Write-Host "  start-mcp-debug.ps1 created (for testing the MCP server)." -ForegroundColor Green

# ── Done ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Open Obsidian → 'Open folder as vault' → select: $VaultRoot" -ForegroundColor Cyan
Write-Host "  2. Restart Claude Desktop" -ForegroundColor Cyan
Write-Host "  3. In Claude, type: use the apex-vault tool to search my vault" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your vault is at: $VaultRoot" -ForegroundColor Yellow
Write-Host "Claude MCP config: $claudeConfigFile" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to close"
