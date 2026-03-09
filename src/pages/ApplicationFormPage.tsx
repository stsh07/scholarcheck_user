import React, { useEffect, useMemo, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import ConfirmSubmissionModal from "../modals/ConfirmSubmissionModal";
import StatusBannerModal from "../modals/StatusBannerModal";
import SaveChangesModal from "../modals/SaveChangesModal";

import {
  getMyApplication,
  submitApplication,
  updateMyApplication,
  type ApplicationDto,
} from "../api/applications";
import { getApplicationsOpen } from "../api/settings";

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  extension: string;
  dob: string;
  gender: string;

  province: string;
  municipality: string;
  barangay: string;
  address: string;

  phone: string;
  email: string;

  fatherName: string;
  fatherOccupation: string;
  fatherIncome: string;
  fatherPhone: string;

  motherName: string;
  motherOccupation: string;
  motherIncome: string;
  motherPhone: string;

  govGrant: string;

  certificateOfResidency: File | null;
  indigencyCertificate: File | null;
  governmentID: File | null;
  certificateOfEnrollment: File | null;
  assessmentForm: File | null;
};

type TextFieldName = keyof Omit<
  FormState,
  | "certificateOfResidency"
  | "indigencyCertificate"
  | "governmentID"
  | "certificateOfEnrollment"
  | "assessmentForm"
>;

type FileFieldName = keyof Pick<
  FormState,
  | "certificateOfResidency"
  | "indigencyCertificate"
  | "governmentID"
  | "certificateOfEnrollment"
  | "assessmentForm"
>;

type CustomSelectProps = {
  name: string;
  value: string;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  onChange: (e: { target: { name: string; value: string } }) => void;
};

type StoredUser = {
  id?: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
};

type CustomDobPickerProps = {
  name: string;
  value: string;
  disabled?: boolean;
  min: string;
  max: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
};

const genders = ["Male", "Female"];
const FIXED_PROVINCE = "Pangasinan";

const MUNICIPALITY_OPTIONS = [
  "Bayambang",
  "Calasiao",
  "Malasiqui",
  "Mapandan",
  "San Carlos City",
  "Santa Barbara",
];

const BARANGAY_BY_MUNICIPALITY: Record<string, string[]> = {
  Bayambang: [
    "Alinggan",
    "Amancosiling Norte",
    "Amancosiling Sur",
    "Ambayat I",
    "Ambayat II",
    "Apalen",
    "Asin",
    "Ataynan",
    "Bacnono",
    "Banaban",
    "Bani",
    "Batangcawa",
    "Beleng",
    "Bical",
    "Bongato East",
    "Bongato West",
    "Buayaen",
    "Buenlag",
    "Cadre Site",
    "Carungay",
    "Chingay",
    "Colardet",
    "Daan-ili",
    "Dila",
    "Duera",
    "Dusoc",
    "Erfe",
    "Hermoza",
    "Idong",
    "Inanlorenza",
    "Inirangan",
    "Iton",
    "Langiran",
    "Ligue",
    "M. H. del Pilar",
    "Macayocayo",
    "Magsaysay",
    "Malimpec",
    "Managos",
    "Manambong Norte",
    "Manambong Parte",
    "Manambong Sur",
    "Mangayao",
    "Nalsian Norte",
    "Nalsian Sur",
    "Nalvo",
    "Ñgalangan",
    "Olegario-Caoile",
    "Palacpalac",
    "Pangdel",
    "Pantol",
    "Papallasen",
    "Poblacion Norte",
    "Poblacion Sur",
    "Puelay",
    "Reynado",
    "Salaan",
    "Sangcagulis",
    "Sanlibo",
    "Santa Cruz",
    "Sapang",
    "Tala",
    "Tampog",
    "Tanolong",
    "Tatarao",
    "Tococ",
    "Warding",
    "Wawa",
  ],
  Calasiao: [
    "Ambonao",
    "Ambuetel",
    "Banaoang",
    "Bued",
    "Buenglat",
    "Cabilocaan",
    "Dinalaoan",
    "Doyong",
    "Gabon",
    "Lasip",
    "Longos",
    "Lumbang",
    "Macabito",
    "Malabago",
    "Mancup",
    "Nalsian",
    "Napo",
    "Poblacion East",
    "Poblacion West",
    "Quesban",
    "San Miguel",
    "San Vicente",
    "Songkoy",
    "Talibaew",
  ],
  Malasiqui: [
    "Amacalan",
    "Amagbagan",
    "Amerang",
    "Anolid",
    "Apaya",
    "Asin",
    "Bacundao Este",
    "Bacundao Oeste",
    "Bakitiw",
    "Balite",
    "Banawang",
    "Bantog",
    "Bawer",
    "Bobonan",
    "Bongar",
    "Butao",
    "Cabalaoangan",
    "Cabilaoan",
    "Cabueldatan",
    "Calbueg",
    "Calumboyan",
    "Carayacan",
    "Don Pedro",
    "Gumot",
    "Gatang",
    "Goliman",
    "Gomez",
    "Guilig",
    "Guiset Norte",
    "Guiset Sur",
    "Ican",
    "Ingalagala",
    "Lasip",
    "Lepa",
    "Licsi",
    "Mabulitec",
    "Malabago",
    "Malayo",
    "Malacañang",
    "Manggan-Dampay",
    "Nancamaliran Este",
    "Nancamaliran Oeste",
    "Nancapian",
    "Nansangaan",
    "Pacuan",
    "Palong",
    "Pao",
    "Papallasen",
    "Pasima",
    "Pindangan",
    "Poblacion",
    "San Andres",
    "San Antonio",
    "San Julian",
    "San Pablo",
    "Tobor",
    "Tolonguat",
    "Umangan",
    "Waig",
  ],
  Mapandan: [
    "Amanoaoac",
    "Apaya",
    "Aserda",
    "Baloling",
    "Bañar",
    "Coral",
    "Golden",
    "Jimenez",
    "Lambayan",
    "Luyan",
    "Nilombot",
    "Pias",
    "Poblacion",
    "San Agustin",
    "Santa Maria",
    "Talospatang",
    "Torres",
  ],
  "San Carlos City": [
    "Abanon",
    "Agdao",
    "Ano",
    "Anando",
    "Antipangol",
    "Aponit",
    "Bacnar",
    "Balaya",
    "Balayong",
    "Baldog",
    "Balite Sur",
    "Bani",
    "Bega",
    "Blessed Valley",
    "Bocboc",
    "Bogaoan",
    "Bolingit",
    "Bolosan",
    "Bonifacio (Pagal)",
    "Buenglat",
    "Bugallon-Posadas Street",
    "Burgos-Padlan",
    "Cacaritan",
    "Caingal",
    "Caoayan-Kiling",
    "Capitan",
    "Caranglaan",
    "Casapsapan",
    "Cobol",
    "Cruz",
    "Doyong",
    "Gamata",
    "Guelew",
    "Ilang",
    "Inerangan",
    "Isla",
    "Libas",
    "Lilimasan",
    "Longos",
    "Lucban (Lupao)",
    "Mabalbalino",
    "Mabini",
    "Magtaking",
    "Malacañang",
    "Maliwara",
    "Mamarlao",
    "Manzon",
    "Matagdem",
    "M. Soriano",
    "Naguilayan",
    "Nilentap",
    "Padilla-Gomez",
    "Pagal",
    "Palaming",
    "Palaris",
    "Palospos",
    "Pangalangan",
    "Pangoloan",
    "Pangpang",
    "Paitan-Panoypoy",
    "Parayao",
    "Payar",
    "Payapa",
    "Perez Boulevard",
    "Polo",
    "PNR Station Site",
    "Quintong",
    "Quezon Boulevard",
    "Rizal Avenue",
    "Roxas Boulevard",
    "Salinap",
    "San Juan",
    "San Pedro-Taloy",
    "Sapinit",
    "Supo",
    "Talang",
    "Tamayo",
    "Tandang Sora",
    "Tarece",
    "Tarectec",
    "Tayambani",
    "Tebag",
    "Turac",
  ],
  "Santa Barbara": [
    "Alibago",
    "Balingueo",
    "Banaoang",
    "Banzal",
    "Botao",
    "Cablong",
    "Carusocan",
    "Dalongue",
    "Gueguesangen",
    "Leet",
    "Malanay",
    "Maningding",
    "Maronong",
    "Maticmatic",
    "Minien East",
    "Minien West",
    "Nilombot",
    "Patayac",
    "Payas",
    "Poblacion Norte",
    "Poblacion Sur",
    "Primicias",
    "Sapang",
    "Sonquil",
    "Tebag",
    "Tuliao",
    "Ventenilla",
  ],
};

const INCOME_OPTIONS_BASE = [
  "Below ₱5,000",
  "₱5,000 - ₱10,000",
  "₱10,000 - ₱15,000",
  "₱15,000 - ₱20,000",
  "₱20,000 - ₱30,000",
  "₱30,000 - ₱50,000",
  "Above ₱50,000",
];

const INCOME_OPTION_NONE = "None";

const MONTH_NAMES = [
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

const WEEKDAY_SHORT = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function getStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem("scholarcheck_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeDateForInput(value?: string | null) {
  if (!value) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizePhilippineMobileInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (!digits) return "";

  if (digits.length === 1) {
    return digits[0] === "0" ? digits : "";
  }

  if (digits.length >= 2) {
    if (digits[0] !== "0") return "";
    if (digits[1] !== "9") return "0";
  }

  return digits;
}

function isValidPhilippineMobile(value: string) {
  return /^09\d{9}$/.test(value.trim());
}

function formatDateToIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subtractYears(baseDate: Date, years: number) {
  const next = new Date(baseDate);
  next.setFullYear(next.getFullYear() - years);
  return next;
}

function formatDobDisplay(iso: string) {
  if (!iso) return "dd/mm/yyyy";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return "dd/mm/yyyy";
  return `${day}/${month}/${year}`;
}

function parseIsoDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function buildAddress(province: string, municipality: string, barangay: string) {
  const parts = [barangay.trim(), municipality.trim(), province.trim()].filter(Boolean);
  return parts.join(", ");
}

function parseAddressParts(address?: string | null) {
  const safeAddress = String(address || "").trim();

  if (!safeAddress) {
    return {
      province: FIXED_PROVINCE,
      municipality: "",
      barangay: "",
      address: "",
    };
  }

  const parts = safeAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  let province = FIXED_PROVINCE;
  let municipality = "";
  let barangay = "";

  const normalizedParts = parts.map((part) => part.toLowerCase());

  const matchedMunicipality =
    MUNICIPALITY_OPTIONS.find((municipalityName) =>
      normalizedParts.some((part) => part === municipalityName.toLowerCase())
    ) || "";

  if (matchedMunicipality) {
    municipality = matchedMunicipality;
  }

  if (normalizedParts.some((part) => part === "pangasinan")) {
    province = FIXED_PROVINCE;
  }

  if (municipality) {
    const allowedBarangays = BARANGAY_BY_MUNICIPALITY[municipality] || [];
    const matchedBarangay =
      allowedBarangays.find((barangayName) =>
        normalizedParts.some((part) => part === barangayName.toLowerCase())
      ) || "";

    barangay = matchedBarangay;
  }

  return {
    province,
    municipality,
    barangay,
    address: buildAddress(province, municipality, barangay),
  };
}

function getIncomeOptions(occupation: string) {
  const occ = occupation.trim().toLowerCase();

  if (occ === "n/a" || occ === "na" || occ === "none") {
    return [...INCOME_OPTIONS_BASE, INCOME_OPTION_NONE];
  }

  return INCOME_OPTIONS_BASE;
}

function isNoneAllowedForOccupation(occupation: string) {
  const occ = occupation.trim().toLowerCase();
  return occ === "n/a" || occ === "na" || occ === "none";
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[
        "h-4 w-4 shrink-0 text-gray-600 transition-transform duration-150",
        open ? "rotate-180" : "",
      ].join(" ")}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoCircleIcon() {
  return (
    <svg
      className="mt-[2px] h-[18px] w-[18px] shrink-0 text-[#111827]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 8V12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="5.7" r="1" fill="currentColor" />
    </svg>
  );
}

function AdvisoryInfoIcon() {
  return (
    <svg
      className="mt-[2px] h-[18px] w-[18px] shrink-0 text-[#2563EB]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 8V12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="5.7" r="1" fill="currentColor" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.5 4.5L7 10L12.5 15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.5 4.5L13 10L7.5 15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 3V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.5 3V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 8H17" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function SuccessStatusIcon() {
  return (
    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#15803D] text-white">
      <svg
        className="h-[16px] w-[16px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M5 10.5L8.2 13.5L15 6.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ErrorStatusIcon() {
  return (
    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#DC2626] text-white">
      <svg
        className="h-[15px] w-[15px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M6 6L14 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M14 6L6 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function PendingStatusIcon() {
  return (
    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#D08A00] text-white">
      <svg
        className="h-[16px] w-[16px]"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="6.8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M10 6.4V10L12.7 11.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function ApplicationStatusBanner({ status }: { status: string }) {
  if (status === "Approved") {
    return (
      <div className="mb-6 rounded-[8px] border border-[#8FD19E] bg-[#EAF7EE] px-6 py-5">
        <div className="flex items-start gap-3">
          <SuccessStatusIcon />
          <div>
            <h3 className="text-[22px] font-bold leading-tight text-[#166534]">
              Congratulations! Your Application Has Been Approved!
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#166534]">
              Your scholarship application has been reviewed and approved. You will receive
              further instructions via email or phone within 3–5 business days regarding the
              next steps and disbursement schedule.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "Declined") {
    return (
      <div className="mb-6 rounded-[8px] border border-[#F2B9B9] bg-[#FDEEEE] px-6 py-5">
        <div className="flex items-start gap-3">
          <ErrorStatusIcon />
          <div>
            <h3 className="text-[22px] font-bold leading-tight text-[#DC2626]">
              Application Declined
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-[#DC2626]">
              Unfortunately, your scholarship application was not approved at this time. This
              could be due to incomplete documentation, eligibility requirements not being met,
              or limited scholarship slots.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-[8px] border border-[#E7D27C] bg-[#FBF7E8] px-6 py-5">
      <div className="flex items-start gap-3">
        <PendingStatusIcon />
        <div>
          <h3 className="text-[22px] font-bold leading-tight text-[#A16207]">
            Application Under Review
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#A16207]">
            Your application has been successfully submitted and is currently under review by
            our scholarship committee. We appreciate your patience during this process.
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationsClosedBanner() {
  return (
    <div className="mb-6 rounded-[8px] border border-[#BFDBFE] bg-[#EFF6FF] px-6 py-5">
      <div className="flex items-start gap-3">
        <AdvisoryInfoIcon />
        <div>
          <h3 className="text-[22px] font-bold leading-tight text-[#2563EB]">
            Applications are currently closed
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-[#2563EB]">
            We are no longer accepting new applications for this scholarship period. Please
            check back later for the next application cycle.
          </p>
        </div>
      </div>
    </div>
  );
}

function CustomSelect({
  name,
  value,
  options,
  placeholder,
  disabled = false,
  onChange,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const showGreen = open && !disabled;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        name={name}
        disabled={disabled}
        onClick={() => {
          if (!disabled) setOpen((prev) => !prev);
        }}
        className={[
          "flex w-full items-center justify-between rounded-md border bg-white px-3 py-2.5 text-left text-[14px] text-gray-900 outline-none transition-colors duration-150",
          disabled
            ? "cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600"
            : showGreen
              ? "border-green-800 ring-2 ring-green-200"
              : "border-gray-300 hover:border-green-700",
        ].join(" ")}
      >
        <span className={value ? "text-gray-900" : "text-gray-500"}>{value || placeholder}</span>

        <span className="ml-3 flex items-center">
          <ChevronDownIcon open={open} />
        </span>
      </button>

      {open && !disabled && (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-green-800 bg-white shadow-lg">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-[14px] text-gray-500">No options available</div>
          ) : (
            options.map((option) => {
              const isSelected = value === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange({ target: { name, value: option } });
                    setOpen(false);
                  }}
                  className={[
                    "block w-full px-3 py-2 text-left text-[14px] transition-colors",
                    isSelected
                      ? "bg-green-100 text-green-900"
                      : "bg-white text-gray-800 hover:bg-green-800 hover:text-white",
                  ].join(" ")}
                >
                  {option}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function CustomDobPicker({
  name,
  value,
  disabled = false,
  min,
  onChange,
}: CustomDobPickerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const today = new Date();
  const minDate = parseIsoDate(min);
  const selectedDate = value ? parseIsoDate(value) : null;
  const initialViewDate = selectedDate || today;

  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [showMonthMenu, setShowMonthMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate.getMonth());
      setViewYear(selectedDate.getFullYear());
    } else {
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
        setShowMonthMenu(false);
        setShowYearMenu(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setShowMonthMenu(false);
        setShowYearMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentMonthFirstDay = new Date(viewYear, viewMonth, 1);
  const todayMonthFirstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const minMonthFirstDay = new Date(minDate.getFullYear(), minDate.getMonth(), 1);

  const canGoPrevMonth = currentMonthFirstDay > minMonthFirstDay;
  const canGoNextMonth = currentMonthFirstDay < todayMonthFirstDay;

  const monthStart = new Date(viewYear, viewMonth, 1);
  const monthEnd = new Date(viewYear, viewMonth + 1, 0);

  const startDay = (monthStart.getDay() + 6) % 7;
  const daysInMonth = monthEnd.getDate();
  const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate();

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = today.getFullYear(); year >= minDate.getFullYear(); year--) {
      years.push(year);
    }
    return years;
  }, [minDate, today]);

  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const dayIndex = index - startDay + 1;

    if (dayIndex <= 0) {
      const date = new Date(viewYear, viewMonth - 1, prevMonthLastDay + dayIndex);
      return { date, inCurrentMonth: false };
    }

    if (dayIndex > daysInMonth) {
      const date = new Date(viewYear, viewMonth + 1, dayIndex - daysInMonth);
      return { date, inCurrentMonth: false };
    }

    const date = new Date(viewYear, viewMonth, dayIndex);
    return { date, inCurrentMonth: true };
  });

  const goPrevMonth = () => {
    if (!canGoPrevMonth) return;
    const next = new Date(viewYear, viewMonth - 1, 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  const goNextMonth = () => {
    if (!canGoNextMonth) return;
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewMonth(next.getMonth());
    setViewYear(next.getFullYear());
  };

  const selectDate = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const minOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

    if (dateOnly > todayOnly) return;
    if (dateOnly < minOnly) return;

    onChange({ target: { name, value: formatDateToIso(dateOnly) } });
    setOpen(false);
    setShowMonthMenu(false);
    setShowYearMenu(false);
  };

  const clearDate = () => {
    onChange({ target: { name, value: "" } });
    setOpen(false);
    setShowMonthMenu(false);
    setShowYearMenu(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={[
          "flex w-full items-center rounded-md border bg-white transition-colors duration-150",
          disabled
            ? "border-gray-300 bg-gray-100"
            : open
              ? "border-green-800 ring-2 ring-green-200"
              : "border-gray-300 hover:border-green-700",
        ].join(" ")}
      >
        <div
          className={[
            "flex-1 px-3 py-2.5 text-[14px]",
            value ? "text-gray-900" : "text-gray-500",
            disabled ? "cursor-not-allowed text-gray-600" : "",
          ].join(" ")}
        >
          {formatDobDisplay(value)}
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) setOpen((prev) => !prev);
          }}
          className={[
            "mr-2 inline-flex h-[32px] w-[32px] items-center justify-center text-gray-600",
            disabled ? "cursor-not-allowed text-gray-400" : open ? "text-green-800" : "",
          ].join(" ")}
          aria-label="Open calendar"
          title="Open calendar"
        >
          <CalendarIcon />
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-40 mt-2 w-[310px] rounded-[20px] border border-gray-200 bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!canGoPrevMonth}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-[12px] border bg-white shadow-sm transition-colors",
                canGoPrevMonth
                  ? "border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-800"
                  : "cursor-not-allowed border-gray-100 text-gray-300",
              ].join(" ")}
              aria-label="Previous month"
            >
              <ArrowLeftIcon />
            </button>

            <div className="relative flex items-center gap-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowMonthMenu((prev) => !prev);
                    setShowYearMenu(false);
                  }}
                  className="rounded-md px-2 py-1 text-[15px] font-semibold text-gray-900 hover:bg-green-50 hover:text-green-800"
                >
                  {MONTH_NAMES[viewMonth]}
                </button>

                {showMonthMenu && (
                  <div className="absolute left-0 top-[40px] z-50 max-h-52 w-[150px] overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    {MONTH_NAMES.map((monthName, monthIndex) => {
                      const probe = new Date(viewYear, monthIndex, 1);
                      const probeMonthStart = new Date(probe.getFullYear(), probe.getMonth(), 1);
                      const enabled =
                        probeMonthStart >= minMonthFirstDay &&
                        probeMonthStart <= todayMonthFirstDay;

                      const active = monthIndex === viewMonth;

                      return (
                        <button
                          key={monthName}
                          type="button"
                          disabled={!enabled}
                          onClick={() => {
                            setViewMonth(monthIndex);
                            setShowMonthMenu(false);
                          }}
                          className={[
                            "block w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                            !enabled
                              ? "cursor-not-allowed text-gray-300"
                              : active
                                ? "bg-green-100 text-green-900"
                                : "text-gray-800 hover:bg-green-50 hover:text-green-800",
                          ].join(" ")}
                        >
                          {monthName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowYearMenu((prev) => !prev);
                    setShowMonthMenu(false);
                  }}
                  className="rounded-md px-2 py-1 text-[15px] font-semibold text-gray-900 hover:bg-green-50 hover:text-green-800"
                >
                  {viewYear}
                </button>

                {showYearMenu && (
                  <div className="absolute right-0 top-[40px] z-50 max-h-52 w-[96px] overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
                    {yearOptions.map((year) => {
                      const active = year === viewYear;
                      return (
                        <button
                          key={year}
                          type="button"
                          onClick={() => {
                            setViewYear(year);
                            setShowYearMenu(false);

                            const nextMonthStart = new Date(year, viewMonth, 1);
                            if (nextMonthStart > todayMonthFirstDay) {
                              setViewMonth(today.getMonth());
                            }
                            if (nextMonthStart < minMonthFirstDay) {
                              setViewMonth(minDate.getMonth());
                            }
                          }}
                          className={[
                            "block w-full rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                            active
                              ? "bg-green-100 text-green-900"
                              : "text-gray-800 hover:bg-green-50 hover:text-green-800",
                          ].join(" ")}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goNextMonth}
              disabled={!canGoNextMonth}
              className={[
                "inline-flex h-9 w-9 items-center justify-center rounded-[12px] border bg-white shadow-sm transition-colors",
                canGoNextMonth
                  ? "border-gray-200 text-gray-700 hover:border-green-200 hover:bg-green-50 hover:text-green-800"
                  : "cursor-not-allowed border-gray-100 text-gray-300",
              ].join(" ")}
              aria-label="Next month"
            >
              <ArrowRightIcon />
            </button>
          </div>

          <div className="mt-3 border-t border-gray-200" />

          <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
            {WEEKDAY_SHORT.map((day) => (
              <div key={day} className="text-[12px] font-medium text-gray-400">
                {day}
              </div>
            ))}

            {calendarDays.map(({ date, inCurrentMonth }) => {
              const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              const minOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

              const iso = formatDateToIso(dateOnly);
              const isSelected = value === iso;
              const isAllowed = dateOnly <= todayOnly && dateOnly >= minOnly;

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={!isAllowed}
                  onClick={() => selectDate(dateOnly)}
                  className={[
                    "mx-auto inline-flex h-9 w-9 items-center justify-center rounded-[12px] text-[14px] font-medium transition-colors",
                    isSelected
                      ? "bg-green-700 text-white"
                      : !inCurrentMonth
                        ? "text-gray-300"
                        : isAllowed
                          ? "text-gray-800 hover:bg-green-50 hover:text-green-800"
                          : "cursor-not-allowed text-gray-300",
                  ].join(" ")}
                >
                  {dateOnly.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearDate}
              className="rounded-xl bg-green-700 px-4 py-2 text-[12px] font-semibold text-white hover:bg-green-800"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplicationFormPage() {
  const storedUser = useMemo(() => getStoredUser(), []);

  const today = useMemo(() => new Date(), []);
  const maxDob = useMemo(() => formatDateToIso(subtractYears(today, 17)), [today]);
  const minDob = useMemo(() => formatDateToIso(subtractYears(today, 75)), [today]);

  const initialForm: FormState = useMemo(
    () => ({
      firstName: storedUser?.firstName || "",
      middleName: "",
      lastName: storedUser?.lastName || "",
      extension: "",
      dob: "",
      gender: "",

      province: FIXED_PROVINCE,
      municipality: "",
      barangay: "",
      address: "",

      phone: "",
      email: storedUser?.email || "",

      fatherName: "",
      fatherOccupation: "",
      fatherIncome: "",
      fatherPhone: "",

      motherName: "",
      motherOccupation: "",
      motherIncome: "",
      motherPhone: "",

      govGrant: "",

      certificateOfResidency: null,
      indigencyCertificate: null,
      governmentID: null,
      certificateOfEnrollment: null,
      assessmentForm: null,
    }),
    [storedUser]
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [existing, setExisting] = useState<ApplicationDto | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [bannerOpen, setBannerOpen] = useState(false);
  const [bannerVariant, setBannerVariant] = useState<"success" | "error" | "info">("info");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerMessage, setBannerMessage] = useState("");

  const [saveChangesModalOpen, setSaveChangesModalOpen] = useState(false);

  const inputRefs = useRef<Partial<Record<FileFieldName, HTMLInputElement | null>>>({});
  const [removeFiles, setRemoveFiles] = useState<Partial<Record<FileFieldName, boolean>>>({});

  const objectUrlMapRef = useRef<Partial<Record<FileFieldName, string>>>({});
  const submittedSnapshotRef = useRef<FormState | null>(null);

  const container = "mx-auto w-full max-w-6xl";

  const inputBase =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-colors duration-150 focus:border-green-800 focus:ring-2 focus:ring-green-200 hover:border-green-700 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed";

  const labelBase = "mb-1 block text-[13px] font-semibold text-gray-700";
  const sectionTitle = "text-[17px] md:text-[18px] font-bold text-gray-900";
  const sectionWrap = "mt-7";
  const sectionBody = "mt-4 pl-4 md:pl-5";

  const barangayOptions = useMemo(() => {
    return form.municipality ? BARANGAY_BY_MUNICIPALITY[form.municipality] || [] : [];
  }, [form.municipality]);

  const fatherIncomeOptions = useMemo(
    () => getIncomeOptions(form.fatherOccupation),
    [form.fatherOccupation]
  );

  const motherIncomeOptions = useMemo(
    () => getIncomeOptions(form.motherOccupation),
    [form.motherOccupation]
  );

  const fileItems = useMemo(
    () =>
      [
        {
          key: "certificateOfResidency",
          label: "Certificate of Residency*",
          existingUrlKey: "certificateOfResidencyUrl",
        },
        {
          key: "indigencyCertificate",
          label: "Certificate of Indigency*",
          existingUrlKey: "indigencyCertificateUrl",
        },
        {
          key: "governmentID",
          label:
            "Government-Issued ID * (PhilSys National ID/ePhilID, Passport, Driver's License, Voter's ID, etc.)",
          existingUrlKey: "governmentIDUrl",
        },
        {
          key: "certificateOfEnrollment",
          label: "Certificate of Enrollment *",
          existingUrlKey: "certificateOfEnrollmentUrl",
        },
        {
          key: "assessmentForm",
          label: "Assessment Form *",
          existingUrlKey: "assessmentFormUrl",
        },
      ] as {
        key: FileFieldName;
        label: string;
        existingUrlKey:
          | "certificateOfResidencyUrl"
          | "indigencyCertificateUrl"
          | "governmentIDUrl"
          | "certificateOfEnrollmentUrl"
          | "assessmentFormUrl";
      }[],
    []
  );

  function getApplicationIdentity(app: ApplicationDto | null) {
    if (!app) return `email:${storedUser?.email || "guest"}`;
    const maybeId = (app as any)?.id ?? (app as any)?._id ?? app.email ?? storedUser?.email;
    return String(maybeId || "guest");
  }

  function getEditUsedKey(app: ApplicationDto | null) {
    return `scholarcheck_application_edit_used:${getApplicationIdentity(app)}`;
  }

  function hasUsedOneEdit(app: ApplicationDto | null) {
    try {
      return localStorage.getItem(getEditUsedKey(app)) === "true";
    } catch {
      return false;
    }
  }

  function markOneEditUsed(app: ApplicationDto | null) {
    try {
      localStorage.setItem(getEditUsedKey(app), "true");
    } catch {
      //
    }
  }

  const editAlreadyUsed = hasUsedOneEdit(existing);
  const canEditPending = !!existing && existing.status === "Pending";
  const canEditOnce = applicationsOpen && canEditPending && !editAlreadyUsed;
  const formLocked = readOnly || !applicationsOpen;
  const canModifyDocs =
    applicationsOpen &&
    !readOnly &&
    (!existing || (existing.status === "Pending" && !editAlreadyUsed));

  function openBanner(variant: "success" | "error" | "info", title: string, message: string) {
    setBannerVariant(variant);
    setBannerTitle(title);
    setBannerMessage(message);
    setBannerOpen(true);
  }

  function revokeObjectUrl(field: FileFieldName) {
    const existingUrl = objectUrlMapRef.current[field];
    if (existingUrl) {
      URL.revokeObjectURL(existingUrl);
      delete objectUrlMapRef.current[field];
    }
  }

  function setFileValue(field: FileFieldName, file: File | null) {
    revokeObjectUrl(field);
    setForm((prev) => ({ ...prev, [field]: file }));
  }

  function getSelectedFileUrl(field: FileFieldName) {
    const file = form[field];
    if (!file) return "";

    const existingUrl = objectUrlMapRef.current[field];
    if (existingUrl) return existingUrl;

    const nextUrl = URL.createObjectURL(file);
    objectUrlMapRef.current[field] = nextUrl;
    return nextUrl;
  }

  function openFile(field: FileFieldName, serverUrl?: string) {
    const selectedFile = form[field];

    if (selectedFile) {
      const localUrl = getSelectedFileUrl(field);
      if (localUrl) window.open(localUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (serverUrl) {
      window.open(serverUrl, "_blank", "noopener,noreferrer");
    }
  }

  function getSafeText(primary: unknown, fallback?: string, defaultValue = "") {
    const primaryText = typeof primary === "string" ? primary.trim() : "";
    if (primaryText) return primaryText;

    const fallbackText = typeof fallback === "string" ? fallback.trim() : "";
    if (fallbackText) return fallbackText;

    return defaultValue;
  }

  function buildMergedFormFromExisting(app: ApplicationDto, fallback?: FormState | null): FormState {
    const parsedAddress = parseAddressParts((app as any).address || fallback?.address || "");

    return {
      firstName: getSafeText(app.firstName, fallback?.firstName, storedUser?.firstName || ""),
      middleName: getSafeText((app as any).middleName, fallback?.middleName),
      lastName: getSafeText(app.lastName, fallback?.lastName, storedUser?.lastName || ""),
      extension: getSafeText((app as any).extension, fallback?.extension),
      dob: normalizeDateForInput((app as any).dob || fallback?.dob || ""),
      gender: getSafeText((app as any).gender, fallback?.gender),

      province: getSafeText((app as any).province, parsedAddress.province || fallback?.province, FIXED_PROVINCE),
      municipality: getSafeText((app as any).municipality, parsedAddress.municipality || fallback?.municipality),
      barangay: getSafeText((app as any).barangay, parsedAddress.barangay || fallback?.barangay),
      address: getSafeText(
        (app as any).address,
        fallback?.address,
        buildAddress(
          getSafeText((app as any).province, parsedAddress.province, FIXED_PROVINCE),
          getSafeText((app as any).municipality, parsedAddress.municipality),
          getSafeText((app as any).barangay, parsedAddress.barangay)
        )
      ),

      phone: getSafeText((app as any).phone, fallback?.phone),
      email: getSafeText(app.email, fallback?.email, storedUser?.email || ""),

      fatherName: getSafeText((app as any).fatherName, fallback?.fatherName),
      fatherOccupation: getSafeText((app as any).fatherOccupation, fallback?.fatherOccupation),
      fatherIncome: getSafeText((app as any).fatherIncome, fallback?.fatherIncome),
      fatherPhone: getSafeText((app as any).fatherPhone, fallback?.fatherPhone),

      motherName: getSafeText((app as any).motherName, fallback?.motherName),
      motherOccupation: getSafeText((app as any).motherOccupation, fallback?.motherOccupation),
      motherIncome: getSafeText((app as any).motherIncome, fallback?.motherIncome),
      motherPhone: getSafeText((app as any).motherPhone, fallback?.motherPhone),

      govGrant: getSafeText((app as any).govGrant, fallback?.govGrant),

      certificateOfResidency: null,
      indigencyCertificate: null,
      governmentID: null,
      certificateOfEnrollment: null,
      assessmentForm: null,
    };
  }

  function fillFromExisting(app: ApplicationDto, fallback?: FormState | null) {
    (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
      revokeObjectUrl(field);
    });

    setForm(buildMergedFormFromExisting(app, fallback));
    setRemoveFiles({});
    setErrors({});

    (Object.keys(inputRefs.current) as FileFieldName[]).forEach((k) => {
      const el = inputRefs.current[k];
      if (el) el.value = "";
    });
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const [app, openRes] = await Promise.all([
          getMyApplication(),
          getApplicationsOpen(),
        ]);

        if (!mounted) return;

        setApplicationsOpen(openRes.applicationsOpen);
        setExisting(app);

        if (app) {
          fillFromExisting(app, submittedSnapshotRef.current);
          setReadOnly(true);
        } else {
          setForm((prev) => ({
            ...prev,
            firstName: storedUser?.firstName || "",
            lastName: storedUser?.lastName || "",
            email: storedUser?.email || "",
            province: FIXED_PROVINCE,
          }));
          setReadOnly(false);
        }
      } catch (e: any) {
        if (!mounted) return;
        setLoadError(e?.message || "Failed to load application.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
      (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
        revokeObjectUrl(field);
      });
    };
  }, [storedUser]);

  function validateForm() {
    const newErrors: Record<string, string> = {};
    const todayDate = new Date();

    const required: TextFieldName[] = [
      "firstName",
      "middleName",
      "lastName",
      "dob",
      "gender",
      "province",
      "municipality",
      "barangay",
      "phone",
      "email",
      "fatherName",
      "fatherOccupation",
      "fatherIncome",
      "fatherPhone",
      "motherName",
      "motherOccupation",
      "motherIncome",
      "motherPhone",
      "govGrant",
    ];

    required.forEach((k) => {
      if (!String(form[k] ?? "").trim()) newErrors[k] = "Required";
    });

    if (form.municipality && !MUNICIPALITY_OPTIONS.includes(form.municipality)) {
      newErrors.municipality = "Please select a valid municipality.";
    }

    if (form.municipality && form.barangay) {
      const allowedBarangays = BARANGAY_BY_MUNICIPALITY[form.municipality] || [];
      if (!allowedBarangays.includes(form.barangay)) {
        newErrors.barangay = "Please select a valid barangay for the chosen municipality.";
      }
    }

    const computedAddress = buildAddress(form.province, form.municipality, form.barangay);
    if (!computedAddress.trim()) {
      newErrors.address = "Required";
    }

    if (form.dob) {
      const dobDate = new Date(form.dob);
      let age = todayDate.getFullYear() - dobDate.getFullYear();
      const monthDiff = todayDate.getMonth() - dobDate.getMonth();
      const dayDiff = todayDate.getDate() - dobDate.getDate();

      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
      }

      if (dobDate > todayDate) newErrors.dob = "Future dates are not allowed.";
      else if (age > 75) newErrors.dob = "Age cannot be above 75.";
      else if (age < 17) newErrors.dob = "Applicant must be at least 17 years old.";
    }

    if (form.phone && !isValidPhilippineMobile(form.phone)) {
      newErrors.phone = "Enter a valid Philippine mobile number starting with 09.";
    }

    if (form.fatherPhone && !isValidPhilippineMobile(form.fatherPhone)) {
      newErrors.fatherPhone = "Enter a valid Philippine mobile number starting with 09.";
    }

    if (form.motherPhone && !isValidPhilippineMobile(form.motherPhone)) {
      newErrors.motherPhone = "Enter a valid Philippine mobile number starting with 09.";
    }

    if (form.fatherIncome === INCOME_OPTION_NONE && !isNoneAllowedForOccupation(form.fatherOccupation)) {
      newErrors.fatherIncome = 'The "None" option is only allowed when occupation is N/A or None.';
    }

    if (form.motherIncome === INCOME_OPTION_NONE && !isNoneAllowedForOccupation(form.motherOccupation)) {
      newErrors.motherIncome = 'The "None" option is only allowed when occupation is N/A or None.';
    }

    const fileRequired: FileFieldName[] = [
      "certificateOfResidency",
      "indigencyCertificate",
      "governmentID",
      "certificateOfEnrollment",
      "assessmentForm",
    ];

    if (!existing) {
      fileRequired.forEach((k) => {
        if (!form[k]) newErrors[k] = "File required";
      });
    } else if (existing.status === "Pending") {
      fileRequired.forEach((k) => {
        const item = fileItems.find((f) => f.key === k);
        const existingUrl = item ? ((existing as any)[item.existingUrlKey] as string) : "";
        const hasServerFile = !!existingUrl && !removeFiles[k];
        const hasNewFile = !!form[k];

        if (!hasServerFile && !hasNewFile) {
          newErrors[k] = "File required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => {
    if (formLocked) return;

    const { name, value } = e.target;
    const fieldName = name as TextFieldName;

    let newValue = value;

    const letterOnlyFields: TextFieldName[] = ["firstName", "middleName", "lastName", "extension"];
    const parentNameFields: TextFieldName[] = ["fatherName", "motherName"];
    const occupationFields: TextFieldName[] = ["fatherOccupation", "motherOccupation"];
    const phoneFields: TextFieldName[] = ["fatherPhone", "motherPhone", "phone"];

    if (letterOnlyFields.includes(fieldName)) {
      newValue = value.replace(/[^A-Za-z]/g, "");
      if (fieldName === "firstName") newValue = newValue.slice(0, 25);
      else newValue = newValue.slice(0, 15);
    }

    if (parentNameFields.includes(fieldName)) {
      newValue = value.replace(/[^A-Za-z. ]/g, "").slice(0, 50);
    }

    if (occupationFields.includes(fieldName)) {
      newValue = value.replace(/[^A-Za-z./ ]/g, "").slice(0, 20);
    }

    if (phoneFields.includes(fieldName)) {
      newValue = normalizePhilippineMobileInput(value);
    }

    setForm((prev) => {
      const nextForm = { ...prev, [fieldName]: newValue };

      if (fieldName === "municipality") {
        nextForm.barangay = "";
      }

      if (fieldName === "fatherOccupation") {
        const noneAllowed = isNoneAllowedForOccupation(newValue);
        if (nextForm.fatherIncome === INCOME_OPTION_NONE && !noneAllowed) {
          nextForm.fatherIncome = "";
        }
      }

      if (fieldName === "motherOccupation") {
        const noneAllowed = isNoneAllowedForOccupation(newValue);
        if (nextForm.motherIncome === INCOME_OPTION_NONE && !noneAllowed) {
          nextForm.motherIncome = "";
        }
      }

      nextForm.address = buildAddress(
        nextForm.province || FIXED_PROVINCE,
        nextForm.municipality,
        nextForm.barangay
      );

      return nextForm;
    });

    if (fieldName === "municipality") {
      setErrors((prev) => ({
        ...prev,
        municipality: "",
        barangay: "",
        address: "",
      }));
      return;
    }

    if (fieldName === "barangay") {
      setErrors((prev) => ({
        ...prev,
        barangay: "",
        address: "",
      }));
      return;
    }

    if (fieldName === "fatherOccupation") {
      setErrors((prev) => ({
        ...prev,
        fatherOccupation: "",
        fatherIncome: "",
      }));
      return;
    }

    if (fieldName === "motherOccupation") {
      setErrors((prev) => ({
        ...prev,
        motherOccupation: "",
        motherIncome: "",
      }));
      return;
    }

    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canModifyDocs) return;

    const { name, files } = e.target;
    const fieldName = name as FileFieldName;

    if (!files || files.length === 0) return;

    const file = files[0];
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Only PDF, PNG, and JPG files are allowed.",
      }));

      const el = inputRefs.current[fieldName];
      if (el) el.value = "";
      setFileValue(fieldName, null);
      return;
    }

    setRemoveFiles((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    setFileValue(fieldName, file);
  };

  const handleX = (fieldName: FileFieldName, hasServerFile: boolean) => {
    if (!canModifyDocs) return;

    if (hasServerFile) {
      setRemoveFiles((prev) => ({ ...prev, [fieldName]: true }));
    }

    setFileValue(fieldName, null);

    setErrors((prev) => ({
      ...prev,
      [fieldName]: "",
    }));

    const el = inputRefs.current[fieldName];
    if (el) el.value = "";
  };

  function buildFormData() {
    const fd = new FormData();
    const computedAddress = buildAddress(form.province, form.municipality, form.barangay);

    fd.append("firstName", form.firstName);
    fd.append("middleName", form.middleName);
    fd.append("lastName", form.lastName);
    fd.append("extension", form.extension);

    fd.append("dob", form.dob);
    fd.append("gender", form.gender);

    fd.append("province", form.province);
    fd.append("municipality", form.municipality);
    fd.append("barangay", form.barangay);
    fd.append("address", computedAddress);

    fd.append("phone", form.phone);
    fd.append("email", form.email);

    fd.append("fatherName", form.fatherName);
    fd.append("fatherOccupation", form.fatherOccupation);
    fd.append("fatherIncome", form.fatherIncome);
    fd.append("fatherPhone", form.fatherPhone);

    fd.append("motherName", form.motherName);
    fd.append("motherOccupation", form.motherOccupation);
    fd.append("motherIncome", form.motherIncome);
    fd.append("motherPhone", form.motherPhone);

    fd.append("govGrant", form.govGrant);

    if (form.certificateOfResidency) fd.append("certificateOfResidency", form.certificateOfResidency);
    if (form.indigencyCertificate) fd.append("indigencyCertificate", form.indigencyCertificate);
    if (form.governmentID) fd.append("governmentID", form.governmentID);
    if (form.certificateOfEnrollment) fd.append("certificateOfEnrollment", form.certificateOfEnrollment);
    if (form.assessmentForm) fd.append("assessmentForm", form.assessmentForm);

    fd.append("removeFiles", JSON.stringify(removeFiles));

    return fd;
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!applicationsOpen) {
      openBanner(
        "info",
        "Applications Closed",
        "The scholarship application form is currently closed. Please wait for the next application cycle."
      );
      return;
    }

    if (readOnly) return;
    if (!validateForm()) return;

    if (!existing) {
      setConfirmOpen(true);
      return;
    }

    setSubmitLoading(true);
    try {
      submittedSnapshotRef.current = {
        ...form,
        address: buildAddress(form.province, form.municipality, form.barangay),
      };

      const fd = buildFormData();

      await updateMyApplication(fd);

      const updated = await getMyApplication();
      setExisting(updated);

      if (updated) {
        fillFromExisting(updated, submittedSnapshotRef.current);
      }

      markOneEditUsed(updated || existing);
      setReadOnly(true);
      setSaveChangesModalOpen(true);
    } catch (e: any) {
      openBanner("error", "Save Failed", e?.message || "Failed to save your changes.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!applicationsOpen) {
      openBanner(
        "info",
        "Applications Closed",
        "The scholarship application form is currently closed. Please wait for the next application cycle."
      );
      return;
    }

    setSubmitLoading(true);
    try {
      submittedSnapshotRef.current = {
        ...form,
        address: buildAddress(form.province, form.municipality, form.barangay),
      };

      const fd = buildFormData();

      await submitApplication(fd);

      const updated = await getMyApplication();
      setExisting(updated);

      if (updated) {
        fillFromExisting(updated, submittedSnapshotRef.current);
      }

      setConfirmOpen(false);
      setReadOnly(true);

      openBanner(
        "success",
        "Submission Successful!",
        "You have successfully saved your application. Please allow time for review. You may edit your application once while it is still pending."
      );
    } catch (e: any) {
      openBanner("error", "Submission Failed", e?.message || "Failed to save your application.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClear = () => {
    if (formLocked || existing) return;

    (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
      revokeObjectUrl(field);
    });

    setErrors({});
    setRemoveFiles({});

    (Object.keys(inputRefs.current) as FileFieldName[]).forEach((k) => {
      const el = inputRefs.current[k];
      if (el) el.value = "";
    });

    setForm({
      ...initialForm,
      firstName: storedUser?.firstName || "",
      lastName: storedUser?.lastName || "",
      email: storedUser?.email || "",
      province: FIXED_PROVINCE,
      municipality: "",
      barangay: "",
      address: "",
    });
  };

  const handleCancelEdit = () => {
    if (!existing) return;

    (Object.keys(objectUrlMapRef.current) as FileFieldName[]).forEach((field) => {
      revokeObjectUrl(field);
    });

    setErrors({});
    setRemoveFiles({});

    (Object.keys(inputRefs.current) as FileFieldName[]).forEach((k) => {
      const el = inputRefs.current[k];
      if (el) el.value = "";
    });

    fillFromExisting(existing, submittedSnapshotRef.current);
    setReadOnly(true);
  };

  const showActionButtons = !loading && applicationsOpen && !readOnly;
  const isEditingExisting = !!existing;

  return (
    <Layout>
      <div className={[container, "px-2 pt-2"].join(" ")}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#111827] sm:text-[24px] md:text-[26px]">
              Application Form
            </h1>
            <p className="mt-1 text-[14px] text-gray-600">Keep your information up-to-date</p>
          </div>
        </div>

        {loading && <p className="mt-4 text-[14px] text-gray-600">Loading...</p>}

        {!loading && loadError && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {loadError}
          </div>
        )}
      </div>

      <div className={[container, "mt-5 pb-10"].join(" ")}>
        <form
          id="application-form"
          onSubmit={handleSubmit}
          className="w-full rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {!loading && !applicationsOpen && <ApplicationsClosedBanner />}

          {existing && !loading && <ApplicationStatusBanner status={existing.status} />}

          {existing && !loading && (
            <div className="mb-6 rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] px-5 py-4">
              <div>
                <div className="flex items-start gap-2">
                  <InfoCircleIcon />
                  <div className="text-[19px] font-bold leading-tight text-[#111827] sm:text-[20px]">
                    Application Submitted
                  </div>
                </div>

                <div className="ml-[26px]">
                  {!applicationsOpen ? (
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
                      Applications are currently closed. Editing is temporarily disabled.
                    </p>
                  ) : !editAlreadyUsed ? (
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
                      You can edit your application once. Click the &quot;Edit Application&quot;
                      button to make changes.
                    </p>
                  ) : (
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-600">
                      You have already used your one-time edit. No further changes can be made.
                    </p>
                  )}

                  {readOnly && canEditOnce && (
                    <button
                      type="button"
                      onClick={() => setReadOnly(false)}
                      className="mt-3 inline-flex h-[38px] items-center justify-center rounded-md bg-green-800 px-5 text-[12px] font-semibold text-white hover:bg-green-900"
                    >
                      Edit Application
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <div className={sectionTitle}>Personal Information</div>

            <div className={sectionBody}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div>
                  <label className={labelBase}>First Name *</label>
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.firstName && <p className="mt-1 text-[12px] text-red-600">{errors.firstName}</p>}
                </div>

                <div>
                  <label className={labelBase}>Middle Name *</label>
                  <input
                    name="middleName"
                    value={form.middleName}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.middleName && <p className="mt-1 text-[12px] text-red-600">{errors.middleName}</p>}
                </div>

                <div>
                  <label className={labelBase}>Last Name *</label>
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.lastName && <p className="mt-1 text-[12px] text-red-600">{errors.lastName}</p>}
                </div>

                <div>
                  <label className={labelBase}>Extension (optional)</label>
                  <input
                    name="extension"
                    value={form.extension}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelBase}>Date Of Birth *</label>
                  <CustomDobPicker
                    name="dob"
                    value={form.dob}
                    min={minDob}
                    max={maxDob}
                    onChange={handleChange}
                    disabled={formLocked}
                  />
                  {errors.dob && <p className="mt-1 text-[12px] text-red-600">{errors.dob}</p>}
                </div>

                <div>
                  <label className={labelBase}>Gender (M/F)*</label>
                  <CustomSelect
                    name="gender"
                    value={form.gender}
                    options={genders}
                    placeholder="Select option"
                    disabled={formLocked}
                    onChange={handleChange}
                  />
                  {errors.gender && <p className="mt-1 text-[12px] text-red-600">{errors.gender}</p>}
                </div>

                <div />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelBase}>Province *</label>
                  <input name="province" value={form.province} readOnly disabled className={inputBase} />
                  {errors.province && <p className="mt-1 text-[12px] text-red-600">{errors.province}</p>}
                </div>

                <div>
                  <label className={labelBase}>Municipality *</label>
                  <CustomSelect
                    name="municipality"
                    value={form.municipality}
                    options={MUNICIPALITY_OPTIONS}
                    placeholder="Select Municipality"
                    disabled={formLocked}
                    onChange={handleChange}
                  />
                  {errors.municipality && (
                    <p className="mt-1 text-[12px] text-red-600">{errors.municipality}</p>
                  )}
                </div>

                <div>
                  <label className={labelBase}>Barangay *</label>
                  <CustomSelect
                    name="barangay"
                    value={form.barangay}
                    options={barangayOptions}
                    placeholder={form.municipality ? "Select Barangay" : "Select municipality first"}
                    disabled={formLocked || !form.municipality}
                    onChange={handleChange}
                  />
                  {errors.barangay && <p className="mt-1 text-[12px] text-red-600">{errors.barangay}</p>}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className={labelBase}>Phone Number *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="09XXXXXXXXX"
                  />
                  {errors.phone && <p className="mt-1 text-[12px] text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className={labelBase}>Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.email && <p className="mt-1 text-[12px] text-red-600">{errors.email}</p>}
                </div>

                <div />
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Father&apos;s Information</div>

            <div className={sectionBody}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelBase}>Full Name *</label>
                  <input
                    name="fatherName"
                    value={form.fatherName}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.fatherName && <p className="mt-1 text-[12px] text-red-600">{errors.fatherName}</p>}
                </div>

                <div>
                  <label className={labelBase}>Occupation *</label>
                  <input
                    name="fatherOccupation"
                    value={form.fatherOccupation}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.fatherOccupation && (
                    <p className="mt-1 text-[12px] text-red-600">{errors.fatherOccupation}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelBase}>Monthly Income *</label>
                  <CustomSelect
                    name="fatherIncome"
                    value={form.fatherIncome}
                    options={fatherIncomeOptions}
                    placeholder="Select Monthly Income"
                    disabled={formLocked}
                    onChange={handleChange}
                  />
                  {errors.fatherIncome && <p className="mt-1 text-[12px] text-red-600">{errors.fatherIncome}</p>}
                </div>

                <div>
                  <label className={labelBase}>Phone Number*</label>
                  <input
                    name="fatherPhone"
                    value={form.fatherPhone}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="09XXXXXXXXX"
                  />
                  {errors.fatherPhone && <p className="mt-1 text-[12px] text-red-600">{errors.fatherPhone}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Mother&apos;s Information</div>

            <div className={sectionBody}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelBase}>Full Name *</label>
                  <input
                    name="motherName"
                    value={form.motherName}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.motherName && <p className="mt-1 text-[12px] text-red-600">{errors.motherName}</p>}
                </div>

                <div>
                  <label className={labelBase}>Occupation *</label>
                  <input
                    name="motherOccupation"
                    value={form.motherOccupation}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                  />
                  {errors.motherOccupation && (
                    <p className="mt-1 text-[12px] text-red-600">{errors.motherOccupation}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelBase}>Monthly Income *</label>
                  <CustomSelect
                    name="motherIncome"
                    value={form.motherIncome}
                    options={motherIncomeOptions}
                    placeholder="Select Monthly Income"
                    disabled={formLocked}
                    onChange={handleChange}
                  />
                  {errors.motherIncome && <p className="mt-1 text-[12px] text-red-600">{errors.motherIncome}</p>}
                </div>

                <div>
                  <label className={labelBase}>Phone Number*</label>
                  <input
                    name="motherPhone"
                    value={form.motherPhone}
                    onChange={handleChange}
                    className={inputBase}
                    disabled={formLocked}
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="09XXXXXXXXX"
                  />
                  {errors.motherPhone && <p className="mt-1 text-[12px] text-red-600">{errors.motherPhone}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Scholarship History</div>

            <div className={sectionBody}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className={labelBase}>
                    Have you received any government grants or financial aid in the last 3 months? *
                  </label>
                  <CustomSelect
                    name="govGrant"
                    value={form.govGrant}
                    options={["Yes", "No"]}
                    placeholder="Select option"
                    disabled={formLocked}
                    onChange={handleChange}
                  />
                  {errors.govGrant && <p className="mt-1 text-[12px] text-red-600">{errors.govGrant}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className={sectionWrap}>
            <div className={sectionTitle}>Documents</div>

            <div className={sectionBody}>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
                {fileItems.map((item) => {
                  const selected = form[item.key];
                  const existingUrl = existing ? ((existing as any)[item.existingUrlKey] as string) : "";
                  const hasServerFile = !!existingUrl && !removeFiles[item.key];
                  const isSelected = !!selected || hasServerFile;
                  const disableChoose = !canModifyDocs || isSelected;
                  const showX = canModifyDocs && isSelected;
                  const canView = !!selected || hasServerFile;

                  return (
                    <div key={item.key}>
                      <label className="mb-2 block text-[12px] font-medium leading-snug text-gray-700">
                        {item.label}
                      </label>

                      <div className="flex items-center gap-2">
                        <input
                          ref={(el) => {
                            inputRefs.current[item.key] = el;
                          }}
                          id={item.key}
                          type="file"
                          name={item.key}
                          onChange={handleFileChange}
                          accept=".pdf,.png,.jpg,.jpeg"
                          disabled={disableChoose}
                          className="hidden"
                        />

                        <div className="flex h-[42px] w-full items-center justify-between rounded-[6px] border border-[#cfcfcf] bg-white px-[8px]">
                          <label
                            htmlFor={item.key}
                            className={[
                              "inline-flex h-[28px] min-w-[94px] items-center justify-center rounded-[4px] px-3 text-[12px] font-medium leading-none text-white",
                              disableChoose
                                ? "cursor-not-allowed bg-green-800/50"
                                : "cursor-pointer bg-green-800 hover:bg-green-900",
                            ].join(" ")}
                          >
                            Choose File
                          </label>

                          {canView ? (
                            <button
                              type="button"
                              onClick={() => openFile(item.key, hasServerFile ? existingUrl : "")}
                              className="ml-3 flex-1 truncate text-right text-[12px] text-blue-600 underline underline-offset-2 hover:text-blue-700"
                              title="View uploaded file"
                            >
                              File selected
                            </button>
                          ) : (
                            <span className="ml-3 flex-1 truncate text-right text-[12px] text-[#4b4b4b]">
                              {isSelected ? "File selected" : ""}
                            </span>
                          )}
                        </div>

                        {showX && (
                          <button
                            type="button"
                            onClick={() => handleX(item.key, hasServerFile)}
                            className="inline-flex h-[42px] w-[42px] items-center justify-center rounded-[6px] border border-[#cfcfcf] bg-white text-[13px] text-gray-600 hover:bg-gray-50"
                            title="Remove file"
                            aria-label="Remove file"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {errors[item.key] && <p className="mt-2 text-[12px] text-red-600">{errors[item.key]}</p>}
                    </div>
                  );
                })}
              </div>

              {!formLocked && canEditOnce && (
                <p className="mt-3 text-[12px] text-gray-600">
                  Click the file text to view it, or click ✕ to remove a selected document if you
                  want to choose a different file.
                </p>
              )}
            </div>
          </div>
        </form>

        {showActionButtons && (
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                void handleSubmit();
              }}
              disabled={submitLoading}
              className={[
                "rounded-md px-10 py-3 text-[14px] font-semibold text-white",
                submitLoading
                  ? "cursor-not-allowed bg-green-800/50"
                  : "bg-green-800 hover:bg-green-900",
              ].join(" ")}
            >
              {submitLoading ? "Saving..." : isEditingExisting ? "Save Changes" : "Save"}
            </button>

            <button
              type="button"
              onClick={isEditingExisting ? handleCancelEdit : handleClear}
              disabled={submitLoading}
              className={[
                "rounded-md px-10 py-3 text-[14px] font-semibold text-white",
                submitLoading
                  ? "cursor-not-allowed bg-gray-400/50"
                  : "bg-gray-400 hover:bg-gray-500",
              ].join(" ")}
            >
              {isEditingExisting ? "Cancel" : "Clear"}
            </button>
          </div>
        )}
      </div>

      <ConfirmSubmissionModal
        isOpen={confirmOpen}
        mode="submit"
        loading={submitLoading}
        onConfirm={handleConfirmSubmit}
        onClose={() => setConfirmOpen(false)}
      />

      <StatusBannerModal
        isOpen={bannerOpen}
        variant={bannerVariant}
        title={bannerTitle}
        message={bannerMessage}
        onClose={() => {
          setBannerOpen(false);
          setReadOnly(true);
        }}
      />

      <SaveChangesModal
        isOpen={saveChangesModalOpen}
        onClose={() => setSaveChangesModalOpen(false)}
      />
    </Layout>
  );
}