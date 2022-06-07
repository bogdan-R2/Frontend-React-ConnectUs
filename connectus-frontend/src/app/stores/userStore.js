import { runInAction, makeAutoObservable } from 'mobx';
import { User } from "../api/agent";
import { toast } from "react-toastify";
import socket from '../socket/socket';


export class UserStore {
    rootStore;
    constructor(rootStore) {
        this.rootStore = rootStore;
        makeAutoObservable(this);
    }

    searchedUsers = []
    token = localStorage.getItem('token') || null;
    theme = localStorage.getItem('theme') || true;
    friendRequests = [];
    friendList = [];
    selectedFriend = null;
    openChat = false;
    messages = [];
    chatRoomId = null;
    setOpenChat = (value) => {
        runInAction(() => {
            this.openChat = value;
        })
    }

    setSelectedFriend = (friend) => {

        runInAction(() => {
            this.selectedFriend = friend;
            this.messages = [];
        });
        if (friend !== null) {
            this.getMessages(friend);
        }


    }

    getMessages = async (friend) => {
        const chat_room_id = await User.createRoom(friend.username).then(response => response.data.chat_room_id);
        const messages = await User.getMessages(chat_room_id).then(response => response.data);
        runInAction(() => {
            this.chatRoomId = chat_room_id;
            this.messages = messages;
        })
    }
    sendMessage = async (message) => {
        const response = await User.sendMessage(this.chatRoomId, message).then(response => response.data);
        //console.log(response);
        runInAction(() => {
            this.messages = [...this.messages, { ...response, user_id: this.user.user_id }]
            //console.log(this.messages);
        });
        socket.emit('send_message', {
            user: this.user,
            secondUser: this.selectedFriend.username,
            message: message,
            sent: response.sent
        })
        // this.messages.push({message, user_id: this.user.user_id});
    }

    addMessageToList = async (username, message, timestamp) => {
        if (!this.selectedFriend || !(username === this.selectedFriend.username)) {
            toast.info(`${username} has sent you a message`);
        }
        else {
            if (this.selectedFriend.username === username) {

                runInAction(() => {
                    this.messages = [...this.messages, {
                        user_id: this.selectedFriend.user_id,
                        msg: message,
                        sent: timestamp
                    }]
                });
            }
        }
    }
    switchTheme = () => {
        runInAction(() => {
            if (this.theme === 'light') {
                this.theme = 'dark';
            } else {
                this.theme = 'light';
            }
            localStorage.setItem('theme', this.theme);
        });
    }

    user = null;

    editProfilePicture = async (formValues, history) => {
        try {
            const response = await User.changeProfilePicture(formValues).then(response => response);
            runInAction(() => {
                this.user.avatar = response.data.message;
            })
        } catch (e) {
            console.log(e);
        }
    }

    editProfileValues = async (data, history) => {
        try {
            const response = await User.changeProfileValues(data).then(response => response);
           // console.log(response);
            runInAction(() => {
                this.user.first_name = response.data.first_name;
                this.user.last_name = response.data.last_name;
                this.user.email = response.data.email;
            })
        } catch (e) {
            console.log(e);
        }
    }


    loginLoading = false;
    setLoginloading = (value) => {
        runInAction(() => {
            this.loginLoading = value;
        });
    }

    login = async (formValues, history) => {
        try {
            const response = await User.login(formValues).then(
                response => response
            ).catch((e) => {
                if (e.data.message) {
                    toast.error(e.data.message);
                } else if (e.data.errors) {
                    e.data.errors.forEach(elem => toast.error(`${elem.param} : ${elem.msg}`))
                }
                runInAction(() => {
                    this.loginLoading = false;
                })
            });
            if (!response) {
                return;
            }
            const { token } = response.data;
            runInAction(() => {
                this.loginLoading = false;
                localStorage.setItem('token', token);
                history.push('/');
                this.getCurrentUser(history);
            });
            toast.success('Login successfully');
        } catch (e) {
           // console.log(e);
            if (e.response) {
                toast.error(e.response.data);
            }

        }
    }

    register = async (formValues, history) => {
        try {
            const response = await User.register(formValues).then(
                response => response
            ).catch((e) => {
                if (e.data.message) {
                    toast.error(e.data.message);
                } else if (e.data.errors) {
                    //to be done
                    e.data.errors.forEach(elem => toast.error(`${elem.param} : ${elem.msg}`))
                }
            });
            if (!response) {
                return;
            }
            const { token } = response.data;
            runInAction(() => {
                localStorage.setItem('token', token);
                history.push('/');
                this.getCurrentUser(history);
            });
            toast.success('Registered successfully');
        } catch (e) {
            toast.error(e.response.data);
        }

    }

    getCurrentUser = async (history) => {
        if (!this.token) {
            history.push('/login');
        }
        try {
            const response = await User.currentUser(this.token).then(response => response.data);
            runInAction(() => {
                this.user = response;
            });
        } catch (error) {
            if (error && error.data && error.data.error === 'Invalid token!') {
                toast.error('Sesion expired, please log again');
            }

            window.localStorage.removeItem('token');
            history.push('/login');
        }
    }

    logout = (history) => {
        runInAction(() => {
            this.user = null;
            socket.emit('logout');
            localStorage.removeItem('token');
            history.push('/login');
            window.location.reload();
        })
    }
    logoutfromBrowser = (history) => {
        runInAction(() => {
            this.user = null;
            localStorage.removeItem('token');
            history.push('/login');
        })
    }

    updateFriendStatus = (response) => {
        const valori = [];
        this.searchedUsers.forEach(u => {
            if (u.username === response.username_sendto) {
                valori.push({
                    username: response.username_sendto,
                    friend_request_status: response.friend_request_status,
                    friendship_status: response.friendship_status,
                    last_name: response.last_name,
                    first_name: response.first_name,
                    avatar: response.avatar
                });
            } else {
                valori.push(u);
            }
        });
        return valori;
    }

    addFriend = async (username, history) => {
        try {
            const response = await User.addFriend({ actions: 'friend_request' }, username)
                .then(response => response.data);

            runInAction(() => {
                this.searchedUsers = this.updateFriendStatus(response);
            });
            socket.emit('friend_request', {
                user: this.user,
                secondUser: response.username_sendto
            });
        } catch (e) {
            console.log(e);
        }
    }

    cancelFriendRequest = async (username, history) => {
        try {
            const response = await User.cancelFriendRequest({ actions: 'cancel_friend_request' }, username)
                .then(response => response.data);;
            runInAction(() => {
                this.searchedUsers = this.updateFriendStatus(response);
            })
            socket.emit('cancel_friend_request', {
                user: this.user,
                secondUser: response.username_sendto
            });
        } catch (e) {
            console.log(e);
        }
    }

    declineFriendRequest = async (username, history) => {
        try {
            const response = await User.declineFriendRequest({ actions: 'decline_friend_request' }, username)
                .then(response => response.data)
                .catch(eroare => console.log(eroare));

            console.log(response);
            runInAction(() => {
                this.searchedUsers = this.updateFriendStatus(response);
            });

            socket.emit('decline_friend_request', {
                user: this.user,
                secondUser: username
            });

            this.removeFriendRequest(username);
        } catch (e) {
            console.log(e);
        }
    }

    updateFriendList = async (response) => {
        const valori = [];
        this.friendList.forEach(u => {
            if (u.username === response.username_sendto) {
                valori.push({
                    username: response.username_sendto,
                    friend_request_status: response.friend_request_status,
                    friendship_status: response.friendship_status,
                    last_name: response.last_name,
                    first_name: response.first_name,
                    avatar: response.avatar
                });
            } else {
                valori.push(u);
            }
        });
        return valori;
    }

    acceptFriendRequest = async (username, history) => {
        try {
            const response = await User.acceptFriendRequest({ actions: 'accept_friend_request' }, username)
                .then(response => response.data);
            runInAction(() => {
                this.searchedUsers = this.updateFriendStatus(response);
                // this.friendList = this.updateFriendList(response);
                this.friendList.push(response);
                this.getFriends(history);
            })
            socket.emit('accept_friend_request', {
                user: this.user,
                secondUser: response.username_sendto
            });
            toast.info(`You are now friends with ${username}`);
            this.removeFriendRequest(username);
        } catch (e) {
            console.log(e);
        }
    }

    updateDeclineFriendRequest = (username) => {
        runInAction(() => {
            let valoriNoi = []
            this.searchedUsers.forEach(searchedUser => {
                if (!searchedUser.username === username) {
                    valoriNoi.push(searchedUser);
                } else {
                    valoriNoi.push({ ...searchedUser, friend_request_status: 'none', friendship_status: false });
                }
            })
            this.searchedUsers = valoriNoi;
        });
    }

    search = async (searchName, history) => {
        try {
            const response = await User.search(searchName).then(
                response => response.data
            ).catch((e) => {
                if (e.data.message) {
                    toast.error(e.data.message);
                }
            });
            //console.log(response);
            if (!response) {
                return;
            }

            runInAction(() => {
                //console.log(response);
                this.searchedUsers = response;
                history.push('/search');
            });

        } catch (e) {
            console.log(e);
            toast.error(e.response.data);
        }
    }
    setFriendList = (friends) => {
        runInAction(() => {
            this.friendList = friends;
        })
    }

    logoutUser = (username) => {
        runInAction(() => {
            var newFriendList = [];
            this.friendList.forEach(friend => {
                if (friend.username === username) {
                    newFriendList.push({ ...friend, online: false })
                } else {
                    newFriendList.push(friend);
                }
            });

            if (this.selectedFriend !== null && this.selectedFriend.username === username) {
                this.selectedFriend.online = false;
            }
            this.friendList = newFriendList;
        })
    }
    loginUser = (username) => {
        runInAction(() => {
            var newFriendList = [];
            this.friendList.forEach(friend => {
                if (friend.username === username) {
                    newFriendList.push({ ...friend, online: true })
                } else {
                    newFriendList.push(friend);
                }
            });
            if (this.selectedFriend !== null && this.selectedFriend.username === username) {
                this.selectedFriend.online = true;
            }
            this.friendList = newFriendList;
        })
    }

    getFriends = async (history) => {
        try {
            const response = await User.getFriends().then(
                response => response.data
            ).catch((e) => {
                if (e.data.message) {
                    toast.error(e.data.message);
                }
            });
            if (!response) {
                return;
            }
            runInAction(() => {
                this.friendList = response.map(user => ({
                    ...user,
                    online: false
                }));
                socket.emit('get_online_users', {
                    users: this.friendList
                })
            });

        } catch (e) {
            console.log(e);
        }
    }

    addFriendRequest = (user) => {
        runInAction(() => {
            this.friendRequests.push(user);
        });
    }

    removeFriendRequest = (username) => {
        runInAction(() => {
            var newRequestList = [];
            this.friendRequests.forEach(friend => {
                if (friend.username !== username) {
                    newRequestList.push(friend);
                }
            })
            this.friendRequests = newRequestList;
        })
    }

    addFriendToList = (friend) => {
        runInAction(() => {
            this.friendList.push(friend);
        })
    }

    getFriendRequests = async () => {
        try {
            const response = await User.getFriendRequests().then(response => response.data);

            //console.log(response);

            runInAction(() => {
                this.friendRequests = response;
            })
        } catch (e) {
            console.log(e);
        }
    }

    updateSearchUsers = (username, friendship_status, friend_request_status) => {
        runInAction(() => {
            var newSearchList = [];
            this.searchedUsers.forEach(user => {
                if (user.username === username) {
                    newSearchList.push({ ...user, friendship_status, friend_request_status });
                } else {
                    newSearchList.push(user);
                }
            })
            this.searchedUsers = newSearchList;
        })
    }


}
