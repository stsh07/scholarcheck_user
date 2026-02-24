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

function hasValidSession() {
  const token = localStorage.getItem("scholarcheck_accessToken");
  const rawUser = localStorage.getItem("scholarcheck_user");
  return !!token && !!rawUser;
}

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

    const parsed: StoredUser = JSON.parse(rawUser);
    setUser(parsed);

    const firstLoginKey = `scholarcheck_has_logged_${parsed.id}`;
    const hasLoggedBefore = localStorage.getItem(firstLoginKey);

    if (hasLoggedBefore) setGreeting("Welcome Back");
    else {
      setGreeting("Welcome");
      localStorage.setItem(firstLoginKey, "true");
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
      {/* SAME horizontal padding for EVERYTHING */}
      <div className="px-6 md:px-10 pt-6">

        {/* Welcome Section */}
        <h1 className="text-[26px] md:text-[32px] font-bold text-gray-900">
          {greeting}, {firstName}!
        </h1>

        <p className="mt-1 text-[15px] md:text-[16px] text-gray-600">
          Track your District 3 scholarship from Alagang Arenas and stay updated on your educational assistance.
        </p>

        {/* Announcements Section */}
        <div className="mt-10">

          {loadingAnnouncements ? (
            <p className="text-gray-500 text-sm">Loading announcements...</p>
          ) : announcementError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {announcementError}
            </div>
          ) : announcements.length === 0 ? (
            <p className="text-gray-500 text-sm">
              You have no announcements at the moment.
            </p>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-6 w-6 text-green-700" />
                  <h2 className="text-[20px] font-semibold text-green-700">
                    Announcements!
                  </h2>
                </div>
              </div>

              {/* Cards */}
              <div className="px-6 py-6 space-y-6">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-gray-200 bg-white px-6 py-5 shadow-sm overflow-hidden"
                  >
                    <div className="text-[15px] font-semibold text-gray-900 break-words">
                      {a.title}
                    </div>

                    <div className="mt-3 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words break-all">
                      {a.message}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-6 text-[12px] text-gray-500">
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
    </Layout>
  );
}