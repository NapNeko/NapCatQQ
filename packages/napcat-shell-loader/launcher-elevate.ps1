$ErrorActionPreference = 'Stop'
$terminal = $args[0]
$payload = @{
    script = $args[1]
    arguments = @($args | Select-Object -Skip 2)
} | ConvertTo-Json -Compress
$encodedPayload = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($payload))
$command = @"
`$payload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('$encodedPayload')) | ConvertFrom-Json
`$launchArguments = @(`$payload.arguments)
& `$payload.script @launchArguments
exit `$LASTEXITCODE
"@
$encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($command))
$commandArguments = "-NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedCommand"
if ($terminal -eq 'wt.exe') {
    Start-Process -FilePath $terminal -ArgumentList "powershell.exe $commandArguments" -Verb RunAs
} else {
    Start-Process -FilePath $terminal -ArgumentList $commandArguments -Verb RunAs
}
