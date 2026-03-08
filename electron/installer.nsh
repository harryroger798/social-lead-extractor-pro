; Custom NSIS script to kill running SnapLeads process before install/uninstall
; This prevents the "SnapLeads cannot be closed. Please close it manually and click Retry" error.

!macro customInit
  ; Kill SnapLeads and its ENTIRE process tree (including backend child processes)
  ; /f = force, /t = kill process tree (children too), /im = image name
  nsExec::ExecToLog 'taskkill /f /t /im "SnapLeads.exe"'
  nsExec::ExecToLog 'taskkill /f /t /im "snapleads.exe"'
  ; Also kill the backend binary separately (it may survive parent kill)
  nsExec::ExecToLog 'taskkill /f /im "snapleads-backend.exe"'
  ; Kill by window title as backup
  nsExec::ExecToLog 'taskkill /f /fi "WINDOWTITLE eq SnapLeads"'
  nsExec::ExecToLog 'taskkill /f /fi "WINDOWTITLE eq SnapLeads*"'
  ; Wait for processes to fully terminate and release file locks
  Sleep 2000
  ; Second pass — kill again in case anything respawned or was slow to die
  nsExec::ExecToLog 'taskkill /f /t /im "SnapLeads.exe"'
  nsExec::ExecToLog 'taskkill /f /im "snapleads-backend.exe"'
  Sleep 1500
!macroend

!macro customUnInit
  ; Kill SnapLeads and its process tree before uninstallation
  nsExec::ExecToLog 'taskkill /f /t /im "SnapLeads.exe"'
  nsExec::ExecToLog 'taskkill /f /t /im "snapleads.exe"'
  nsExec::ExecToLog 'taskkill /f /im "snapleads-backend.exe"'
  nsExec::ExecToLog 'taskkill /f /fi "WINDOWTITLE eq SnapLeads"'
  nsExec::ExecToLog 'taskkill /f /fi "WINDOWTITLE eq SnapLeads*"'
  Sleep 2000
!macroend
