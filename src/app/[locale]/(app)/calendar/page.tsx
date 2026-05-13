import { CalendarView } from "@/components/calendar/CalendarView";
import { getTrades } from "@/lib/trades-api";

export default async function CalendarPage() {
  const trades = await getTrades();
  return (
    <div className="p-8">
      <CalendarView trades={trades} />
    </div>
  );
}
