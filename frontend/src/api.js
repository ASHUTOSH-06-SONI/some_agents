import axios from 'axios';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const submitRequest = async (data) => { ... }
export const submitRequest = async (data) => {
    const response = await axios.post(`${API_URL}/request`, data);
    return response.data;
};

export const checkStatus = async (requestId) => {
    const response = await axios.get(`${API_URL}/request/${requestId}`);
    return response.data;
};

export const updateLogistics = async (data) => {
    const response = await axios.post(`${API_URL}/delivery/update`, data);
    return response.data;
};

export const updateRepair = async (data) => {
    const response = await axios.post(`${API_URL}/repair/update`, data);
    return response.data;
};
