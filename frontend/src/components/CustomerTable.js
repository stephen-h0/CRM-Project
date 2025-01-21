import React, { useEffect, useState } from 'react';
import api from '../services/api';

const CustomerTable = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    // Fetch customers from backend
    api.get('/customers')
      .then((response) => setCustomers(response.data))
      .catch((error) => console.error('Error fetching customers:', error));
  }, []);

  return (
    <div>
      <h1>Customer List</h1>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.firstName}</td>
              <td>{customer.lastName}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerTable;

