import axios from 'axios'
import { toast } from "react-toastify";

axios.defaults.baseURL = "http://167.99.141.123:3001";
// axios.defaults.baseURL = "http://localhost:3001";

axios.interceptors.request.use(
    (config) => {
        const token = window.localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        toast.error(error.response);
        return Promise.reject(error);
    }
);

axios.interceptors.response.use(undefined, (error) => {


    if (!error.response) {
        toast.error('Network error');
    }

    toast.error(error.response);
    throw error.response;
});

const request = {
    get: async (url, body = {}) => await axios.get(url, body),
    post: async (url, body = {}) => await axios.post(url, body),
    del: async (url) => await axios.delete(url)
}

export const User = {
    login: async (user) => await request.post('/login', user),
    register: async (user) => await request.post('/register', user),
    search: async (user) => await request.post('/search', user),
    currentUser: async () => await request.get('/getcurrentuser'),
    changeProfilePicture: async (formData) => await request.post('/profile/edit/upload', formData),
    changeProfileValues: async (data) => await request.post('/profile/edit', data),
    getNewsfeed: async () => await request.get('/profile/feed'),
    addFriend: async (actions, id) => await request.post(`/users/${id}`, actions),
    cancelFriendRequest: async (actions, id) => await request.post(`/users/${id}`, actions),
    acceptFriendRequest: async (actions, id) => await request.post(`/users/${id}`, actions),
    declineFriendRequest: async (actions, id) => await request.post(`/users/${id}`, actions),
    getFriends: async () => await request.get(`/profile/friends`),
    getFriendRequests: async () => await request.get('/users'),
    getProfileInfo: async (id) => await request.get(`/users/${id}`),
    getProfilePost: async (id) => await request.get(`/users/${id}/posts`),
    createRoom: async (username) => await request.post(`/chat/create/${username}`, {}),
    getMessages: async (id) => await request.get(`/chat/${id}`),
    sendMessage: async (id, message) => await request.post(`/chat/${id}`, { message }),
    sendComment: async (post_id, text) => await request.post(`/profile/post/${post_id}/comment`, { text }),
    like: async (post_id, like_type) => await request.post(`/profile/post/${post_id}/like`, { like_type }),
    post: async (formData) => await request.post(`/profile/post`, formData),

}