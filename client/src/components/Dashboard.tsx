import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Define the shape of the booking data (adjust as needed)
interface Booking {
  id: string;
  name: string;
  date: string;
  // Add more fields as per your API response
}

const Dashboard: React.FC = () => {
  const { email } = useParams<{ email: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (email) {
      axios.get(`/api/booking/${email}`)
        .then(res => setBooking(res.data))
        .catch(err => console.error('Error fetching booking:', err));
    }
  }, [email]);

  return (
    <div>
      <h2>Dashboard</h2>
      {booking ? <pre>{JSON.stringify(booking, null, 2)}</pre> : 'Loading...'}
    </div>
  );
};

export default Dashboard;
