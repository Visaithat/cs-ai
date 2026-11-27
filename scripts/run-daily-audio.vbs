' Truly windowless launcher for Windows Task Scheduler (prevents PowerShell console flash / 0xC000013A)
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
psScript = scriptDir & "\run-daily-audio.ps1"

Set shell = CreateObject("WScript.Shell")
cmd = "powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File """ & psScript & """"
exitCode = shell.Run(cmd, 0, True)
WScript.Quit exitCode
