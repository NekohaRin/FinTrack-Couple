# 🔍 DIAGNOSE AVATAR UPLOAD - Cek Masalahnya Apa

> Jalankan script ini di browser console untuk tahu masalahnya

---

## 📋 LANGKAH CEPAT

### 1. Buka Aplikasi & Login
- Buka aplikasi FinTrack di browser
- Login dengan akun Anda

### 2. Buka Console (F12)
- **Chrome/Edge:** Press F12 atau Ctrl+Shift+I
- **Firefox:** Press F12 atau Ctrl+Shift+K
- Pilih tab **Console**

### 3. Copy-Paste Script Ini & Enter

```javascript
// ================================
// 🔍 DIAGNOSTIC SCRIPT
// ================================

console.log('🔍 Memulai diagnosis avatar upload...\n');

// Import supabase client
const { supabase } = await import('./src/lib/supabase.js');

// Test 1: Cek user login
console.log('1️⃣ TEST: Cek User Login');
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  console.error('❌ User tidak login:', userError);
  console.log('\n👉 FIX: Login dulu ke aplikasi\n');
} else {
  console.log('✅ User login:', user.email);
  console.log('   User ID:', user.id);
}

// Test 2: Cek bucket exists
console.log('\n2️⃣ TEST: Cek Bucket "avatars" Exists');
const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
if (bucketsError) {
  console.error('❌ Error list buckets:', bucketsError);
} else {
  const avatarBucket = buckets.find(b => b.id === 'avatars');
  if (avatarBucket) {
    console.log('✅ Bucket "avatars" ditemukan!');
    console.log('   Public:', avatarBucket.public);
    console.log('   Created:', avatarBucket.created_at);
  } else {
    console.error('❌ Bucket "avatars" TIDAK DITEMUKAN!');
    console.log('\n🔧 FIX: Buat bucket dulu!');
    console.log('   1. Buka Supabase Dashboard');
    console.log('   2. Storage → New bucket');
    console.log('   3. Name: avatars');
    console.log('   4. Public: ✅ CHECKED');
    console.log('   5. Save\n');
  }
}

// Test 3: Cek bisa list files
console.log('\n3️⃣ TEST: Cek Access ke Bucket');
const { data: files, error: listError } = await supabase.storage.from('avatars').list();
if (listError) {
  console.error('❌ Error list files:', listError);
  if (listError.message.includes('not found')) {
    console.log('\n🔧 FIX: Bucket tidak ada, buat dulu (lihat fix di atas)\n');
  }
} else {
  console.log('✅ Bisa akses bucket!');
  console.log('   Jumlah files:', files.length);
}

// Test 4: Try test upload
if (user) {
  console.log('\n4️⃣ TEST: Upload Test File');
  const testBlob = new Blob(['test content'], { type: 'text/plain' });
  const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
  const testPath = `${user.id}/test-upload.txt`;
  
  console.log('   Mencoba upload ke:', testPath);
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(testPath, testFile, { upsert: true });
  
  if (uploadError) {
    console.error('❌ Upload GAGAL:', uploadError);
    console.log('\n🔍 ANALISA ERROR:');
    
    if (uploadError.message.includes('not found')) {
      console.log('   ❌ Bucket tidak ditemukan');
      console.log('   🔧 FIX: Buat bucket "avatars" (public)');
    } else if (uploadError.message.includes('row-level security')) {
      console.log('   ❌ RLS Policy tidak mengizinkan upload');
      console.log('   🔧 FIX: Set RLS policies untuk bucket');
      console.log('   Run SQL ini di Supabase SQL Editor:');
      console.log(`
      -- Policy untuk INSERT
      CREATE POLICY "Allow authenticated upload to own folder"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
      
      -- Policy untuk UPDATE
      CREATE POLICY "Allow authenticated update own files"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (
        bucket_id = 'avatars' AND
        (storage.foldername(name))[1] = auth.uid()::text
      );
      
      -- Policy untuk SELECT (read)
      CREATE POLICY "Public read access"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'avatars');
      `);
    } else if (uploadError.message.includes('Forbidden') || uploadError.message.includes('403')) {
      console.log('   ❌ Forbidden - Bucket tidak public atau policy salah');
      console.log('   🔧 FIX:');
      console.log('      1. Bucket → Settings → Public: ✅ CHECK');
      console.log('      2. Atau set RLS policies (lihat SQL di atas)');
    } else {
      console.log('   ❌ Error tidak dikenali:', uploadError.message);
    }
    console.log('');
  } else {
    console.log('✅ Upload BERHASIL!');
    console.log('   Path:', uploadData.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(testPath);
    console.log('   Public URL:', urlData.publicUrl);
    
    // Cleanup test file
    await supabase.storage.from('avatars').remove([testPath]);
    console.log('   ✅ Test file dibersihkan');
  }
}

// Test 5: Cek profile table
if (user) {
  console.log('\n5️⃣ TEST: Cek Profile di Database');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (profileError) {
    console.error('❌ Error get profile:', profileError);
  } else {
    console.log('✅ Profile ditemukan!');
    console.log('   Display name:', profile.display_name);
    console.log('   Avatar URL:', profile.avatar_url || '(belum ada)');
  }
}

console.log('\n════════════════════════════════════');
console.log('✅ DIAGNOSIS SELESAI!');
console.log('════════════════════════════════════\n');
console.log('📋 RANGKUMAN:');
console.log('   Lihat hasil test di atas');
console.log('   Jika ada ❌, ikuti FIX yang diberikan\n');
```

---

## 📊 APA YANG DICEK?

Script ini akan cek:

1. ✅ User sudah login?
2. ✅ Bucket "avatars" ada?
3. ✅ Bucket bisa diakses?
4. ✅ Upload file berhasil?
5. ✅ Profile ada di database?

---

## 🔍 BACA HASILNYA

### ✅ Semua PASSED
```
✅ User login: ...
✅ Bucket "avatars" ditemukan!
✅ Bisa akses bucket!
✅ Upload BERHASIL!
✅ Profile ditemukan!
```

**→ Bucket setup OK! Avatar upload harusnya bisa.**

Jika masih tidak bisa:
1. Hard refresh (Ctrl+Shift+R)
2. Clear cache
3. Coba lagi upload foto di Settings

---

### ❌ Bucket tidak ditemukan
```
❌ Bucket "avatars" TIDAK DITEMUKAN!
```

**→ Bucket belum dibuat!**

**FIX:**
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Storage (di sidebar kiri)
4. Klik "New bucket"
5. Name: `avatars`
6. Public: **✅ CHECKED** (PENTING!)
7. Klik "Save"

Selesai! Coba upload foto lagi.

---

### ❌ Upload gagal - RLS Policy
```
❌ Upload GAGAL: new row violates row-level security policy
```

**→ Bucket ada, tapi RLS policies belum di-set!**

**FIX via SQL:**
1. Buka Supabase Dashboard
2. SQL Editor (di sidebar)
3. Klik "New query"
4. Copy-paste SQL ini:

```sql
-- Policy: INSERT (upload)
CREATE POLICY "Allow authenticated upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: UPDATE (overwrite)
CREATE POLICY "Allow authenticated update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: SELECT (read)
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy: DELETE (optional)
CREATE POLICY "Allow authenticated delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

5. Klik "Run"
6. Selesai! Coba upload foto lagi.

---

### ❌ Upload gagal - Forbidden
```
❌ Upload GAGAL: Forbidden
```

**→ Bucket tidak public atau policy salah**

**FIX:**
1. Buka Supabase Dashboard
2. Storage → Bucket "avatars"
3. Settings (tab)
4. **Public bucket: ✅ CHECK ini!**
5. Save

ATAU jalankan SQL policies di atas.

---

## 🎯 NEXT STEPS

Setelah jalankan script diagnostic:

1. **Jika ada ❌** → Ikuti FIX yang diberikan
2. **Jalankan script lagi** → Pastikan semua ✅
3. **Coba upload foto** → Harusnya berhasil!
4. **Cek console** → Lihat log emoji 📸📤✅
5. **Lihat alert** → "✅ Foto profil berhasil diupdate!"

---

## 💡 TIPS

- **Script ini AMAN** - hanya membaca & test upload file kecil
- **Tidak merubah data** - test file langsung dihapus
- **Copy SEMUA baris** - dari `console.log('🔍 Memulai...')` sampai `console.log('...berikan\n');`
- **Paste di Console** - lalu tekan Enter
- **Baca hasilnya** - lihat ✅ atau ❌

---

## 📞 MASIH BERMASALAH?

Share screenshot dari:
1. Hasil script diagnostic ini (console)
2. Supabase Dashboard → Storage (list buckets)
3. Error alert yang muncul saat upload

**Good luck! 🚀**
