<#
.SYNOPSIS
  TECHNOVA Deployment Packager & Synchronizer
.DESCRIPTION
  Synchronizes the master index.html into all 6 team deployment folders with proper relative paths,
  or exports 6 completely standalone self-contained folders with all assets bundled for distribution.
#>

param(
  [switch]$Standalone = $false
)

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$teams = @("team-01", "team-02", "team-03", "team-04", "team-05", "team-06")

$masterHtml = Get-Content -Raw -Path (Join-Path $baseDir "index.html")

foreach ($team in $teams) {
  $targetDir = Join-Path $baseDir "deployments\$team"
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }

  if ($Standalone) {
    # Copy all assets and JS locally into the team folder for 100% isolated deployment
    Copy-Item (Join-Path $baseDir "styles.css") -Destination $targetDir -Force
    Copy-Item (Join-Path $baseDir "questions.js") -Destination $targetDir -Force
    Copy-Item (Join-Path $baseDir "audio.js") -Destination $targetDir -Force
    Copy-Item (Join-Path $baseDir "mascot.js") -Destination $targetDir -Force
    Copy-Item (Join-Path $baseDir "game.js") -Destination $targetDir -Force
    Copy-Item -Recurse (Join-Path $baseDir "assets") -Destination (Join-Path $targetDir "assets") -Force
    
    # In standalone, all paths remain relative to ./
    $standaloneHtml = $masterHtml
    Set-Content -Path (Join-Path $targetDir "index.html") -Value $standaloneHtml -Encoding UTF8
    Write-Host "[OK] Packaged Standalone Folder: $targetDir" -ForegroundColor Green
  } else {
    # Linked deployment: references root assets to prevent unnecessary duplication
    $linkedHtml = $masterHtml
    $linkedHtml = $linkedHtml -replace 'href="\./styles\.css"', 'href="../../styles.css"'
    $linkedHtml = $linkedHtml -replace 'src="\./questions\.js"', 'src="../../questions.js"'
    $linkedHtml = $linkedHtml -replace 'src="\./audio\.js"', 'src="../../audio.js"'
    $linkedHtml = $linkedHtml -replace 'src="\./mascot\.js"', 'src="../../mascot.js"'
    $linkedHtml = $linkedHtml -replace 'src="\./game\.js"', 'src="../../game.js"'
    # config remains ./config.js
    Set-Content -Path (Join-Path $targetDir "index.html") -Value $linkedHtml -Encoding UTF8
    Write-Host "[OK] Updated Linked Deployment: $targetDir\index.html" -ForegroundColor Cyan
  }
}

Write-Host "Deployment preparation complete for all 6 teams!" -ForegroundColor Green
