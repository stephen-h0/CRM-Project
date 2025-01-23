import React, { useState, useEffect, useRef } from 'react';
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
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const loadCustomers = async () => {
    const data = await fetchCustomers(searchTerm, currentPage, pageSize);
    setCustomers(data);
    setTotalPages(Math.ceil(data.length / pageSize));
  };

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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      setUploadStatus('No file selected');
      return;
    }
  
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('Please select a CSV file');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      setUploadStatus('Uploading...');
      const response = await fetch(`${BASE_URL}/customers/upload`, {
        method: 'POST',
        body: formData
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }
  
      setUploadStatus(`Successfully uploaded ${result.inserted} customers`);
      await loadCustomers(); // Use await here
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm, currentPage, pageSize]);

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
                <div>
                  <strong>ID:</strong> {customer.CustomerID} |
                  <strong>Join Date:</strong> {customer.DateToJoin} |
                  <strong>Name:</strong> {customer.FirstName} {customer.LastName} |
                  <strong>Email:</strong> {customer.Email} |
                  <strong>Phone:</strong> {customer.Phone} |
                  <strong>Address:</strong> {customer.Address}, {customer.City}, {customer.State} {customer.PostalCode}, {customer.Country}
                </div>
                <div>
                  <button onClick={() => handleEditCustomer(customer.CustomerID)}>Edit</button>
                  <button onClick={() => handleDeleteCustomer(customer.CustomerID)}>Delete</button>
                </div>
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
              { label: "Customer ID", key: "CustomerID" },
              { label: "Join Date", key: "DateToJoin" },
              { label: "First Name", key: "FirstName" },
              { label: "Last Name", key: "LastName" },
              { label: "Email", key: "Email" },
              { label: "Phone", key: "Phone" },
              { label: "Address", key: "Address" },
              { label: "City", key: "City" },
              { label: "State", key: "State" },
              { label: "Postal Code", key: "PostalCode" },
              { label: "Country", key: "Country" }
            ]}
            filename="customers.csv"
          >
            Export to CSV
          </CSVLink>

          {/* Add CSV upload button */}
          <div className="upload-section">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="upload-button"
            >
              Upload CSV
            </button>
            {uploadStatus && (
              <div className="upload-status">
                {uploadStatus}
              </div>
            )}
          </div>

          {/* Add Customer */}
          <button onClick={handleAddCustomer}>Add Customer</button>
        </div>
      } />
    </Routes>
  );
};

export default App;