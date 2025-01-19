import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Set modal root

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState(''); // "add", "edit", "delete"
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page,
          limit,
          q: searchQuery,
        });
        const response = await fetch(`http://localhost:3000/customers?${queryParams.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(fetchCustomers, 300); // Debounce
    return () => clearTimeout(debounceTimeout); // Cleanup timeout
  }, [page, limit, searchQuery]);

  const openModal = (mode, customer = null) => {
    setModalMode(mode);
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleSearch = (e) => setSearchQuery(e.target.value);
  const handleLimitChange = (e) => setLimit(parseInt(e.target.value, 10));
  const handlePageChange = (newPage) => setPage(newPage);

  const handleAddCustomer = async (newCustomer) => {
    try {
      const response = await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      });
      if (!response.ok) throw new Error('Failed to add customer');
      closeModal();
      setPage(1); // Refresh to show new customer
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEditCustomer = async (updatedCustomer) => {
    try {
      const response = await fetch(`http://localhost:3000/customers/${updatedCustomer.CustomerID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer),
      });
      if (!response.ok) throw new Error('Failed to update customer');
      closeModal();
      setPage(1); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      const response = await fetch(`http://localhost:3000/customers/${customerId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete customer');
      closeModal();
      setPage(1); // Refresh data
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Customer Management</h2>
      <div>
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <select value={limit} onChange={handleLimitChange}>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
        <button onClick={() => openModal('add')}>Add Customer</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.CustomerID}>
              <td>{customer.CustomerID}</td>
              <td>{customer.FirstName}</td>
              <td>{customer.LastName}</td>
              <td>{customer.Email}</td>
              <td>{customer.Phone}</td>
              <td>
                <button onClick={() => openModal('edit', customer)}>Edit</button>
                <button onClick={() => openModal('delete', customer)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <button onClick={() => handlePageChange(page + 1)}>Next</button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Customer Modal"
      >
        {modalMode === 'add' && (
          <div>
            <h2>Add Customer</h2>
            {/* Add customer form */}
            <button onClick={() => handleAddCustomer({ /* Add customer details */ })}>
              Save
            </button>
          </div>
        )}
        {modalMode === 'edit' && selectedCustomer && (
          <div>
            <h2>Edit Customer</h2>
            {/* Edit customer form */}
            <button onClick={() => handleEditCustomer({ ...selectedCustomer, /* Changes */ })}>
              Save
            </button>
          </div>
        )}
        {modalMode === 'delete' && selectedCustomer && (
          <div>
            <h2>Delete Customer</h2>
            <p>Are you sure you want to delete {selectedCustomer.FirstName}?</p>
            <button onClick={() => handleDeleteCustomer(selectedCustomer.CustomerID)}>
              Confirm
            </button>
            <button onClick={closeModal}>Cancel</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Customers;
