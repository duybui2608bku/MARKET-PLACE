#!/bin/bash
# =============================================
# Script: Quick Fix for Role Bug
# Description: Chạy migration và fix users hiện tại
# =============================================

echo "🔧 Fixing Role Bug..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or run the migration manually in Supabase Dashboard:"
    echo "  1. Go to SQL Editor"
    echo "  2. Copy content from: supabase/migrations/003_fix_default_role.sql"
    echo "  3. Run it"
    echo "  4. Then copy and run: supabase/fix_wrong_roles.sql"
    exit 1
fi

echo "Step 1: Running migration 003_fix_default_role.sql..."
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
else
    echo "❌ Migration failed. Check error above."
    exit 1
fi

echo ""
echo "Step 2: You need to manually run fix_wrong_roles.sql in SQL Editor"
echo "  1. Open Supabase Dashboard > SQL Editor"
echo "  2. Copy content from: supabase/fix_wrong_roles.sql"
echo "  3. Run it to fix existing users"
echo ""
echo "Step 3: Test the fix"
echo "  1. Try registering a new user as Worker"
echo "  2. Check /debug-role page to verify role"
echo ""
echo "✅ Done! See FIX_ROLE_BUG.md for more details."

