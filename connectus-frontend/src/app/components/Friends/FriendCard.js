import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { IconButton, Paper, Tooltip } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
//import { RootStoreContext } from '../../stores/rootStore';
import { withRouter } from 'react-router';
import './FriendCard.css'
import { RootStoreContext } from '../../stores/rootStore';
const useStyles = makeStyles({
    root: {
        minWidth: 275,
    },
    title: {
        marginBottom: 0
    }
});

const FriendCard = ({ user, history, location }) => {
    const classes = useStyles();

    const rootStore = useContext(RootStoreContext);
    const {setSelectedFriend, setOpenChat} = rootStore.userStore;

    const [selectedRoute, setSelectedRoute] = useState('/');

    useEffect(() => {
        setSelectedRoute(location.pathname);
    }, [location])

    return (
        <Paper style={{ margin: '10px' }} elevation={2}>
            <div style={{ display: "flex", flexDirection: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '20px' }}>
                <div className="c-avatar">
                    <img onClick={() => history.push(`/profile/${user.username}`)} selected={selectedRoute === `/profile/${user.username}`}
                    className='c-avatar__image' src={user.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} alt='avatar'/>
                    <span className='c-avatar__status' style={{backgroundColor: (!user.online? 'grey' : 'green')}}></span>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography className={classes.title} color="textPrimary" gutterBottom>
                {user.first_name + " " + user.last_name}
            </Typography>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
                {user.username}
            </Typography>
            </div>
        </div>
        <div style={{ flexGrow: 1 }}>

        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Tooltip title='Send Message' placement='bottom'>
                <IconButton style={{margin: '0', padding: '0 10px 0 0'}} onClick={() => {
                    setOpenChat(true);
                    setSelectedFriend(user);
                }}>
                    <ChatIcon fontSize="large" style={{ color: '#104080' }} />
                </IconButton>
            </Tooltip>
        </div>
        </div>
    </Paper>
    );
}

export default withRouter(FriendCard);