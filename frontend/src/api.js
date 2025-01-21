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
