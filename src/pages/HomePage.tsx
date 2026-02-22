// src/pages/HomePage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";

interface Scholarship {
  id: number;
  name: string;
  payoutDate: string;
  location: string;
  note: string;
}

const scholarships: Scholarship[] = [];

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

function useLockBackToHome(enabled: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) return;

    const pushGuard = () => {
      window.history.pushState({ __lockHome: true }, "", window.location.href);
    };

    pushGuard();

    const onPopState = () => {
      navigate("/home", { replace: true });
      window.setTimeout(() => pushGuard(), 0);
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [enabled, navigate]);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [greeting, setGreeting] = useState("Welcome");

  useLockBackToHome(hasValidSession());

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

  const firstName = useMemo(() => user?.firstName || "Student", [user]);
  const hasAnnouncements = scholarships.length > 0;

  return (
    <Layout>
      <div className="px-2 pt-2">
        <h1 className="text-[26px] md:text-[32px] font-bold text-gray-900">
          {greeting}, {firstName}!
        </h1>

        <p className="mt-1 text-[15px] md:text-[16px] text-gray-600">
          Track your District 3 scholarship from Alagang Arenas and stay updated
          on your educational assistance.
        </p>
      </div>

      <div className="mt-10">
        {!hasAnnouncements ? (
          <div className="flex items-center justify-center min-h-[55vh]">
            <p className="text-[14px] md:text-[15px] text-gray-500">
              You have no announcements at the moment.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
            <h2 className="text-[18px] md:text-[20px] font-semibold text-gray-900">
              Announcements
            </h2>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left text-gray-600 border-b border-gray-200">
                    <th className="px-4 py-3 text-[14px] font-semibold">
                      Scholarship
                    </th>
                    <th className="px-4 py-3 text-[14px] font-semibold">
                      Payout Date
                    </th>
                    <th className="px-4 py-3 text-[14px] font-semibold">
                      Location
                    </th>
                    <th className="px-4 py-3 text-[14px] font-semibold">
                      Note
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {scholarships.map((item) => (
                    <tr
                      key={item.id}
                      className="transition border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-[14px]">{item.name}</td>
                      <td className="px-4 py-4 text-[14px]">
                        {item.payoutDate}
                      </td>
                      <td className="px-4 py-4 text-[14px]">{item.location}</td>
                      <td className="px-4 py-4 text-[14px]">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}