import axios from 'axios';

const axiosInstance = axios.create({
  socketPath: '/var/run/docker.sock'
});

export default axiosInstance.request;
