import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { RootStoreContext } from '../../stores/rootStore';
import './ProfilePage.css';
import { User } from "../../api/agent";
import { Button, ButtonGroup, makeStyles, Paper } from '@material-ui/core';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ChatIcon from '@material-ui/icons/Chat';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CancelIcon from '@material-ui/icons/Cancel';
import { Box, Typography } from '@material-ui/core';
import LoadingPage from '../Friends/FriendsLoading';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabContext from '@material-ui/lab/TabContext';
import TabList from '@material-ui/lab/TabList';
import TabPanel from '@material-ui/lab/TabPanel';
import AppBar from '@material-ui/core/AppBar';
import ProfilePhotos from './ProfilePhotos';
import FriendList from './FriendList';
import ProfilePosts from './ProfilePosts';

const ProfilePage = observer(({ match, history }) => {

    const rootStore = useContext(RootStoreContext);
    const { theme, user, friendList } = rootStore.userStore;

    const { setSelectedFriend, setOpenChat } = rootStore.userStore;

    const [value, setValue] = React.useState("1");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const useStyles = makeStyles((theme) => ({
        root: {
            flexGrow: 1,
            // backgroundColor: theme.palette.background.paper,
        },
        scroll: {
            '&::-webkit-scrollbar': {
                width: '0.4em'
            },
            '&::-webkit-scrollbar-track': {
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,.1)',

            }
        }
    }));
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        User.getProfileInfo(match.params.id).then(response => response.data)
            .then((user) => {
                setProfile(user);
                setLoading(false);
                setValue('1');
                //console.log(user);
            });
    }, [match])
    const classes = useStyles(theme);

    const [posts, setPosts] = useState([]);

    useEffect(() => {
        try {
            User.getProfilePost(match.params.id).then(response => response.data)
                .then((post) => {
                    setPosts(post);
                    //console.log(post);
                })
        } catch (e) {
            //console.log(e);
        }
    }, [match])


    if (loading) return (<div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
        <LoadingPage />
    </div>
    );

    return (
        <div className="main-container">
            <div className="left-container">

                <img style={{ height: '250px', maxWidth: '100%', borderRadius: '5%' }} alt='avatar' src={profile.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} />
                <h1>
                    {profile.first_name + " " + profile.last_name}
                </h1>
                {
                    profile.username !== user.username &&
                        profile.friendship_status === true ?
                        <Button style={{ width: '100%', marginBottom: '15px' }} variant="contained" color="primary"
                            startIcon={<ChatIcon />} onClick={() => {
                                setOpenChat(true);
                                const friend = friendList.filter(fr => fr.username === profile.username);
                                setSelectedFriend(friend[0]);
                            }}>
                            Send Message
                                </Button>
                        :
                        (profile.friend_request_status === 'send' ?
                            <Button style={{ width: '100%', marginBottom: '15px', display: 'none' }} variant="contained" color="default" startIcon={<PersonAddDisabledIcon />}>
                                Cancel request
                                    </Button>
                            : (
                                (profile.friend_request_status === 'none' ? <PersonAddIcon style={{ display: 'none' }} /> : (
                                    <ButtonGroup style={{ display: 'hidden' }}>
                                        <Button startIcon={<CheckCircleSharpIcon />} color="green">
                                            Accept
                                            </Button>

                                        <CancelIcon />
                                    </ButtonGroup>
                                ))
                            ))

                }


                <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '150px', marginBottom: "10px" }}>
                    <span>
                        {posts.length + " posts"}
                    </span>
                    <span>
                        {profile.friends.length + " friends"}
                    </span>
                </div>
                <div className={classes.scroll} style={{ height: '200px', overflowY: 'scroll' }}>
                    <p style={{ fontSize: '12px' }}>
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                    </p>
                </div>

            </div>
            <div className="right-container">

                <div className={classes.root}>
                    <TabContext value={value}>
                        <TabList onChange={handleChange} centered indicatorColor="primary" >
                            {/* <Tab label="Profile photos" value="1" /> */}
                            <Tab label="Posts" value="1" />
                            <Tab label="Friends" value="2" />
                        </TabList>
                        {/* <TabPanel value="1"><ProfilePhotos /></TabPanel> */}
                        <TabPanel value="1" style={{ width: '100%' }}><ProfilePosts posts={posts} history={history} user={user} /></TabPanel>
                        <TabPanel value="2" style={{ width: '80%', float: 'right' }}><FriendList friends={profile.friends} /></TabPanel>
                    </TabContext>
                </div>

            </div>
        </div>
    );
})

export default withRouter(ProfilePage);