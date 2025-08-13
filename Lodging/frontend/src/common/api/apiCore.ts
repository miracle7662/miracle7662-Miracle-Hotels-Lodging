import jwtDecode from 'jwt-decode'
import axios from 'axios'
import config from '@/config'

// Get base URL from environment
const API_BASE_URL = 'http://localhost:3001/api';

// content type
axios.defaults.headers.post['Content-Type'] = 'application/json'
axios.defaults.baseURL = API_BASE_URL

// intercepting to capture errors
axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    let message

    if (error && error.response && error.response.status === 404) {
      // Do nothing here intentionally, as 404 errors are expected in certain cases.
    } else if (error && error.response && error.response.status === 403) {
      window.location.href = '/access-denied'
    } else {
      switch (error.response.status) {
        case 401:
          message = 'Invalid credentials'
          break
        case 403:
          message = 'Access Forbidden'
          break
        case 404:
          message = 'Sorry! the data you are looking for could not be found'
          break
        default: {
          message =
            error.response && error.response.data
              ? error.response.data['error'] || error.response.data['message']
              : error.message || error
        }
      }
      // Return the full error object instead of just the message
      return Promise.reject(error)
    }
  },
)

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('🔍 axios.interceptors.request - URL:', config.url);
    console.log('🔍 axios.interceptors.request - Method:', config.method);
    console.log('🔍 axios.interceptors.request - Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('🔍 axios.interceptors.request - Error:', error);
    return Promise.reject(error);
  }
);

const AUTH_SESSION_KEY = 'user'

const setAuthorization = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    console.log('Authorization header set to:', 'Bearer ' + token.substring(0, 20) + '...')
  } else {
    delete axios.defaults.headers.common['Authorization']
    console.log('Authorization header removed')
  }
}

// Function to refresh authorization header from localStorage
const refreshAuthorization = () => {
  const token = localStorage.getItem('authToken')
  console.log('🔍 refreshAuthorization - Token found:', !!token)
  if (token) {
    console.log('🔍 refreshAuthorization - Token preview:', token.substring(0, 20) + '...')
    
    // Check if token is expired
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      console.log('🔍 refreshAuthorization - Token expiration check:', {
        tokenExp: decoded.exp,
        currentTime: currentTime,
        isExpired: decoded.exp < currentTime
      });
      
      if (decoded.exp < currentTime) {
        console.warn('🔍 refreshAuthorization - Token is expired!');
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        return null;
      }
    } catch (error) {
      console.error('🔍 refreshAuthorization - Error decoding token:', error);
      localStorage.removeItem('authToken');
      delete axios.defaults.headers.common['Authorization'];
      return null;
    }
  }
  setAuthorization(token)
  return token
}

const getUserFromSession = () => {
  // First try sessionStorage
  const sessionUser = sessionStorage.getItem(AUTH_SESSION_KEY)
  console.log('getUserFromSession - sessionStorage data:', sessionUser);
  
  if (sessionUser) {
    try {
      const parsedUser = typeof sessionUser == 'object' ? sessionUser : JSON.parse(sessionUser);
      console.log('getUserFromSession - parsed sessionStorage user data:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('getUserFromSession - error parsing sessionStorage user data:', error);
    }
  }
  
  // If not found in sessionStorage, try localStorage (AuthContext)
  const localUser = localStorage.getItem('WINDOW_AUTH_SESSION')
  console.log('getUserFromSession - localStorage data:', localUser);
  
  if (localUser) {
    try {
      const parsedUser = JSON.parse(localUser);
      console.log('getUserFromSession - parsed localStorage user data:', parsedUser);
      return parsedUser;
    } catch (error) {
      console.error('getUserFromSession - error parsing localStorage user data:', error);
    }
  }
  
  console.log('getUserFromSession - no user data found in either storage');
  return null;
}

class APICore {
  get = (url: string, params: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    
    let response
    if (params) {
      const queryString = params
        ? Object.keys(params)
            .map((key) => key + '=' + params[key])
            .join('&')
        : ''
      response = axios.get(`${url}?${queryString}`, params)
    } else {
      response = axios.get(`${url}`, params)
    }
    return response
  }

  getFile = (url: string, params: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    
    let response
    if (params) {
      const queryString = params
        ? Object.keys(params)
            .map((key) => key + '=' + params[key])
            .join('&')
        : ''
      response = axios.get(`${url}?${queryString}`, { responseType: 'blob' })
    } else {
      response = axios.get(`${url}`, { responseType: 'blob' })
    }
    return response
  }

  getMultiple = (urls: string, params: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    
    const reqs = []
    let queryString = ''
    if (params) {
      queryString = params
        ? Object.keys(params)
            .map((key) => key + '=' + params[key])
            .join('&')
        : ''
    }

    for (const url of urls) {
      reqs.push(axios.get(`${url}?${queryString}`))
    }
    return axios.all(reqs)
  }

  create = (url: string, data: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    
    console.log('🔍 APICore.create - URL:', url);
    console.log('🔍 APICore.create - Data:', data);
    console.log('🔍 APICore.create - Authorization header:', axios.defaults.headers.common['Authorization']);
    
    return axios.post(url, data)
  }
  
  updatePatch = (url: string, data: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    return axios.patch(url, data)
  }
  
  update = (url: string, data: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    return axios.put(url, data)
  }
  
  delete = (url: string) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    return axios.delete(url)
  }
  
  createWithFile = (url: string, data: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    
    const formData = new FormData()
    for (const k in data) {
      formData.append(k, data[k])
    }

    const config: any = {
      headers: {
        ...axios.defaults.headers,
        'content-type': 'multipart/form-data',
      },
    }
    return axios.post(url, formData, config)
  }

  updateWithFile = (url: string, data: any) => {
    // Ensure authorization header is set before making request
    refreshAuthorization()
    
    const formData = new FormData()
    for (const k in data) {
      formData.append(k, data[k])
    }

    const config: any = {
      headers: {
        ...axios.defaults.headers,
        'content-type': 'multipart/form-data',
      },
    }
    return axios.patch(url, formData, config)
  }

  isUserAuthenticated = () => {
    const user = this.getLoggedInUser()

    if (!user || (user && !user.token)) {
      return false
    }
    const decoded: any = jwtDecode(user.token)
    const currentTime = Date.now() / 1000
    if (decoded.exp < currentTime) {
      console.warn('access token expired')
      return false
    } else {
      return true
    }
  }

  setLoggedInUser = (session: any) => {
    if (session) sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
    else {
      sessionStorage.removeItem(AUTH_SESSION_KEY)
    }
  }

  getLoggedInUser = () => {
    return getUserFromSession()
  }

  setUserInSession = (modifiedUser: any) => {
    const userInfo = sessionStorage.getItem(AUTH_SESSION_KEY)
    if (userInfo) {
      const { token, user } = JSON.parse(userInfo)
      this.setLoggedInUser({ token, ...user, ...modifiedUser })
    }
  }
}

// Set authorization header from localStorage token
const token = localStorage.getItem('authToken')
console.log('APICore initialization - authToken from localStorage:', token ? 'Token found' : 'No token found')
if (token) {
  setAuthorization(token)
  console.log('Authorization header set successfully')
} else {
  console.log('No authToken found in localStorage')
}

// Create and export an instance of APICore
const apiCore = new APICore()

export { APICore, apiCore, setAuthorization, refreshAuthorization }