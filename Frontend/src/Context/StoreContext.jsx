import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from '@clerk/clerk-react'

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {

    const { getToken } = useAuth()
    const [colorTheme, setColorTheme] = useState('dark')
    const [whiteboards, setWhiteboards] = useState([])
    const url = 'https://taskmaster-3-4vk5.onrender.com/api'
    const [token, setToken] = useState()
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const generateToken = async () => {
        const token = getToken()
        setToken(token)
    }

    const fetchSavedWhiteboards = async () => {
        const token = await getToken()
        try {
            const response = await axios.get(url + '/whiteboard/list', { headers: { token } });
            if (response.data.success) {
                console.log(response)
                setWhiteboards(response.data.whiteboards)
            }
        } catch (error) {
            console.error('Error fetching whiteboards:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchSavedWhiteboards()
    }, [token])

    const contextValue = {
        url,
        colorTheme,
        setColorTheme,
        whiteboards,
        setWhiteboards,
        isAuthenticated,
        setIsAuthenticated,
        refreshWhiteboards: () => { fetchSavedWhiteboards() }
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
