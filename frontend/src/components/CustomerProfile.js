import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const url = `${BASE_URL}/customers/${id}`;
        console.log('Fetching customer data from:', url); // Debugging log
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched customer data:', data); // Debugging log
        setCustomer(data);
      } catch (error) {
        console.error('Error fetching customer:', error); // Debugging log
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomer();
  }, [id]);

  const handleSave = async () => {
    try {
      const url = `${BASE_URL}/customers/${id}`;
      console.log('Saving customer data to:', url); // Debugging log
      console.log('Customer data being saved:', customer); // Debugging log
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update customer');
      }
      console.log('Customer updated successfully'); // Debugging log
      navigate('/');
    } catch (error) {
      console.error('Error updating customer:', error); // Debugging log
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  if (!customer) return <div>No customer data available</div>; // Check if customer is null

  return (
    <div>
      <h1>Edit Customer Profile</h1>
      <form>
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={customer.FirstName}
          onChange={(e) => setCustomer({ ...customer, FirstName: e.target.value })}
        />
        <br />
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={customer.LastName}
          onChange={(e) => setCustomer({ ...customer, LastName: e.target.value })}
        />
        <br />
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={customer.Email}
          onChange={(e) => setCustomer({ ...customer, Email: e.target.value })}
        />
        <br />
        <label htmlFor="phone">Phone:</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={customer.Phone}
          onChange={(e) => setCustomer({ ...customer, Phone: e.target.value })}
        />
        <br />
        <button type="button" onClick={handleSave}>Save</button>
      </form>
    </div>
  );
};

export default CustomerProfile;