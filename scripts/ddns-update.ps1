# DDNS Verification and Updater for loevraenterprises.publicvm.com
param(
    [string]$Domain = "loevraenterprises.publicvm.com",
    [string]$DnsExitLogin = "",
    [string]$DnsExitPassword = ""
)

Write-Host "=== Dynamic DNS Verification for $Domain ===" -ForegroundColor Cyan

# 1. Fetch current public IP of this machine
try {
    $CurrentPublicIP = (Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 5).Trim()
    Write-Host "[1/3] Local Machine Public IP : $CurrentPublicIP" -ForegroundColor Green
} catch {
    Write-Host "[Error] Could not fetch public IP from ipify. Trying fallback..." -ForegroundColor Yellow
    $CurrentPublicIP = (Invoke-RestMethod -Uri "https://ifconfig.me/ip" -TimeoutSec 5).Trim()
    Write-Host "[1/3] Local Machine Public IP : $CurrentPublicIP" -ForegroundColor Green
}

# 2. Resolve current DNS A-record
try {
    $DnsRecord = (Resolve-DnsName -Name $Domain -Type A -Server "8.8.8.8" -ErrorAction Stop | Select-Object -First 1).IPAddress
    Write-Host "[2/3] Current DNS A-Record    : $DnsRecord" -ForegroundColor Yellow
} catch {
    Write-Host "[2/3] DNS record could not be resolved." -ForegroundColor Red
    $DnsRecord = "UNRESOLVED"
}

# 3. Compare and Report
if ($CurrentPublicIP -eq $DnsRecord) {
    Write-Host "[3/3] STATUS: MATCH! DNS record matches this machine's public IP." -ForegroundColor Green
    Write-Host "If you still get ERR_CONNECTION_REFUSED, check:" -ForegroundColor Cyan
    Write-Host " - Web server is running (port 80 / 443)"
    Write-Host " - Router Port Forwarding forwards WAN 80/443 to this machine's LAN IP"
    Write-Host " - Windows Firewall / UFW allows inbound TCP 80 & 443"
} else {
    Write-Host "[3/3] STATUS: MISMATCH DETECTED!" -ForegroundColor Red
    Write-Host "Your domain points to $DnsRecord, but this machine is on $CurrentPublicIP." -ForegroundColor Red
    Write-Host ""
    Write-Host "To update DNSExit with your current IP, run:" -ForegroundColor Yellow
    Write-Host "curl `"http://update.dnsexit.com/remoteupdate.sv?login=YOUR_LOGIN&password=YOUR_PASSWORD&host=$Domain&myip=$CurrentPublicIP`"" -ForegroundColor White
}
