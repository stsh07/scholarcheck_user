import { useEffect, useMemo, useState } from "react";
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
  if (!raw) {
    return {
      firstName: "",
      lastName: "",
      email: "",
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      firstName: "",
      lastName: "",
      email: "",
    };
  }
}

function getInitials(firstName?: string, lastName?: string) {
  const first = String(firstName || "").trim().charAt(0);
  const last = String(lastName || "").trim().charAt(0);
  const value = `${first}${last}`.trim().toUpperCase();
  return value || "JD";
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
    memberSince: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      try {
        setLoading(true);

        const token = localStorage.getItem("scholarcheck_accessToken");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

        const response = await fetch(`${apiUrl}/api/applications/profile/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data: ProfileResponse = await response.json();

        if (!active) return;

        setProfile(data);

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
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const firstName = profile.firstName || storedUser.firstName || "";
  const lastName = profile.lastName || storedUser.lastName || "";
  const fullName =
    profile.fullName ||
    `${firstName} ${lastName}`.replace(/\s+/g, " ").trim() ||
    "Student";
  const email = profile.email || storedUser.email || "—";
  const phone = profile.phone || "—";
  const address = profile.address || "—";
  const memberSince = formatMemberSince(profile.memberSince);
  const initials = getInitials(firstName, lastName);
  const profileImage = profile.profileImage || "";

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
                  <button
                    type="button"
                    aria-label="Change profile picture"
                    className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full md:h-[96px] md:w-[96px]"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={fullName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-100 text-[22px] font-semibold text-emerald-900 md:text-[24px]">
                        {initials}
                      </div>
                    )}

                    <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-700 text-white shadow-sm">
                      <Pencil className="h-[10px] w-[10px]" />
                    </div>
                  </button>

                  <div>
                    <h2 className="text-[22px] font-semibold leading-tight text-gray-900">
                      {fullName}
                    </h2>
                    <p className="mt-2 text-[13px] text-gray-400">{email}</p>
                  </div>
                </div>

                <button
                  type="button"
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
    </Layout>
  );
}