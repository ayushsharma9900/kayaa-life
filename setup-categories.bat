@echo off
echo Setting up dynamic categories...
cd backend
echo.
echo Running category cleanup...
npm run cleanup:categories
echo.
echo Creating dynamic categories...
npm run seed:categories
echo.
echo Category setup complete!
pause