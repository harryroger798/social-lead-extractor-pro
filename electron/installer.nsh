; Custom NSIS script to kill running SnapLeads process before install/uninstall
; This prevents the "SnapLeads cannot be closed. Please close it manually and click Retry" error.

!macro customInit
  ; Kill any running SnapLeads process before installation begins
  nsExec::ExecToLog 'taskkill /f /im "SnapLeads.exe"'
  nsExec::ExecToLog 'taskkill /f /im "snapleads.exe"'
  ; Wait a moment for processes to fully terminate and release file locks
  Sleep 1500
!macroend

!macro customUnInit
  ; Kill any running SnapLeads process before uninstallation begins
  nsExec::ExecToLog 'taskkill /f /im "SnapLeads.exe"'
  nsExec::ExecToLog 'taskkill /f /im "snapleads.exe"'
  Sleep 1500
!macroend
