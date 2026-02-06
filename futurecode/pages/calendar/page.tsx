import { EconomicCalendar } from "@/components/calendar/EconomicCalendar";
import { EarningsCalendar } from "@/components/calendar/EarningsCalendar";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          Track economic events and earnings that may impact your positions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsCalendar />
        <EconomicCalendar />
      </div>
    </div>
  );
}
