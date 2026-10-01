#!/bin/bash
DOMAIN="loevraenterprises.publicvm.com"

echo "=== Dynamic DNS Verification for $DOMAIN ==="

# 1. Fetch public IP
CURRENT_IP=$(curl -s --max-time 5 https://api.ipify.org || curl -s --max-time 5 https://ifconfig.me)
echo "[1/3] Local Machine Public IP : $CURRENT_IP"

# 2. Resolve DNS
DNS_IP=$(dig +short $DOMAIN @8.8.8.8 | tail -n1)
echo "[2/3] Current DNS A-Record    : $DNS_IP"

# 3. Compare
if [ "$CURRENT_IP" = "$DNS_IP" ]; then
    echo "[3/3] STATUS: MATCH! DNS matches machine's public IP."
else
    echo "[3/3] STATUS: MISMATCH DETECTED!"
    echo "Domain points to $DNS_IP, but machine is on $CURRENT_IP."
    echo "To update DNSExit with your current IP:"
    echo "curl \"http://update.dnsexit.com/remoteupdate.sv?login=YOUR_LOGIN&password=YOUR_PASSWORD&host=$DOMAIN&myip=$CURRENT_IP\""
fi
