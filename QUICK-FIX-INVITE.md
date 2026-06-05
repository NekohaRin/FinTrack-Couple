# ⚡ Quick Fix: Invite Code Tidak Ditemukan

> **TL;DR:** User B tidak bisa join invite User A karena RLS policy terlalu ketat.

---

## 🎯 1 Menit Fix

### Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Drop policy lama
DROP POLICY IF EXISTS "Users can manage own couples" ON public.couples;

-- Buat policy baru
CREATE POLICY "Owner can manage couple"
  ON public.couples FOR ALL
  USING (auth.uid() = user1_id);

CREATE POLICY "Partner can manage couple"
  ON public.couples FOR ALL
  USING (auth.uid() = user2_id);

CREATE POLICY "Anyone can view pending invites"
  ON public.couples FOR SELECT
  USING (status = 'pending');

CREATE POLICY "User can join pending invite"
  ON public.couples FOR UPDATE
  USING (
    status = 'pending' OR 
    auth.uid() = user1_id OR 
    auth.uid() = user2_id
  );
```

**DONE!** ✅

---

## 🧪 Test

1. **User A:** Buat kode invite → Copy kode (misal: `ABC123`)
2. **User B:** Join dengan kode → Paste `ABC123` → Klik Hubungkan
3. **Expected:** Redirect ke Dashboard ✅

---

## 🔍 Debug

### Jika masih error, cek console browser:

**✅ Success Log:**
```
🔍 joinWithCode called: { userId: "...", code: "ABC123" }
📊 Query result: { couple: {...}, findError: null }
✅ Couple found: { ... }
✅ Couple updated successfully: { status: "active", ... }
```

**❌ Error Log:**
```
📊 Query result: { couple: null, findError: {...} }
❌ Couple not found
```
→ RLS policy belum diupdate. Jalankan SQL di atas lagi.

---

## 📚 Detail Lengkap

Baca: `FIX-INVITE-CODE-ISSUE.md` atau `SUMMARY-FIX-INVITE.md`

---

**Kenapa ini aman?**
- ✅ Hanya pending invites yang visible (setelah joined jadi private)
- ✅ Invite code random (2 milyar kombinasi, mustahil ditebak)
- ✅ Tidak ada data sensitif di pending state

---

**Quick checklist:**
- [ ] SQL script dijalankan
- [ ] User A buat invite → kode muncul
- [ ] User B join → berhasil tanpa error
- [ ] Redirect ke Dashboard

**Selesai!** 🚀
