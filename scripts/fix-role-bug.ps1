# =============================================
# Script: Quick Fix for Role Bug (PowerShell)
# Description: Chạy migration và fix users hiện tại
# =============================================

Write-Host "🔧 Fixing Role Bug..." -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
$supabaseCmd = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseCmd) {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install it first:"
    Write-Host "  npm install -g supabase"
    Write-Host ""
    Write-Host "Or run the migration manually in Supabase Dashboard:"
    Write-Host "  1. Go to SQL Editor"
    Write-Host "  2. Copy content from: supabase/migrations/003_fix_default_role.sql"
    Write-Host "  3. Run it"
    Write-Host "  4. Then copy and run: supabase/fix_wrong_roles.sql"
    exit 1
}

Write-Host "Step 1: Running migration 003_fix_default_role.sql..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Migration failed. Check error above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: You need to manually run fix_wrong_roles.sql in SQL Editor" -ForegroundColor Yellow
Write-Host "  1. Open Supabase Dashboard > SQL Editor"
Write-Host "  2. Copy content from: supabase\fix_wrong_roles.sql"
Write-Host "  3. Run it to fix existing users"
Write-Host ""
Write-Host "Step 3: Test the fix" -ForegroundColor Yellow
Write-Host "  1. Try registering a new user as Worker"
Write-Host "  2. Check /debug-role page to verify role"
Write-Host ""
Write-Host "✅ Done! See FIX_ROLE_BUG.md for more details." -ForegroundColor Green

