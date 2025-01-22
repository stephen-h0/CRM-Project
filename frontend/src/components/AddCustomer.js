import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: ''
  });
  const [error, setError] = useState(null);

  const handleSave = async () => {
    try {
      const url = `${BASE_URL}/customers`;
      console.log('Saving new customer data to:', url); // Debugging log
      console.log('Customer data being saved:', customer); // Debugging log
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customer),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add customer');
      }
      console.log('Customer added successfully'); // Debugging log
      navigate('/');
    } catch (error) {
      console.error('Error adding customer:', error); // Debugging log
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Add New Customer</h1>
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
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default AddCustomer;