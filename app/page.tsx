"use client";

import { useEffect, useMemo, useState } from "react";

type SavedFood = {
  id: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
};

type FoodLog = {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  brand: string;
  calories: number;
  protein: number;
};

type DailySummary = {
  date: string;
  calories: number;
  protein: number;
  status: "hit" | "close" | "missed";
};

const DEFAULT_CALORIE_TARGET = 1200;
const DEFAULT_PROTEIN_TARGET = 170;

function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function getDayStatus(
  calories: number,
  protein: number,
  calorieTarget: number,
  proteinTarget: number
): DailySummary["status"] {
  const diff = calories - calorieTarget;

  // HIT = within 50 calories under OR exactly at target
  if (diff <= 0 && diff >= -50) return "hit";

  // CLOSE = slightly over target (up to +150)
  if (diff > 0 && diff <= 150) return "close";

  return "missed";
}

function statusEmoji(status: DailySummary["status"]) {
  if (status === "hit") return "✅";
  if (status === "close") return "⚠️";
  return "❌";
}

function statusText(status: DailySummary["status"]) {
  if (status === "hit") return "Hit";
  if (status === "close") return "Close";
  return "Missed";
}

function statusColor(status: DailySummary["status"]) {
  if (status === "hit") return "text-green-400";
  if (status === "close") return "text-yellow-400";
  return "text-red-400";
}

function buildDailySummaries(
  logs: FoodLog[],
  calorieTarget: number,
  proteinTarget: number
): DailySummary[] {
  const grouped: Record<string, { calories: number; protein: number }> = {};

  for (const log of logs) {
    if (!grouped[log.date]) {
      grouped[log.date] = { calories: 0, protein: 0 };
    }

    grouped[log.date].calories += log.calories;
    grouped[log.date].protein += log.protein;
  }

  return Object.entries(grouped)
    .map(([date, totals]) => ({
      date,
      calories: totals.calories,
      protein: totals.protein,
      status: getDayStatus(
        totals.calories,
        totals.protein,
        calorieTarget,
        proteinTarget
      ),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export default function Page() {
  type BodyWeightEntry = {
    id: string;
    date: string;
    weight: number;
  };

  const today = getTodayDateString();

  const [calorieTarget, setCalorieTarget] = useState(String(DEFAULT_CALORIE_TARGET));
  const [proteinTarget, setProteinTarget] = useState(String(DEFAULT_PROTEIN_TARGET));

  const calorieTargetValue = Number(calorieTarget || 0);
  const proteinTargetValue = Number(proteinTarget || 0);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    calories: "",
    protein: "",
  });

  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([
    {
      id: "sf-1",
      name: "Greek Yogurt",
      brand: "Fage 0%",
      calories: 135,
      protein: 25,
    },
    {
      id: "sf-2",
      name: "Chicken Breast",
      brand: "Generic",
      calories: 165,
      protein: 31,
    },
  ]);

  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([
    {
      id: "log-1",
      date: today,
      name: "Greek Yogurt Bowl",
      brand: "Fage 0%",
      calories: 300,
      protein: 51,
    },
    {
      id: "log-2",
      date: today,
      name: "Chicken Sausage + Broth",
      brand: "H-E-B / Kettle & Fire",
      calories: 240,
      protein: 45,
    },
  ]);

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showAddFoodForm, setShowAddFoodForm] = useState(false);
  const [showSavedFoods, setShowSavedFoods] = useState(false);
  const [savedFoodSearch, setSavedFoodSearch] = useState("");
  const [logView, setLogView] = useState<"today" | "history">("today");
  const [weightInput, setWeightInput] = useState("");
  const [bodyWeightEntries, setBodyWeightEntries] = useState<BodyWeightEntry[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  //   { id: "bw-1", date: "2026-03-22", weight: 194.2 },
  //   { id: "bw-2", date: "2026-03-23", weight: 193.8 },
  //   { id: "bw-3", date: "2026-03-24", weight: 192.5 },
  //   { id: "bw-4", date: "2026-03-25", weight: 190.1 },
  //   { id: "bw-5", date: "2026-03-26", weight: 188.9 },
  //   { id: "bw-6", date: "2026-03-27", weight: 188.6 },
  //   { id: "bw-7", date: "2026-03-28", weight: 187.2 },

  useEffect(() => {
    const savedFoodsRaw = localStorage.getItem("logger.savedFoods");
    const foodLogsRaw = localStorage.getItem("logger.foodLogs");
    const calorieTargetRaw = localStorage.getItem("logger.calorieTarget");
    const proteinTargetRaw = localStorage.getItem("logger.proteinTarget");
    const bodyWeightEntriesRaw = localStorage.getItem("logger.bodyWeightEntries");

    if (savedFoodsRaw) {
      try {
        setSavedFoods(JSON.parse(savedFoodsRaw));
      } catch {}
    }

    if (foodLogsRaw) {
      try {
        setFoodLogs(JSON.parse(foodLogsRaw));
      } catch {}
    }

    if (calorieTargetRaw) {
      setCalorieTarget(calorieTargetRaw);
    }

    if (proteinTargetRaw) {
      setProteinTarget(proteinTargetRaw);
    }

    if (bodyWeightEntriesRaw) {
      try {
        setBodyWeightEntries(JSON.parse(bodyWeightEntriesRaw));
      } catch {}
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    localStorage.setItem("logger.savedFoods", JSON.stringify(savedFoods));
    localStorage.setItem("logger.foodLogs", JSON.stringify(foodLogs));
    localStorage.setItem("logger.calorieTarget", calorieTarget);
    localStorage.setItem("logger.proteinTarget", proteinTarget);
    localStorage.setItem("logger.bodyWeightEntries", JSON.stringify(bodyWeightEntries));
  }, [
    isHydrated,
    savedFoods,
    foodLogs,
    calorieTarget,
    proteinTarget,
    bodyWeightEntries,
  ]);

  const dailySummaries = useMemo(
    () => buildDailySummaries(foodLogs, calorieTargetValue, proteinTargetValue),
    [foodLogs, calorieTargetValue, proteinTargetValue]
  );

  const filteredSavedFoods = useMemo(() => {
    const query = savedFoodSearch.trim().toLowerCase();

    if (!query) return savedFoods;

    return savedFoods.filter((food) => {
      return (
        food.name.toLowerCase().includes(query) ||
        food.brand.toLowerCase().includes(query)
      );
    });
  }, [savedFoods, savedFoodSearch]);

  const selectedDayLogs = useMemo(() => {
    return foodLogs.filter((log) => log.date === selectedDate);
  }, [foodLogs, selectedDate]);

  const selectedDaySummary = useMemo(() => {
    return dailySummaries.find((day) => day.date === selectedDate) ?? null;
  }, [dailySummaries, selectedDate]);

  const todaySummary = useMemo(() => {
    return dailySummaries.find((day) => day.date === today) ?? null;
  }, [dailySummaries, today]);

  const weeklySummaries = useMemo(() => {
    const todayDate = new Date(`${today}T00:00:00`);

    return dailySummaries.filter((day) => {
      const dayDate = new Date(`${day.date}T00:00:00`);
      const diffInMs = todayDate.getTime() - dayDate.getTime();
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

      return diffInDays >= 0 && diffInDays < 7;
    });
  }, [dailySummaries, today]);

  const weeklyDaysOnTarget = useMemo(() => {
    return weeklySummaries.filter((day) => day.status === "hit").length;
  }, [weeklySummaries]);

  const weeklyAverageProtein = useMemo(() => {
    if (weeklySummaries.length === 0) return 0;

    const totalProtein = weeklySummaries.reduce((sum, day) => sum + day.protein, 0);
    return Math.round(totalProtein / weeklySummaries.length);
  }, [weeklySummaries]);

  const sortedBodyWeightEntries = useMemo(() => {
    return [...bodyWeightEntries].sort((a, b) => a.date.localeCompare(b.date));
  }, [bodyWeightEntries]);

  const recentBodyWeightEntries = useMemo(() => {
    return sortedBodyWeightEntries.slice(-7);
  }, [sortedBodyWeightEntries]);

  function handleAddFood(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.brand.trim() ||
      !form.calories.trim() ||
      !form.protein.trim()
    ) {
      return;
    }

    const calories = Number(form.calories);
    const protein = Number(form.protein);

    if (Number.isNaN(calories) || Number.isNaN(protein)) {
      return;
    }

    const newFood: SavedFood = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      brand: form.brand.trim(),
      calories,
      protein,
    };

    setSavedFoods((prev) => [newFood, ...prev]);
    setForm({
      name: "",
      brand: "",
      calories: "",
      protein: "",
    });
  }

  function logFoodToToday(food: SavedFood) {
    const newLog: FoodLog = {
      id: crypto.randomUUID(),
      date: today,
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
    };

    setFoodLogs((prev) => [newLog, ...prev]);
    setSelectedDate(today);
  }

  function deleteLog(logId: string) {
    setFoodLogs((prev) => prev.filter((log) => log.id !== logId));
  }

  function getWeightForDate(date: string) {
    return bodyWeightEntries.find((entry) => entry.date === date) ?? null;
  }

  function handleSaveWeight() {
    if (!weightInput.trim()) return;

    const weight = Number(weightInput);

    if (Number.isNaN(weight)) return;

    const newEntry: BodyWeightEntry = {
      id: crypto.randomUUID(),
      date: today,
      weight,
    };

    setBodyWeightEntries((prev) => {
      const withoutToday = prev.filter((entry) => entry.date !== today);
      return [newEntry, ...withoutToday];
    });

    setWeightInput("");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-8">
          {/* Header */}
          <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-5xl font-semibold tracking-[-0.04em] text-white">
                logger.io
              </h1>
              <p className="mt-2 text-base text-neutral-500"></p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300">
                {formatDisplayDate(today)}
              </div>

              {todaySummary && (
                <div
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    todaySummary.status === "hit"
                      ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20"
                      : todaySummary.status === "close"
                      ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
                      : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                  }`}
                >
                  {statusText(todaySummary.status)}
                </div>
              )}
            </div>
          </header>

          {/* Summary strip */}
          <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-sm text-neutral-500">Calories</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight">
                  {todaySummary?.calories ?? 0}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-sm text-neutral-500">Protein</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight">
                  {todaySummary?.protein ?? 0}
                  <span className="ml-1 text-2xl text-neutral-500">g</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-sm text-neutral-500">Status</div>
                <div className={`mt-3 text-3xl font-semibold ${todaySummary ? statusColor(todaySummary.status) : "text-neutral-500"}`}>
                  {todaySummary ? statusText(todaySummary.status) : "No data"}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="text-sm text-neutral-500">Weight</div>
                <div className="mt-3 text-4xl font-semibold tracking-tight">
                  {bodyWeightEntries.length > 0 ? bodyWeightEntries[0].weight : "--"}
                  <span className="ml-1 text-2xl text-neutral-500">lb</span>
                </div>
              </div>
            </div>
          </section>

          {/* Main 2-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 it">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Today's Log */}
              <section className="relative flex h-[750px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(to_bottom,rgba(23,23,23,0.95),rgba(5,5,5,0.98))] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="mb-6 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-500">
                      {logView === "today" ? "Daily Nutrition" : "Nutrition History"}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      {logView === "today" ? "Today's Log" : "Full History"}
                    </h2>
                    {logView === "history" && (
                      <button
                        type="button"
                        onClick={() => setLogView("today")}
                        className="mt-3 text-xs text-neutral-400 hover:text-white transition"
                      >
                        ← Back to Today
                      </button>
                    )}
                    <p className="mt-2 text-sm text-neutral-500">
                      {logView === "today"
                        ? `Foods logged for ${formatDisplayDate(today)}`
                        : " "}
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-neutral-400">
                    {selectedDayLogs.length} items
                  </div>
                </div>

                {logView === "today" ? (
                  selectedDayLogs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-500">
                      No foods logged yet.
                    </div>
                  ) : (
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                      {selectedDayLogs.map((log) => (
                        <div
                          key={log.id}
                          className="group flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 transition hover:border-white/15 hover:bg-white/[0.04]"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white">{log.name}</div>
                            <div className="mt-1 text-xs text-neutral-500">{log.brand}</div>
                          </div>

                          <div className="ml-auto flex items-center gap-2">
                            <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-neutral-300 ring-1 ring-white/10">
                              {log.calories} cal
                            </span>
                            <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-neutral-300 ring-1 ring-white/10">
                              {log.protein}g
                            </span>

                            <button
                              type="button"
                              onClick={() => deleteLog(log.id)}
                              className="ml-2 rounded-full px-2 py-1 text-[11px] text-red-400 opacity-0 transition hover:bg-red-500/10 group-hover:opacity-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  dailySummaries.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-500">
                      No history yet.
                    </div>
                  ) : (
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                      {dailySummaries.map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => {
                            setSelectedDate(day.date);
                            setLogView("today");
                          }}
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition hover:border-white/20 hover:bg-white/[0.03]"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <div className="text-sm font-medium text-white">
                                {formatDisplayDate(day.date)}
                              </div>
                              <div className="mt-1 text-xs text-neutral-500">
                                {day.calories} cal • {day.protein}g protein
                                {getWeightForDate(day.date) ? ` • ${getWeightForDate(day.date)?.weight} lb` : ""}
                              </div>
                            </div>

                            <div
                              className={`text-sm font-medium ${
                                day.status === "hit"
                                  ? "text-green-400"
                                  : day.status === "close"
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {statusText(day.status)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                )}
              </section>

              {/* Daily History */}
              <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                <div className="mb-5">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Daily Stats
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {/* Review previous days and inspect the details. */}
                  </p>
                </div>

                {dailySummaries.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-500">
                    No days logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dailySummaries.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setSelectedDate(day.date)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          selectedDate === day.date
                            ? "border-white/25 bg-white/[0.06]"
                            : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <div className="text-lg font-medium text-white">
                              {formatDisplayDate(day.date)}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-400">
                              <span>
                                {day.calories <= calorieTargetValue
                                  ? `${calorieTargetValue - day.calories} cal left`
                                  : `-${day.calories - calorieTarget} cal over`}
                              </span>
                              {/* <span>{foodLogs.filter(log => log.date === day.date).length} foods</span> */}
                            </div>
                          </div>

                          <div
                            className={`rounded-full px-3 py-1 text-sm font-medium ${
                              day.status === "hit"
                                ? "bg-green-500/10 text-green-400 ring-1 ring-green-500/20"
                                : day.status === "close"
                                ? "bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/20"
                                : "bg-red-500/10 text-red-400 ring-1 ring-red-500/20"
                            }`}
                          >
                            {/* {statustext(day.status)} */}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>

{/*               <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6"> */}
{/*   <div className="mb-4"> */}
{/*     <h2 className="text-2xl font-semibold tracking-tight"> */}
{/*       Weight Trend */}
{/*     </h2> */}
{/*     <p className="mt-1 text-sm text-neutral-500"> */}
{/*       Last 7 weigh-ins. */}
{/*     </p> */}
{/*   </div> */}
{/**/}
{/*   {recentBodyWeightEntries.length === 0 ? ( */}
{/*     <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-sm text-neutral-500"> */}
{/*       No weight data yet. */}
{/*     </div> */}
{/*   ) : ( */}
{/*     <div className="rounded-2xl border border-white/10 bg-black/20 p-4"> */}
{/*       <div className="mb-3 flex items-center justify-between text-sm text-neutral-500"> */}
{/*         <span>{recentBodyWeightEntries[0].weight} lb</span> */}
{/*         <span>{recentBodyWeightEntries[recentBodyWeightEntries.length - 1].weight} lb</span> */}
{/*       </div> */}
{/**/}
{/*       <svg viewBox="0 0 300 120" className="h-36 w-full"> */}
{/*         <polyline */}
{/*           fill="none" */}
{/*           stroke="currentColor" */}
{/*           strokeWidth="2.5" */}
{/*           points={recentBodyWeightEntries */}
{/*             .map((entry, index, arr) => { */}
{/*               const minWeight = Math.min(...arr.map((item) => item.weight)); */}
{/*               const maxWeight = Math.max(...arr.map((item) => item.weight)); */}
{/*               const range = maxWeight - minWeight || 1; */}
{/**/}
{/*               const x = arr.length === 1 ? 150 : (index / (arr.length - 1)) * 300; */}
{/*               const y = 110 - ((entry.weight - minWeight) / range) * 70; */}
{/**/}
{/*               return `${x},${y}`; */}
{/*             }) */}
{/*             .join(" ")} */}
{/*           className="text-white" */}
{/*         /> */}
{/*       </svg> */}
{/**/}
{/*       <div className="mt-3 flex justify-between text-xs text-neutral-500"> */}
{/*         {recentBodyWeightEntries.map((entry) => ( */}
{/*           <span key={entry.id}> */}
{/*             {formatDisplayDate(entry.date)} */}
{/*           </span> */}
{/*         ))} */}
{/*       </div> */}
{/*     </div> */}
{/*   )} */}
{/* </section> */}
            </div>

            {/* Right column */}
            <aside className="space-y-6 lg:col-span-1">
              {/* Saved Foods */}
              <section className="flex h-[310px] flex-col rounded-3xl border border-white/10 bg-neutral-950 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                      Saved Foods
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Click once to log to today.
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-400">
                    {savedFoods.length} items
                  </div>
                </div>

                <div className="mb-4">
                  <input
                    type="text"
                    value={savedFoodSearch}
                    onChange={(e) => setSavedFoodSearch(e.target.value)}
                    placeholder="Search saved foods"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                  />
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                  {filteredSavedFoods.map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => logFoodToToday(food)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.03]"
                    >
                      <div className="text-base font-medium text-white">
                        {food.name}
                      </div>
                      <div className="mt-1 text-sm text-neutral-500">
                        {food.brand}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-neutral-300">
                          {food.calories} cal
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-neutral-300">
                          {food.protein}g protein
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Quick actions / Add food placeholder */}
              <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Quick Actions
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    {/* Keep the main screen calm and focused. */}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-xs text-neutral-500">Calories goal</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={calorieTarget}
                        onChange={(e) =>
                          setCalorieTarget(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-neutral-500">Protein goal</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={proteinTarget}
                        onChange={(e) =>
                          setProteinTarget(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddFoodForm((prev) => !prev)}
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-neutral-200"
                  >
                    {showAddFoodForm ? "Close" : "+ New Saved Food"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogView("history")}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-300 transition hover:border-white/20 hover:bg-white/[0.03]"
                  >
                    History
                  </button>

                  {showAddFoodForm && (
                    <form onSubmit={handleAddFood} className="space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Food name"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                      />

                      <input
                        type="text"
                        value={form.brand}
                        onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                        placeholder="Brand"
                        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.calories}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              calories: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="Calories"
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                        />

                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.protein}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              protein: e.target.value.replace(/\D/g, ""),
                            }))
                          }
                          placeholder="Protein"
                          className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                      >
                        Save Food
                      </button>
                    </form>
                  )}
                </div>
              </section>

              {/* Weekly snapshot placeholder */}
              {/* <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6"> */}
              {/*   <div className="mb-4"> */}
              {/*     <h2 className="text-2xl font-semibold tracking-tight"> */}
              {/*       Weekly Snapshot */}
              {/*     </h2> */}
              {/*     <p className="mt-1 text-sm text-neutral-500"> */}
              {/*       Simple trend view. */}
              {/*     </p> */}
              {/*   </div> */}
              {/**/}
              {/*   <div className="space-y-4"> */}
              {/*     <div className="rounded-2xl border border-white/10 bg-black/20 p-4"> */}
              {/*       <div className="text-sm text-neutral-500">Days on target</div> */}
              {/*       <div className="mt-2 text-2xl font-semibold">{weeklyDaysOnTarget} / 7</div> */}
              {/*     </div> */}
              {/**/}
              {/*     <div className="rounded-2xl border border-white/10 bg-black/20 p-4"> */}
              {/*       <div className="text-sm text-neutral-500">Average protein</div> */}
              {/*       <div className="mt-2 text-2xl font-semibold">{weeklyAverageProtein}g</div> */}
              {/*     </div> */}
              {/*   </div> */}
              {/* </section> */}

              <section className="rounded-3xl border border-white/10 bg-neutral-950 p-6">
                <div className="mb-4">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Body Weight
                  </h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Log today's weigh-in.
                  </p>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weightInput}
                    onChange={(e) => {
                      const value = e.target.value;

                      // allow only numbers + ONE decimal point
                      if (/^\d*\.?\d*$/.test(value)) {
                        setWeightInput(value);
                      }
                    }}
                    placeholder="Enter weight"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-white/20 focus:bg-white/[0.03]"
                  />

                  <button
                    type="button"
                    onClick={handleSaveWeight}
                    className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    Save Weight
                  </button>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-sm text-neutral-500">Latest entry</div>
                    <div className="mt-2 text-2xl font-semibold">
                      {bodyWeightEntries.length > 0
                        ? `${bodyWeightEntries[0].weight} lb`
                        : "No data"}
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
