import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddCustomer = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    FirstName: '',
    LastName: '',
    Email: '',
    Phone: '',
    Address: '',
    City: '',
    State: '',
    PostalCode: '',
    Country: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add customer');
      }

      const result = await response.json();
      
      if (!result.CustomerID || !result.DateToJoin) {
        throw new Error('Invalid server response');
      }

      navigate('/');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-message">{error}</div>}
      <div>
        <input
          name="FirstName"
          value={formData.FirstName}
          onChange={handleChange}
          placeholder="First Name"
          required
        />
      </div>
      <div>
        <input
          name="LastName"
          value={formData.LastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
        />
      </div>
      <div>
        <input
          name="Email"
          type="email"
          value={formData.Email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
      </div>
      <div>
        <input
          name="Phone"
          value={formData.Phone}
          onChange={handleChange}
          placeholder="Phone"
          required
        />
      </div>
      <div>
        <input
          name="Address"
          value={formData.Address}
          onChange={handleChange}
          placeholder="Address"
        />
      </div>
      <div>
        <input
          name="City"
          value={formData.City}
          onChange={handleChange}
          placeholder="City"
        />
      </div>
      <div>
        <input
          name="State"
          value={formData.State}
          onChange={handleChange}
          placeholder="State"
        />
      </div>
      <div>
        <input
          name="PostalCode"
          value={formData.PostalCode}
          onChange={handleChange}
          placeholder="Postal Code"
        />
      </div>
      <div>
        <input
          name="Country"
          value={formData.Country}
          onChange={handleChange}
          placeholder="Country"
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Customer'}
      </button>
    </form>
  );
};

export default AddCustomer;