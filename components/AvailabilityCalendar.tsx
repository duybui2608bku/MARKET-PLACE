"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AvailabilityCalendarProps {
  workerId: string;
  isEditable?: boolean; // Allow editing availability
}

interface DayAvailability {
  date: string; // YYYY-MM-DD
  isAvailable: boolean;
  isBooked: boolean;
  bookingIds?: string[];
}

export function AvailabilityCalendar({
  workerId,
  isEditable = false,
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState<Map<string, DayAvailability>>(new Map());
  const [loading, setLoading] = useState(false);

  const daysOfWeek = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  useEffect(() => {
    loadAvailability();
  }, [currentDate, workerId]);

  async function loadAvailability() {
    setLoading(true);
    try {
      // TODO: Load from Supabase bookings table
      // For now, mock data
      const mockAvailability = new Map<string, DayAvailability>();
      
      // Example: mark some days as booked
      const today = new Date();
      for (let i = 5; i <= 8; i++) {
        const date = new Date(year, month, i);
        if (date >= today) {
          const dateStr = formatDate(date);
          mockAvailability.set(dateStr, {
            date: dateStr,
            isAvailable: false,
            isBooked: true,
            bookingIds: ["booking-123"],
          });
        }
      }

      setAvailability(mockAvailability);
    } catch (error) {
      console.error("Failed to load availability:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  function getDayStatus(day: number): DayAvailability {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    return (
      availability.get(dateStr) || {
        date: dateStr,
        isAvailable: true,
        isBooked: false,
      }
    );
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function handleDayClick(day: number) {
    if (!isEditable) return;
    
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const currentStatus = getDayStatus(day);

    // Toggle availability
    const newAvailability = new Map(availability);
    newAvailability.set(dateStr, {
      date: dateStr,
      isAvailable: !currentStatus.isAvailable,
      isBooked: currentStatus.isBooked,
      bookingIds: currentStatus.bookingIds,
    });

    setAvailability(newAvailability);

    // TODO: Save to database
    console.log("Day clicked:", dateStr, "New availability:", !currentStatus.isAvailable);
  }

  function renderDays() {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-2" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const status = getDayStatus(day);

      let dayClasses = "aspect-square p-2 rounded-lg text-center font-medium transition-all cursor-pointer ";
      
      if (isPast) {
        dayClasses += "text-zinc-400 dark:text-zinc-600 cursor-not-allowed ";
      } else if (status.isBooked) {
        dayClasses += "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 ";
      } else if (!status.isAvailable) {
        dayClasses += "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500 ";
      } else {
        dayClasses += "bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900 ";
      }

      if (isToday) {
        dayClasses += "ring-2 ring-blue-500 dark:ring-blue-400 ";
      }

      days.push(
        <button
          key={day}
          onClick={() => !isPast && !status.isBooked && handleDayClick(day)}
          disabled={isPast || status.isBooked || !isEditable}
          className={dayClasses}
          title={
            status.isBooked
              ? "Đã đặt"
              : status.isAvailable
              ? "Còn trống"
              : "Không khả dụng"
          }
        >
          <div className="flex h-full w-full items-center justify-center text-sm">
            {day}
          </div>
        </button>
      );
    }

    return days;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white">Lịch trống</h3>
      </div>

      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <h4 className="text-base font-semibold text-black dark:text-white">
          {monthNames[month]} {year}
        </h4>

        <button
          onClick={handleNextMonth}
          className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Days of Week */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-50 dark:bg-green-950"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Còn trống</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-100 dark:bg-red-950"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Đã đặt</span>
        </div>
        {isEditable && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-zinc-100 dark:bg-zinc-800"></div>
            <span className="text-zinc-600 dark:text-zinc-400">Không khả dụng</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-4 text-center text-sm text-zinc-500">
          Đang tải lịch...
        </div>
      )}
    </div>
  );
}

