import axios from 'axios';

const processQuery = async (query, code, scenario, sessionId, images = []) => {
    // console.log(images);    
    try {
        const payload = {
            query: query,
            code: code,
            scenario: scenario,
            images: images
        };
        if (sessionId) {
            payload.session_id = sessionId;
        }

        const response = await axios.post('http://localhost:8000/query', payload, {
            withCredentials: true,
        });
        return response;
    } catch (error) {
        console.error('Error processing query:', error);
        throw error;
    }
};
const getHistory = async (sessionId) => {
    try {
        const response = await axios.get(`http://localhost:8000/history/${sessionId}`);
        return response.data.history;
    } catch (error) {
        console.error('Error fetching history:', error);
        throw error;
    }
};

export { processQuery, getHistory };



//   const processQuery = async (query, code, scenario, sessionId) => {
//     try {
//         const response = await axios.post('http://localhost:8000/query', {
//             query,
//             code,
//             scenario,
//             session_id: sessionId
//         }, {
//             withCredentials: true  // Allow credentials
//         });
//         console.log(response.data);
//     } catch (error) {
//         console.error('Error processing query:', error);
//         throw error;
//     }
// };
// processQuery("Extract from book CBook and page number 583", "", "Extract From Book");