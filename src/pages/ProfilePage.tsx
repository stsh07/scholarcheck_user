import { useEffect, useMemo, useState } from "react";
import { getUserProfile } from "../api/users";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Pencil,
  Loader2,
} from "lucide-react";
import { Layout } from "../components/Layout";
import { EditProfileModal, type EditForm } from "../modals/EditProfileModal";

type ProfileResponse = {
  id?: number;
  hasApplication?: boolean;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  extension?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  province?: string;
  municipality?: string;
  barangay?: string;
  streetAddress?: string;
  dob?: string;
  gender?: string;
  memberSince?: string | null;
  submittedAt?: string | null;
  updatedAt?: string | null;
  applicationStatus?: string | null;
  profileImage?: string;
};

function getStoredUser() {
  const raw = localStorage.getItem("scholarcheck_user");
  if (!raw) return { firstName: "", lastName: "", email: "" };

  try {
    return JSON.parse(raw);
  } catch {
    return { firstName: "", lastName: "", email: "" };
  }
}

function getInitialsFromFullName(fullName?: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "JD";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function formatMemberSince(dateValue?: string | null) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function normalizeDob(value?: string): string {
  if (!value) return "";

  const raw = String(value).trim().slice(0, 10);

  if (!raw || raw === "0000-00-00") return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  return "";
}

function formatDobDisplay(iso?: string) {
  const normalized = normalizeDob(iso);
  if (!normalized) return "—";

  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) return "—";

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const monthIndex = Number(month) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "—";

  return `${monthNames[monthIndex]} ${day}, ${year}`;
}

function resolveProfileImageUrl(imagePath?: string) {
  if (!imagePath) return "";

  const trimmed = String(imagePath).trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const apiBase = (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return `${apiBase}${normalizedPath}`;
}

type InfoItemProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[14px] leading-5 text-gray-400">{label}</p>
        <p className="break-words text-[16px] font-semibold leading-6 text-gray-900">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const storedUser = useMemo(() => getStoredUser(), []);

  const [profile, setProfile] = useState<ProfileResponse>({
    firstName: storedUser.firstName || "",
    lastName: storedUser.lastName || "",
    email: storedUser.email || "",
    fullName: `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim(),
    phone: "",
    address: "",
    dob: "",
    gender: "",
    memberSince: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await getUserProfile();

        if (!active) return;

        const normalizedDob = normalizeDob(data.dob);

        const computedFullName =
          data.fullName ||
          `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`
            .replace(/\s+/g, " ")
            .trim();

        setProfile({
          ...data,
          fullName: computedFullName,
          dob: normalizedDob,
        });

        const existingUser = getStoredUser();
        localStorage.setItem(
          "scholarcheck_user",
          JSON.stringify({
            ...existingUser,
            firstName: data.firstName || existingUser.firstName || "",
            lastName: data.lastName || existingUser.lastName || "",
            email: data.email || existingUser.email || "",
          })
        );
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const fullName =
    profile.fullName ||
    `${profile.firstName || storedUser.firstName || ""} ${profile.middleName || ""} ${profile.lastName || storedUser.lastName || ""}`
      .replace(/\s+/g, " ")
      .trim() ||
    "Student";

  const email = profile.email || storedUser.email || "—";
  const dob = formatDobDisplay(profile.dob);
  const gender = profile.gender || "—";
  const phone = profile.phone || "—";
  const address = profile.address || "—";
  const memberSince = formatMemberSince(profile.memberSince);
  const initials = getInitialsFromFullName(fullName);
  const profileImage = resolveProfileImageUrl(profile.profileImage);

  const editInitial: EditForm = {
    fullName: fullName === "Student" ? "" : fullName,
    dob: normalizeDob(profile.dob),
    gender: profile.gender || "",
    email: profile.email || storedUser.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
  };

  function handleSaved(updated: EditForm, updatedProfileImage?: string) {
    setProfile((prev) => ({
      ...prev,
      fullName: updated.fullName,
      dob: normalizeDob(updated.dob),
      gender: updated.gender,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      profileImage: updatedProfileImage || prev.profileImage,
    }));

    const existingUser = getStoredUser();
    localStorage.setItem(
      "scholarcheck_user",
      JSON.stringify({
        ...existingUser,
        email: updated.email,
      })
    );
  }

  return (
    <Layout>
      <div className="px-1 pb-8">
        <div className="mb-6">
          <h1 className="text-[18px] font-bold text-gray-900 md:text-[20px]">
            My Profile
          </h1>
          <p className="mt-1 text-[13px] text-gray-500">
            Manage your account information and settings
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm md:px-10 md:py-8">
          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading profile...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-center gap-5">
                  <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full md:h-[96px] md:w-[96px]">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={fullName}
                        className="h-full w-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-[22px] font-semibold text-emerald-900 md:text-[24px]">
                        {initials}
                      </div>
                    )}
                    {!profileImage && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-100 text-[22px] font-semibold text-emerald-900 md:text-[24px]">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div>
                    <h2 className="text-[22px] font-semibold leading-tight text-gray-900">
                      {fullName}
                    </h2>
                    <p className="mt-2 text-[13px] text-gray-400">{email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditOpen(true)}
                  className="inline-flex h-[40px] items-center justify-center gap-2 self-start rounded-lg bg-emerald-800 px-4 text-[14px] font-medium text-white transition hover:bg-emerald-900 active:bg-emerald-900"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="my-6 border-t border-gray-200" />

              <section>
                <h3 className="text-[18px] font-semibold text-gray-900">
                  Personal Information
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2">
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Full Name"
                    value={fullName}
                  />
                  <InfoItem
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Date of Birth"
                    value={dob}
                  />
                  <InfoItem
                    icon={<User className="h-4 w-4" />}
                    label="Gender"
                    value={gender}
                  />
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="Email Address"
                    value={email}
                  />
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone Number"
                    value={phone}
                  />
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="Address"
                    value={address}
                  />
                </div>
              </section>

              <section className="mt-8">
                <h3 className="text-[18px] font-semibold text-gray-900">
                  Account Information
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-x-16 gap-y-6 md:grid-cols-2">
                  <InfoItem
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Member Since"
                    value={memberSince}
                  />
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      <EditProfileModal
        open={editOpen}
        initial={editInitial}
        initialProfileImage={profile.profileImage || ""}
        onClose={() => setEditOpen(false)}
        onSaved={handleSaved}
      />
    </Layout>
  );
}