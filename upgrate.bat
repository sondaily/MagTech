@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul

title 🚀 一键推送到 GitHub - MagTech

echo --------------------------------------------------
echo           GitHub 一键更新助手 (MagTech)
echo --------------------------------------------------
echo.

:: 检查是否存在 .git 文件夹
if not exist ".git" (
    echo [错误] 当前目录下未发现 .git 仓库，请确保在项目根目录运行。
    pause
    exit /b
)

:: 显示当前状态
echo [1/3] 正在检查文件变更...
git status -s
echo.

:: 询问提交说明
set /p commit_msg="请输入代码更新说明 (直接按回车将使用默认时间戳): "

:: 如果没有输入说明，则使用当前日期时间
if "!commit_msg!"=="" (
    set "commit_msg=自动更新: %date% %time%"
)

echo.
echo [2/3] 正在添加并提交变更...
echo 说明: !commit_msg!
git add .
git commit -m "!commit_msg!"

echo.
echo [3/3] 正在推送到远程仓库...
git push

echo.
echo --------------------------------------------------
echo ✅ 操作完成！
echo --------------------------------------------------
echo.
pause
