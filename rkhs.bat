@echo off
node "%~dp0/app.js"  "%CD%"

REM set var=%1
REM set var=%var:~0,1%

REM IF [%~1] == [] GOTO EXEC_NAKED

REM GOTO EXEC_CMD

REM :EXEC_CMD
REM 	IF %var% == - GOTO EXEC_NAKED
REM 	node "%~dp0/app.js" %* "--base=%CD%"
REM 	GOTO END

REM :EXEC_NAKED
REM 	node "%~dp0/app.js" %* "--root=%CD%"
REM 	GOTO END

REM :END