import React, { useState, useEffect } from "react";
import { CSVLink } from "react-csv";

// Define the backend URL
const BASE_URL = "http://localhost:3000"; // Adjust if hosted elsewhere

// Function to fetch customers from backend
const getCustomers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/customers`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Parse JSON data from response
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return []; // Return empty array in case of error
  }
};

// Function to add a new customer to the backend
const addCustomer = async (newCustomer) => {
  try {
    const response = await fetch(`${BASE_URL}/customers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCustomer),
    });
    if (!response.ok) {
      throw new Error("Failed to add customer");
    }
    return response.json(); // Return the new customer data
  } catch (error) {
    console.error("Error adding customer:", error);
  }
};

// Function to edit an existing customer
const editCustomer = async (id, updatedCustomer) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCustomer),
    });
    if (!response.ok) {
      throw new Error("Failed to update customer");
    }
    return response.json();
  } catch (error) {
    console.error("Error updating customer:", error);
  }
};

// Function to delete a customer
const deleteCustomer = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete customer");
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

const App = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10); // Default page size 10
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCustomers();
      setCustomers(data);
    };
    fetchData();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.FirstName || ""} ${customer.LastName || ""}`;
    return fullName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle pagination
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Change the page size
  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page when page size changes
  };

  // Handle adding new customer
  const handleAddCustomer = async (newCustomer) => {
    const addedCustomer = await addCustomer(newCustomer);
    setCustomers([...customers, addedCustomer]);
  };

  // Handle editing a customer
  const handleEditCustomer = async (id, updatedCustomer) => {
    const updated = await editCustomer(id, updatedCustomer);
    setCustomers(
      customers.map((customer) =>
        customer.CustomerID === id ? updated : customer
      )
    );
  };

  // Handle deleting a customer
  const handleDeleteCustomer = async (id) => {
    await deleteCustomer(id);
    setCustomers(customers.filter((customer) => customer.CustomerID !== id));
  };

  return (
    <div>
      <h1>Customer List</h1>

      {/* Search box */}
      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Display customer list */}
      <ul>
        {currentCustomers.map((customer) => (
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
        <span>Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>

      {/* Page size select */}
      <select value={pageSize} onChange={handlePageSizeChange}>
        <option value={10}>10 per page</option>
        <option value={20}>20 per page</option>
        <option value={50}>50 per page</option>
      </select>

      {/* Export to CSV */}
      <CSVLink data={filteredCustomers} filename={"customers.csv"}>
        Export to CSV
      </CSVLink>

      {/* Add customer button */}
      <button onClick={() => handleAddCustomer({ FirstName: "John", LastName: "Doe", Email: "john.doe@example.com", Phone: "123456789" })}>
        Add Customer
      </button>
    </div>
  );
};

export default App;
