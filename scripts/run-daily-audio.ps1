# Daily silent runner for Windows Task Scheduler (NeuralPathDailyAudio).
# Triggered BOTH daily at 15:10 AND at Windows logon (with 30s delay), via
# run-daily-audio.vbs so no console window ever flashes or gets closed accidentally.
# Uses a quota-cycle stamp file (resets daily at 15:05 Bangkok time / ~00:05 PT).

param(
  [switch]$Force
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogFile = Join-Path $PSScriptRoot ".audio-upgrade.log"
$StampFile = Join-Path $PSScriptRoot ".last-audio-run-date"

# Quota cycle key: shifts clock back 15h05m so 15:05 today -> 15:04 tomorrow share one key
$now = Get-Date
$cycleKey = $now.AddHours(-15).AddMinutes(-5).ToString("yyyy-MM-dd")

if (-not $Force -and (Test-Path $StampFile)) {
  $lastKey = (Get-Content -Path $StampFile -Raw -ErrorAction SilentlyContinue).Trim()
  if ($lastKey -eq $cycleKey) {
    exit 0
  }
}

function Write-Log([string]$msg) {
  [System.IO.File]::AppendAllText($LogFile, "$msg`r`n", [System.Text.UTF8Encoding]::new($false))
}

# Ensure user-installed uv / Python paths are on PATH inside non-interactive Scheduled Tasks
$extraPaths = @(
  (Join-Path $env:USERPROFILE ".local\bin"),
  (Join-Path $env:USERPROFILE ".cargo\bin"),
  (Join-Path $env:LOCALAPPDATA "Programs\uv")
)
foreach ($p in $extraPaths) {
  if ((Test-Path $p) -and ($env:Path -notlike "*$p*")) {
    $env:Path = "$p;$env:Path"
  }
}

$stamp = $now.ToString("yyyy-MM-dd HH:mm:ss")
Write-Log ""
Write-Log "========== [$stamp] NeuralPathDailyAudio start (cycle=$cycleKey) =========="

Push-Location $ProjectRoot
try {
  $uvCmd = (Get-Command uv -ErrorAction SilentlyContinue).Source
  if (-not $uvCmd) {
    Write-Log "ERROR: 'uv' executable not found on PATH ($env:Path)"
    exit 1
  }

  # Stream lines live into UTF-8 log; upload directly to Supabase Storage and prune local MP3s
  $cmdLine = "`"$uvCmd`" run --quiet --with google-genai --with lameenc python scripts/generate-audio.py --all --skip-gemini --upload-supabase --prune-local --stop-on-daily-quota --sync-registry --delay 22 2>&1"
  & cmd.exe /c $cmdLine | ForEach-Object { Write-Log ([string]$_) }
  $code = $LASTEXITCODE

  if ($code -eq 0) {
    Set-Content -Path $StampFile -Value $cycleKey -NoNewline
  }
  $endStamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  Write-Log "========== [$endStamp] Finished (exit=$code) =========="
  exit $code
} finally {
  Pop-Location
}
