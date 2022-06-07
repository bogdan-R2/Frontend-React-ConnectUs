import React, { useContext, useEffect, useState } from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom';
import Login from './app/components/Login/Login.js';
import Register from './app/components/Register/Register.js';
import { toast, ToastContainer } from "react-toastify";
import { createMuiTheme, makeStyles } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import { observer } from "mobx-react-lite";
import { RootStoreContext } from "./app/stores/rootStore";
import PrivateRoute from "./app/Routes/PrivateRoute.js";
import Navbar from "./app/components/nav/Navbar";
import Dashboard from "./app/components/Dashboard/Dashboard";
import { ThemeProvider } from "@material-ui/styles";
import Sidebar from './app/components/nav/Sidebar.js'
import SearchUsers from './app/components/SearchUsers/SearchUsers.js';
import Account from './app/components/Account/Account.js';
import FriendList from './app/components/Friends/FriendList.js';
import socket from './app/socket/socket.js';
import MultipleConnections from './app/components/MultipleConnections/MultipleConnections.js';
import ProfilePage from './app/components/profile/ProfilePage.js';
import ChatComponent from './app/components/Chat/ChatComponent.js';
import Post from './app/components/Postari/Post.js';

export const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
        backgroundColor: '#F0F2F5'
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },

}));



const App = observer(({ history }) => {


    const rootStore = useContext(RootStoreContext);
    const [loading, setLoading] = useState(true);
    const { token, getFriendRequests, setFriendList, loginUser, logoutUser, addFriend, addFriendToList, updateSearchUsers, updateDeclineFriendRequest, addMessageToList } = rootStore.userStore;
    const { theme, getCurrentUser, addFriendRequest, removeFriendRequest, user, logoutfromBrowser, getFriends } = rootStore.userStore;
    const [multipleConnections, setMultipleConnections] = useState(false);
    const nightMode = createMuiTheme({
        palette: {
            type: theme === 'dark' ? 'dark' : 'light'
        }
    })

    const classes = useStyles();

    useEffect(() => {
        if (multipleConnections === false) {
            getCurrentUser(history).then(() => setLoading(false)).catch(() => setLoading(false));
            getFriendRequests();
        }

    }, [token,
        getCurrentUser,
        history,
        getFriendRequests,
        multipleConnections]);

    useEffect(() => {
        if (user && loading === false) {
            socket.auth = { username: user.username }
            socket.connect();

            socket.on('friend_request', (user) => {
                toast.info(user.username + ' has sent you a friend request.');
                addFriendRequest(user);
                updateSearchUsers(user.username, false, "receive");
            });

            socket.on('cancel_friend_request', (user) => {
                removeFriendRequest(user.username);
                updateSearchUsers(user.username, false, "none");
            });

            socket.on('accept_friend_request', (user) => {
                toast.info(user.username + ' has accepted your friend request.');
                addFriendToList(user);
                updateSearchUsers(user.username, true, "none");
            });

            socket.on('decline_friend_request', (user) => {
                toast.info(user.username + ' has declined your friend request');
                updateDeclineFriendRequest(user.username);
            });

            socket.on('get_online_users', ({ users }) => {
                setFriendList(users);
            })

            socket.on('error_multiple_connections', (err) => {
                setMultipleConnections(true);
                //logoutfromBrowser(history);
            });

            socket.on('logout', ({ username }) => {
                logoutUser(username);
            });

            socket.on('login', ({ username }) => {
                loginUser(username);
            })

            socket.on('receive_message', ({ username, message, timestamp }) => {
                //console.log(username, message, timestamp);
                addMessageToList(username, message, timestamp);
            })
        }
    }, [user,
        addFriendToList,
        setFriendList,
        getFriendRequests,
        loading,
        logoutfromBrowser,
        history,
        getFriends,
        loginUser,
        logoutUser,
        addFriend,
        addFriendRequest,
        removeFriendRequest,
        updateSearchUsers,
        updateDeclineFriendRequest,
        addMessageToList
    ])

    if (multipleConnections) return <MultipleConnections />

    // if (loading) return <div className={classes.content}>
    //     <Spinner />
    // </div>

    return (
        <ThemeProvider theme={nightMode}>
            <div className="app">
                <ToastContainer position='bottom-left' />
                <div className={classes.root}>
                    {user && <Navbar />}
                    {user && <Sidebar />}
                    {user && <ChatComponent />}
                    <main className={classes.content}>
                        <div className={user ? classes.appBarSpacer : ''} />
                        <Container maxWidth={false} className={classes.container} style={{ padding: '0' }}>
                            <Switch>
                                <Route path="/register">
                                    {!user ?
                                        <Register />
                                        : <Redirect to={'/newsfeed'} />}
                                </Route>
                                <Route path="/login">
                                    {!user ?
                                        <Login />
                                        : <Redirect to={'/newsfeed'} />}
                                </Route>

                                {user &&
                                    <PrivateRoute exact path="/search" component={SearchUsers} />
                                }

                                {user &&
                                    <PrivateRoute exact path="/newsfeed" component={Dashboard} />
                                }
                                {user &&
                                    <PrivateRoute exact path="/profile/edit" component={Account} />
                                }
                                {user &&
                                    <PrivateRoute exact path="/profile/post" component={Post} />
                                }
                                {user &&
                                    <PrivateRoute exact path='/friends' component={FriendList} />}
                                {user &&
                                    <PrivateRoute exact path='/profile/:id' component={ProfilePage} />}
                                    {user && <Redirect to={'/newsfeed'} />}
                                {user && <Route>
                                    <div>not found</div>
                                </Route>}
                            </Switch>
                        </Container>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    )
});

export default withRouter(App);
