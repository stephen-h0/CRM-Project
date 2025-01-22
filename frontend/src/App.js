import React, { useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import CustomerProfile from './components/CustomerProfile';
import AddCustomer from './components/AddCustomer'; // Ensure this path is correct

const BASE_URL = 'http://localhost:3000';

// Function to fetch customers
const fetchCustomers = async (searchTerm, page, pageSize) => {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.append("q", searchTerm);
    params.append("page", page);
    params.append("pageSize", pageSize);

    const response = await fetch(`${BASE_URL}/customers?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return [];
  }
};

// Function to delete a customer
const deleteCustomer = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete customer");
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCustomers = async () => {
      const data = await fetchCustomers(searchTerm, currentPage, pageSize);
      setCustomers(data);
      setTotalPages(Math.ceil(data.length / pageSize));
    };
    loadCustomers();
  }, [searchTerm, currentPage, pageSize]);

  const handleAddCustomer = () => {
    navigate('/add-customer');
  };

  const handleEditCustomer = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleDeleteCustomer = async (id) => {
    await deleteCustomer(id);
    const data = await fetchCustomers(searchTerm, currentPage, pageSize);
    setCustomers(data);
  };

  return (
    <Routes>
      <Route path="/customers/:id" element={<CustomerProfile />} />
      <Route path="/add-customer" element={<AddCustomer />} />
      <Route path="/" element={
        <div>
          <h1>Customer Management</h1>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers"
          />
          <ul>
            {customers.map((customer) => (
              <li key={customer.CustomerID}>
                {`${customer.FirstName} ${customer.LastName}`} (
                {customer.Email}, {customer.Phone})
                <button onClick={() => handleEditCustomer(customer.CustomerID)}>
                  Edit
                </button>
                <button onClick={() => handleDeleteCustomer(customer.CustomerID)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>

          {/* Page Size Selector */}
          <select value={pageSize} onChange={(e) => setPageSize(+e.target.value)}>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* CSV Export */}
          <CSVLink
            data={customers}
            headers={[
              { label: "First Name", key: "FirstName" },
              { label: "Last Name", key: "LastName" },
              { label: "Email", key: "Email" },
              { label: "Phone", key: "Phone" },
              { label: "Customer ID", key: "CustomerID" },
            ]}
            filename="customers.csv"
          >
            Export to CSV
          </CSVLink>

          {/* Add Customer */}
          <button onClick={handleAddCustomer}>Add Customer</button>
        </div>
      } />
    </Routes>
  );
};

export default App;