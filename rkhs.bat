@echo off

set var=%1
set var=%var:~0,1%

IF [%~1] == [] GOTO EXEC_NAKED

GOTO EXEC_CMD

:EXEC_CMD
	IF %var% == - GOTO EXEC_NAKED
	node "%~dp0/app.js" %* "--base=%CD%"
	GOTO END

:EXEC_NAKED
	node "%~dp0/app.js" %* "--root=%CD%"
	GOTO END

:END