# Nettoie uniquement les Chrome headless de test Playwright (profils temp),
# jamais le Chrome de l'utilisateur. Liste ensuite les node/vite et la RAM libre.
Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
  Where-Object { $_.CommandLine -match 'playwright_chromiumdev' } |
  ForEach-Object {
    Write-Output ("killing chrome test pid " + $_.ProcessId)
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

Write-Output "--- node processes running vite ---"
Get-CimInstance Win32_Process -Filter "Name='node.exe'" |
  Where-Object { $_.CommandLine -match 'vite' } |
  ForEach-Object {
    $cmd = $_.CommandLine
    if ($cmd.Length -gt 120) { $cmd = $cmd.Substring(0, 120) }
    Write-Output ("pid " + $_.ProcessId + " :: " + $cmd)
  }

$os = Get-CimInstance Win32_OperatingSystem
Write-Output ("--- RAM libre (Mo) : " + [math]::Round($os.FreePhysicalMemory / 1024))

