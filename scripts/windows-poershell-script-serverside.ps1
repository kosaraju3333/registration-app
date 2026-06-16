param(
    [string]$username
)

$ProgressPreference = 'SilentlyContinue'

# Find the user's session
$line = quser | Select-String "^\s*$username\s"

if ($line) {

    # Split into columns and remove empty entries
    $fields = ($line -split '\s+') | Where-Object { $_ -ne '' }

    # Last two columns are ID and STATE
    $sessionId = $fields[1]

    Write-Host "Logging off session $sessionId"

    logoff $sessionId

    Start-Sleep -Seconds 3
}

# Delete the user account
Remove-LocalUser -Name $username -ErrorAction SilentlyContinue

# Remove the profile
Get-CimInstance Win32_UserProfile |
Where-Object { $_.LocalPath -eq "C:\Users\$username" } |
Remove-CimInstance -ErrorAction SilentlyContinue

Write-Output "USER_DELETED_SUCCESS"
