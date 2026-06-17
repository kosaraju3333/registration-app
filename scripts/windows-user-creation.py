#!/usr/bin/python3


import subprocess
import sys

username = sys.argv[1]
password = sys.argv[2]


#username = "ramakrishna"
#password = "P@ssword123!"

ps_script = (
    f"$password = ConvertTo-SecureString '{password}' -AsPlainText -Force; "
    f"New-LocalUser -Name '{username}' -Password $password -ErrorAction Stop; "
    f"Add-LocalGroupMember -Group 'Users' -Member '{username}'; "
    f"Add-LocalGroupMember -Group 'Students' -Member '{username}' -ErrorAction SilentlyContinue; "
    f"Add-LocalGroupMember -Group 'Remote Desktop Users' -Member '{username}'; "
    f"Write-Output 'USER_CREATED_SUCCESS'"
)

result = subprocess.run([
    "ssh",
    "Administrator@training-host.turingiq.ai",
    "powershell",
    "-NoProfile",
    "-Command",
    ps_script
], capture_output=True, text=True)

print(result.stdout)
print(result.stderr)
