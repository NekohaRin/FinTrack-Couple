import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Camera,
  LogOut,
  Bell,
  Lock,
  HelpCircle,
  ChevronRight,
  Moon,
} from "lucide-react";
import { BottomNav } from "../components/BottomNav";
import { AvatarPhoto } from "../components/AvatarPhoto";
import { AvatarCropSheet } from "../components/AvatarCropSheet";
import { signOut } from "../hooks/useAuth";
import { useCouple } from "../hooks/useCouple";
import { useAuth } from "../hooks/useAuth";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
} from "../hooks/useProfile";

const swatches = [
  { color: "#F472B6", cls: "theme-pink" },
  { color: "#FB7185", cls: "theme-rose" },
  { color: "#F9A8D4", cls: "theme-blush" },
  { color: "#C4B5FD", cls: "theme-purple" },
  { color: "#FBBF24", cls: "theme-gold" },
  { color: "#86EFAC", cls: "theme-mint" },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: couple } = useCouple();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const [activeSwatch, setActiveSwatch] = useState(0);
  const [dark, setDark] = useState(false);
  const [name, setName] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name);
  }, [profile?.display_name]);

  const partnerProfile =
    couple?.user1_id === user?.id ? couple?.user2 : couple?.user1;
  const partnerName = partnerProfile?.display_name || "Pasangan";
  const partnerAvatar = partnerProfile?.avatar_url || undefined;

  // function handleSwatch(i: number) {
  //   setActiveSwatch(i);
  //   document.body.classList.remove(...swatches.map((s) => s.cls));
  //   document.body.classList.add(swatches[i].cls);
  // }
  async function handleSwatch(i: number) {
    setActiveSwatch(i);
    const selectedCls = swatches[i].cls; // 'theme-pink', bukan '#F472B6'
    document.body.classList.remove(...swatches.map((s) => s.cls));
    document.body.classList.add(selectedCls);
    await updateProfile.mutateAsync({ theme_color: selectedCls });
  }

  async function handleNameBlur() {
    if (name.trim() && name !== profile?.display_name) {
      await updateProfile.mutateAsync({ display_name: name.trim() });
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  }

  async function handleCropDone(file: File) {
    setCropSrc(null);
    console.log("🔄 Memulai upload avatar...");
    try {
      await uploadAvatar.mutateAsync(file);
      console.log("✅ Avatar berhasil diupload!");
      alert("✅ Foto profil berhasil diupdate!");
    } catch (err: any) {
      console.error("❌ Gagal upload foto:", err);
      alert(
        `❌ Gagal upload foto: ${err.message || "Unknown error"}\n\nCek console (F12) untuk detail.`,
      );
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <>
      <div className="min-h-screen pb-28 px-4 pt-6 relative overflow-hidden">
        <header className="text-center pt-2">
          <h1 className="font-script text-4xl">Profilku ✨</h1>
        </header>

        {/* Avatar */}
        <div className="flex flex-col items-center mt-4">
          <label className="relative cursor-pointer">
            <AvatarPhoto
              src={profile?.avatar_url}
              name={name || "U"}
              size="lg"
            />
            <span
              className={`absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-white shadow-pink flex items-center justify-center text-primary ${
                uploadAvatar.isPending ? "opacity-50" : ""
              }`}
            >
              {uploadAvatar.isPending ? "..." : <Camera size={14} />}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploadAvatar.isPending}
            />
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            className="mt-3 text-center font-script text-3xl bg-transparent outline-none border-b-2 border-primary/30 focus:border-primary px-2 max-w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>

        {/* Pasangan */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Pasangan 💕
          </h2>
          <div className="glass-pink rounded-3xl p-4 shadow-soft">
            <div className="flex items-center gap-3">
              <AvatarPhoto src={partnerAvatar} name={partnerName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{partnerName}</div>
                <div className="text-[11px] text-emerald-600 inline-flex items-center gap-1">
                  <Heart size={10} fill="currentColor" />
                  Terhubung sejak{" "}
                  {couple?.linked_at
                    ? new Date(couple.linked_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tampilan */}
        <section className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Tampilan 🎨
          </h2>
          <div className="glass rounded-3xl p-4 space-y-4">
            <div>
              <div className="text-xs font-semibold mb-2 text-muted-foreground">
                Warna Tema
              </div>
              <div className="flex gap-2 justify-between">
                {swatches.map((s, i) => (
                  <button
                    key={s.color}
                    onClick={() => handleSwatch(i)}
                    className={`h-9 w-9 rounded-full shadow-soft transition-transform ${
                      i === activeSwatch
                        ? "ring-2 ring-yellow-400 scale-110"
                        : "ring-1 ring-white/60"
                    }`}
                    style={{ background: s.color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between min-h-11">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Moon size={14} /> Dark Mode
              </div>
              <button
                onClick={() => setDark((v) => !v)}
                className={`relative h-6 w-11 rounded-full transition ${
                  dark ? "bg-gradient-pink" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    dark ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Sub menus */}
        <section className="mt-6 space-y-2">
          <SettingLink
            to="/settings/notifications"
            icon={<Bell size={16} />}
            label="Notifikasi"
          />
          <SettingLink
            to="/settings/privacy"
            icon={<Lock size={16} />}
            label="Privasi & keamanan"
          />
          <SettingLink
            to="/settings/help"
            icon={<HelpCircle size={16} />}
            label="Bantuan"
          />
        </section>

        <button
          onClick={handleLogout}
          className="mt-6 w-full min-h-11 py-3 rounded-full border-2 border-primary/40 text-primary font-semibold flex items-center justify-center gap-2"
        >
          <LogOut size={16} /> Keluar
        </button>

        <p className="text-center text-xs text-muted-foreground mt-4">
          FinTrack v1.0 • dibuat dengan 💖
        </p>
      </div>

      <BottomNav />

      {/* Crop sheet — muncul di atas segalanya */}
      {cropSrc && (
        <AvatarCropSheet
          imageSrc={cropSrc}
          onDone={handleCropDone}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </>
  );
}

function SettingLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="w-full glass rounded-2xl p-4 flex items-center gap-3 shadow-soft min-h-11"
    >
      <div className="h-9 w-9 rounded-2xl bg-secondary flex items-center justify-center text-primary">
        {icon}
      </div>
      <span className="flex-1 text-left text-sm font-semibold">{label}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  );
}
