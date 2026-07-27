<#
.SYNOPSIS
  Control the blog pipeline from PowerShell.

.DESCRIPTION
  Reads CRON_SECRET from .env.local and calls the production endpoints, so the
  secret never has to be pasted into a terminal or a chat window.

  Two Windows gotchas this script exists to absorb:

  1. The API paths need their trailing slash. next.config.mjs sets
     trailingSlash: true, so the bare path returns a 308 redirect and the
     Authorization header is not replayed to the redirect target.
  2. This file is deliberately pure ASCII. Windows PowerShell 5.1 reads .ps1
     as ANSI when there is no BOM, so a UTF-8 em dash inside a string decodes
     to a byte that CP1252 maps to a closing quote, which breaks parsing in
     confusing ways.

.EXAMPLE
  .\scripts\blog.ps1 status      # what is live, banked and queued
  .\scripts\blog.ps1 generate    # write one article into the bank (~3 min)
  .\scripts\blog.ps1 publish     # publish the oldest banked article now
  .\scripts\blog.ps1 reping      # re-submit published URLs to search engines
#>

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [ValidateSet('status', 'generate', 'publish', 'reping')]
  [string]$Command = 'status',

  [string]$Site = 'https://www.thebrandfriend.com'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env.local'

if (-not (Test-Path $envFile)) {
  Write-Host "No .env.local found at $envFile" -ForegroundColor Red
  exit 1
}

$line = (Select-String -Path $envFile -Pattern '^\s*CRON_SECRET\s*=').Line
if (-not $line) {
  Write-Host "CRON_SECRET is not set in .env.local" -ForegroundColor Red
  exit 1
}
$secret = ($line -replace '^\s*CRON_SECRET\s*=', '').Trim().Trim('"').Trim("'")

function Invoke-Endpoint {
  param([string]$Path)

  $uri = "$Site$Path"
  Write-Host "-> $uri" -ForegroundColor DarkGray
  try {
    # Generation can run for minutes; publish and reping are quick.
    return Invoke-RestMethod -Uri $uri -Headers @{ Authorization = "Bearer $secret" } -TimeoutSec 320
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
      Write-Host "401 Unauthorized. The CRON_SECRET in .env.local does not match the value set on Vercel." -ForegroundColor Red
    } else {
      Write-Host "HTTP $code" -ForegroundColor Red
      if ($_.ErrorDetails.Message) { Write-Host $_.ErrorDetails.Message }
    }
    exit 1
  }
}

switch ($Command) {

  'generate' {
    Write-Host "Generating an article. This takes about 3 minutes." -ForegroundColor Cyan
    Invoke-Endpoint '/api/blog/generate/?force=1' | ConvertTo-Json -Depth 8
  }

  'publish' {
    Write-Host "Publishing the oldest banked article." -ForegroundColor Cyan
    Invoke-Endpoint '/api/blog/publish/?force=1' | ConvertTo-Json -Depth 8
  }

  'reping' {
    Write-Host "Re-submitting published URLs to search engines." -ForegroundColor Cyan
    $r = Invoke-Endpoint '/api/blog/publish/?reping=1'
    $r | ConvertTo-Json -Depth 8

    if ($r.detail.indexing.google -eq 'failed') {
      Write-Host ""
      Write-Host "Google rejected the submission." -ForegroundColor Yellow
      Write-Host "  reason : $($r.detail.indexing.googleMessage)"
      Write-Host "  account: $($r.detail.indexing.googleAccount)"
      Write-Host "  fix    : add that account as an OWNER of the Search Console"
      Write-Host "           property covering $Site, then run this again."
    } elseif ($r.detail.indexing.google -eq 'sent') {
      Write-Host ""
      Write-Host "Google accepted the submission." -ForegroundColor Green
    }
  }

  'status' {
    Write-Host "PRODUCTION" -ForegroundColor Cyan
    foreach ($p in '/', '/blog/', '/sitemap.xml', '/robots.txt') {
      try {
        $res = Invoke-WebRequest -Uri "$Site$p" -Method Head -TimeoutSec 40 -UseBasicParsing
        Write-Host ("  {0,-16} {1}" -f $p, $res.StatusCode)
      } catch {
        Write-Host ("  {0,-16} ERROR {1}" -f $p, $_.Exception.Response.StatusCode.value__) -ForegroundColor Red
      }
    }

    Write-Host ""
    Write-Host "SITEMAP" -ForegroundColor Cyan
    try {
      $sm = (Invoke-WebRequest -Uri "$Site/sitemap.xml" -TimeoutSec 40 -UseBasicParsing).Content
      $all = ([regex]::Matches($sm, '<loc>')).Count
      $blog = ([regex]::Matches($sm, '<loc>[^<]*/blog/[a-z]')).Count
      Write-Host "  $all URLs, $blog published article(s)"
    } catch {
      Write-Host "  sitemap unreachable" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Run '.\scripts\blog.ps1 generate' to add an article to the bank." -ForegroundColor DarkGray
  }
}
