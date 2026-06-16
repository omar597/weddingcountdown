Set-Location $PSScriptRoot
$log = Join-Path $PSScriptRoot "push-log.txt"
"=== push started $(Get-Date -Format o) ===" | Out-File $log -Encoding utf8

function Log($msg) {
  $msg | Tee-Object -FilePath $log -Append
}

if (-not (Test-Path .git)) { git init | Out-File $log -Append }
git branch -M main 2>&1 | Out-File $log -Append
$remote = git remote get-url origin 2>$null
if (-not $remote) {
  git remote add origin https://github.com/omar597/weddingcountdown.git 2>&1 | Out-File $log -Append
} else {
  git remote set-url origin https://github.com/omar597/weddingcountdown.git 2>&1 | Out-File $log -Append
}

git add . 2>&1 | Out-File $log -Append
$status = git status --porcelain
Log $status
if ($status) {
  git commit -m "Update wedding countdown site" 2>&1 | Tee-Object -FilePath $log -Append
}
git push -u origin main 2>&1 | Tee-Object -FilePath $log -Append
Log "=== push finished $(Get-Date -Format o) ==="
