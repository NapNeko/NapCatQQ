$ErrorActionPreference = 'Stop'
$auditRoot = Join-Path ([IO.Path]::GetTempPath()) 'napcat-windows-launcher-tests'
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../packages/napcat-shell-loader'))
New-Item -ItemType Directory -Path $auditRoot -Force | Out-Null
$compiledStub = Join-Path $auditRoot ('stub-' + [guid]::NewGuid().ToString('N') + '.exe')
& (Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe') /nologo ("/out:" + $compiledStub) (Join-Path $PSScriptRoot 'windows-launcher-stub.cs')
if ($LASTEXITCODE -ne 0) { throw 'Failed to compile launcher fixture' }
$stubDirectory = Join-Path $auditRoot 'tools'
New-Item -ItemType Directory -Path $stubDirectory -Force | Out-Null
foreach ($stubName in @('reg.exe', 'net.exe', 'powershell.exe')) {
    Copy-Item -LiteralPath $compiledStub -Destination (Join-Path $stubDirectory $stubName) -Force
}
$results = [Collections.Generic.List[object]]::new()
foreach ($launcher in @('launcher.bat', 'launcher-win10.bat', 'launcher-user.bat', 'launcher-win10-user.bat')) {
    foreach ($pathKind in @('plain', 'space', 'special', 'unquoted', 'missing-registry', 'boot-error', 'elevation')) {
        if ($pathKind -eq 'elevation' -and $launcher -like '*-user.bat') { continue }
        $directoryName = switch ($pathKind) {
            plain { 'plain' }
            space { 'space path' }
            special { "路径 & () ! # ' test" }
            default { "路径 & () ! # ' $pathKind" }
        }
        $fixture = Join-Path $auditRoot ($launcher.Replace('.bat', '') + '\' + $directoryName)
        New-Item -ItemType Directory -Path $fixture -Force | Out-Null
        Copy-Item -LiteralPath (Join-Path $sourceRoot $launcher) -Destination $fixture -Force
        Copy-Item -LiteralPath $compiledStub -Destination (Join-Path $fixture 'NapCatWinBootMain.exe') -Force
        New-Item -ItemType File -Path (Join-Path $fixture 'QQ.exe') -Force | Out-Null
        $output = Join-Path $fixture 'arguments.txt'
        if (Test-Path -LiteralPath $output) { Remove-Item -LiteralPath $output }
        $startInfo = [Diagnostics.ProcessStartInfo]::new()
        $startInfo.FileName = $env:ComSpec
        $startInfo.Arguments = '/d /s /c ""' + (Join-Path $fixture $launcher) + '" -q "123456" "argument with spaces" "literal!value""'
        $startInfo.WorkingDirectory = $auditRoot
        $startInfo.UseShellExecute = $false
        $startInfo.CreateNoWindow = $true
        $startInfo.RedirectStandardInput = $true
        $startInfo.RedirectStandardOutput = $true
        $startInfo.RedirectStandardError = $true
        $startInfo.EnvironmentVariables['PATH'] = $stubDirectory + ';' + $env:PATH
        $startInfo.EnvironmentVariables['NAPCAT_AUDIT_UNINSTALL'] = if ($pathKind -eq 'missing-registry') { '' } elseif ($pathKind -eq 'unquoted') { Join-Path $fixture 'Uninstall.exe' } else { '"' + (Join-Path $fixture 'Uninstall.exe') + '"' }
        $startInfo.EnvironmentVariables['NAPCAT_AUDIT_NET_STATUS'] = if ($pathKind -eq 'elevation') { '1' } else { '0' }
        $startInfo.EnvironmentVariables['NAPCAT_AUDIT_BOOT_STATUS'] = if ($pathKind -eq 'boot-error') { '31' } else { '0' }
        $startInfo.EnvironmentVariables['NAPCAT_AUDIT_OUTPUT'] = $output
        $process = [Diagnostics.Process]::Start($startInfo)
        $stdout = $process.StandardOutput.ReadToEndAsync()
        $stderr = $process.StandardError.ReadToEndAsync()
        $process.StandardInput.WriteLine('')
        $process.StandardInput.Close()
        if (-not $process.WaitForExit(10000)) {
            & taskkill.exe /PID $process.Id /T /F | Out-Null
            throw "$launcher $pathKind timed out"
        }
        $expected = @((Join-Path $fixture 'QQ.exe'), (Join-Path $fixture 'NapCatWinBootHook.dll'), '-q', '123456', 'argument with spaces', 'literal!value')
        if ($pathKind -eq 'missing-registry') { $expected = @() }
        if ($pathKind -eq 'elevation') {
            $terminal = if ($launcher -eq 'launcher.bat') { 'wt.exe' } else { 'powershell.exe' }
            $expected = @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', (Join-Path $fixture 'launcher-elevate.ps1'), $terminal, (Join-Path $fixture $launcher), '-q', '123456', 'argument with spaces', 'literal!value')
        }
        $actual = @()
        if (Test-Path -LiteralPath $output) {
            $actual = @(Get-Content -LiteralPath $output -Encoding UTF8 | Select-Object -Skip 1 | ForEach-Object { [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($_)) })
        }
        $passed = $actual.Count -eq $expected.Count
        for ($argumentIndex = 0; $argumentIndex -lt $expected.Count -and $passed; $argumentIndex++) {
            $passed = $actual[$argumentIndex] -ceq $expected[$argumentIndex]
        }
        $expectedExit = if ($pathKind -eq 'missing-registry') { 1 } elseif ($pathKind -eq 'boot-error') { 31 } else { 0 }
        $passed = $passed -and $process.ExitCode -eq $expectedExit
        $result = [PSCustomObject]@{ launcher=$launcher; path=$pathKind; passed=$passed; exit=$process.ExitCode; actual=$actual; stdout=$stdout.Result; stderr=$stderr.Result }
        $results.Add($result)
        $result | Select-Object launcher,path,passed,exit | ConvertTo-Json -Compress
    }
}
function Start-Process {
    param([string]$FilePath, [string]$ArgumentList, [string]$Verb)
    $global:napcatAuditElevationRequest = @{ file=$FilePath; arguments=$ArgumentList; verb=$Verb }
}
foreach ($terminal in @('wt.exe', 'powershell.exe')) {
    $testScript = "C:\路径 & () ! # '\launcher.bat"
    $testArguments = @('-q', '123456', 'argument with spaces', 'literal!value', 'literal$()', 'quote"value')
    & (Join-Path $sourceRoot 'launcher-elevate.ps1') $terminal $testScript @testArguments
    $encodedCommand = ($global:napcatAuditElevationRequest.arguments -split ' ')[-1]
    $command = [Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($encodedCommand))
    $parseTokens = $null
    $parseErrors = $null
    [Management.Automation.Language.Parser]::ParseInput($command, [ref]$parseTokens, [ref]$parseErrors) | Out-Null
    $match = [regex]::Match($command, "FromBase64String\('([A-Za-z0-9+/=]+)'\)")
    $payload = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($match.Groups[1].Value)) | ConvertFrom-Json
    $passed = $parseErrors.Count -eq 0 -and $payload.script -ceq $testScript -and $global:napcatAuditElevationRequest.verb -eq 'RunAs'
    $passed = $passed -and ($payload.arguments | ConvertTo-Json -Compress) -ceq ($testArguments | ConvertTo-Json -Compress)
    $result = [PSCustomObject]@{ launcher='launcher-elevate.ps1'; path=$terminal; passed=$passed; exit=0 }
    $results.Add($result)
    $result | ConvertTo-Json -Compress
}
$results | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $auditRoot 'results.json') -Encoding UTF8
if ($results.Where({ -not $_.passed }).Count) { exit 1 }
