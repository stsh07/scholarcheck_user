import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/Layout";

interface Scholarship {
  id: number;
  name: string;
  payoutDate: string;
  location: string;
  note: string;
}

const scholarships: Scholarship[] = [
  {
    id: 1,
    name: "PHINMA Scholarship",
    payoutDate: "March 15, 2026",
    location: "Finance Office",
    note: "Bring a valid school ID",
  },
  {
    id: 2,
    name: "CHED TDP Scholarship",
    payoutDate: "August 15, 2025",
    location: "UNP Auditorium",
    note: "Bring a valid school ID",
  },
];

type StoredUser = {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
};

export default function HomePage() {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const rawUser = localStorage.getItem("scholarcheck_user");

    if (!rawUser) return;

    const parsed: StoredUser = JSON.parse(rawUser);
    setUser(parsed);

    // 👇 per-user login tracking
    const firstLoginKey = `scholarcheck_has_logged_${parsed.id}`;

    const hasLoggedBefore = localStorage.getItem(firstLoginKey);

    if (hasLoggedBefore) {
      setGreeting("Welcome back");
    } else {
      setGreeting("Welcome");
      localStorage.setItem(firstLoginKey, "true");
    }
  }, []);

  const firstName = useMemo(() => {
    return user?.firstName || "Student";
  }, [user]);

  return (
    <Layout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">
          {greeting}, {firstName}!
        </h1>
        <p className="text-lg text-gray-600">
          Here are the latest scholarship payout announcements.
        </p>
      </div>

      {/* Announcements Table */}
      <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
        <h2 className="mb-6 text-2xl font-semibold">Announcements</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-gray-600 border-b border-gray-200">
                <th className="px-4 py-3">Scholarship</th>
                <th className="px-4 py-3">Payout Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Note</th>
              </tr>
            </thead>

            <tbody>
              {scholarships.map((item) => (
                <tr
                  key={item.id}
                  className="transition border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-4">{item.name}</td>
                  <td className="px-4 py-4">{item.payoutDate}</td>
                  <td className="px-4 py-4">{item.location}</td>
                  <td className="px-4 py-4">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
