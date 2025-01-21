const BASE_URL = "http://localhost:3000"; // Replace with your backend URL if hosted elsewhere

export const getCustomers = async () => {
    try {
        const response = await fetch(`${BASE_URL}/customers`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        return [];
    }
};

import React, { useEffect, useState } from "react";
import { getCustomers } from "./api";

const App = () => {
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCustomers();
            setCustomers(data);
        };
        fetchData();
    }, []);

    return (
        <div>
            <h1>Customer List</h1>
            {customers.length > 0 ? (
                <ul>
                    {customers.map((customer) => (
                        <li key={customer.id}>{customer.name}</li>
                    ))}
                </ul>
            ) : (
                <p>No customers found.</p>
            )}
        </div>
    );
};

export default App;
