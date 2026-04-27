import { useEffect, useState } from "react";
import { getMyBookings } from "../services/bookingService";

export default function MyBookings() {

  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const res = await getMyBookings(102);
    setBookings(res.data);
  };

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.map((b) => (
        <div key={b.id} style={{border:"1px solid gray", margin:"10px", padding:"10px"}}>
          <p>{b.purpose}</p>
          <p>{b.date} | {b.startTime} - {b.endTime}</p>
          <p>Status: <b>{b.status}</b></p>
        </div>
      ))}
    </div>
  );
}