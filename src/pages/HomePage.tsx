// src/pages/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { listAnnouncements, type Announcement } from "../api/announcements";
import { Calendar, Clock, Megaphone } from "lucide-react";

type StoredUser = {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [greeting, setGreeting] = useState("Welcome");

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [announcementError, setAnnouncementError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("scholarcheck_accessToken");
    const rawUser = localStorage.getItem("scholarcheck_user");

    if (!token || !rawUser) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const parsed: StoredUser = JSON.parse(rawUser);
      setUser(parsed);

      const firstLoginKey = `scholarcheck_has_logged_${parsed.id}`;
      const hasLoggedBefore = localStorage.getItem(firstLoginKey);

      if (hasLoggedBefore) {
        setGreeting("Welcome Back");
      } else {
        setGreeting("Welcome");
        localStorage.setItem(firstLoginKey, "true");
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoadingAnnouncements(true);
      setAnnouncementError(null);

      try {
        const res = await listAnnouncements();
        if (!mounted) return;
        setAnnouncements(res.announcements || []);
      } catch (e: any) {
        if (!mounted) return;
        setAnnouncementError(e?.message || "Failed to load announcements");
      } finally {
        if (!mounted) return;
        setLoadingAnnouncements(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const firstName = useMemo(() => user?.firstName || "Student", [user]);

  return (
    <Layout>
      <div className="min-h-full w-full bg-[#eef8f0]">
        <div className="w-full pt-4 pb-4">
          {/* Welcome Section */}
          <div className="mb-5 px-1 sm:px-1 md:px-1 lg:px-1">
            <h1 className="text-[22px] sm:text-[24px] md:text-[26px] font-bold text-[#111827]">
              {greeting}, {firstName}!
            </h1>

            <p className="mt-1 text-[14px] text-gray-600">
              Track your District 3 scholarship from Alagang Arenas and stay
              updated on your educational assistance.
            </p>
          </div>

          {/* Announcements Section - separate alignment */}
          <div className="w-full px-6 sm:px-7 md:px-8 lg:px-10 pb-3">
            {loadingAnnouncements ? (
              <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-5">
                <p className="text-sm text-gray-500">Loading announcements...</p>
              </div>
            ) : announcementError ? (
              <div className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {announcementError}
              </div>
            ) : announcements.length === 0 ? (
              <div className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-5">
                <p className="text-sm text-gray-500">
                  You have no announcements at the moment.
                </p>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 px-8 py-5">
                  <Megaphone className="h-6 w-6 text-green-700" />
                  <h2 className="text-[26px] font-bold text-green-700">
                    Announcements!
                  </h2>
                </div>

                {/* Content */}
                <div className="px-5 py-5 space-y-4">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-gray-200 bg-white px-5 py-4"
                    >
                      <h3 className="text-[14px] font-semibold text-gray-900">
                        {a.title}
                      </h3>

                      <p className="mt-2 text-[13px] text-gray-600 whitespace-pre-wrap break-words">
                        {a.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-6 text-[12px] text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(a.createdAt)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {formatTime(a.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}