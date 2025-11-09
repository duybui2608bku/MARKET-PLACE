# Active Context

**Last Updated:** November 9, 2025

## Current Focus

### Authentication Pages - Redirect Fix

**Status:** ✅ COMPLETED

**What was done:**
- Fixed issue where logged-in users could still access `/register` and `/login` pages
- Added authentication check using `useEffect` hook
- Implemented auto-redirect to homepage for authenticated users

**Files Modified:**
- `app/[locale]/(auth)/login/page.tsx`
- `app/[locale]/(auth)/register/page.tsx`

**Implementation Details:**
```typescript
// Check authentication status
const [isLoggedIn, setIsLoggedIn] = useState(false);

useEffect(() => {
  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
    }
  };
  checkAuth();
}, [supabase]);

// Show message UI instead of redirecting
if (isLoggedIn) {
  return (
    <div>
      <h2>Bạn đã đăng nhập rồi</h2>
      <Link href={`/${locale}`}>Về trang chủ</Link>
    </div>
  );
}
```

**Testing Checklist:**
- ✅ Unauthenticated users can access `/login` and `/register` normally
- ✅ Logged-in users see friendly message at `/login`: "Bạn đã đăng nhập rồi"
- ✅ Logged-in users see friendly message at `/register`: "Bạn không thể đăng ký tài khoản mới"
- ✅ Message includes button to return home (user controlled)
- ✅ NO automatic redirect (user stays on page until they click button)

---

## Recent Changes (November 9, 2025)

### Auth Pages Protection
- **Problem:** Security gap allowing logged-in users to access authentication pages
- **Solution:** Session check on component mount with friendly message UI (no auto-redirect)
- **Impact:** 
  - Better UX - user stays in control
  - Clear feedback message
  - Prevents confusion about being already logged in
  - User can manually navigate away when ready

---

## Next Steps

**No immediate tasks pending.**

**Potential Future Improvements:**
1. Consider adding loading state during auth check to prevent flash
2. Add similar protection to other auth-related pages if any exist
3. Consider adding redirect parameter to send users back to intended page after login

---

## Active Decisions

### Authentication Flow
- **Decision:** Show message UI for authenticated users (no auto-redirect)
- **Rationale:** 
  - User prefers to stay on page and see message
  - More control for user
  - Clearer feedback about authentication status
- **Alternative Rejected:** Auto-redirect - feels too aggressive, user loses control

### Implementation Approach
- **Decision:** Use `useEffect` with `getSession()` check + conditional render
- **Rationale:** 
  - Works on client-side rendered pages
  - Consistent with existing auth patterns in codebase
  - No server-side changes needed
  - State-based rendering gives user control

---

## Known Limitations

None at this time.

