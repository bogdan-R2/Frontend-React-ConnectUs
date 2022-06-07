import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { IconButton, Paper, Tooltip } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import AddIcon from '@material-ui/icons/Add';
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled';
import { RootStoreContext } from '../../stores/rootStore';
import { withRouter } from 'react-router';

const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  title: {
    marginBottom: 0
  }
});

const useStylesBootstrap = makeStyles((theme) => ({
  arrow: {
    color: theme.palette.common.black,
  },
  tooltip: {
    backgroundColor: theme.palette.common.black,
  },
}));

function BootstrapTooltip(props) {
  const classes = useStylesBootstrap();

  return <Tooltip arrow classes={classes} {...props} />;
}

const UsersCard = ({ user, history, location }) => {
  const classes = useStyles();
  const [value, setValue] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('/');

  
  const rootStore = useContext(RootStoreContext);
  const {setSelectedFriend, setOpenChat} = rootStore.userStore;
  const {addFriend, cancelFriendRequest, acceptFriendRequest} = rootStore.userStore;

  const Status = (status) => {
    switch (status) {

      case "none": return <PersonAddIcon fontSize="large" style={{ color: '#104080' }} />
      case "send": return <PersonAddDisabledIcon fontSize="large" style={{color: 'grey'}}/>;
      case "receive": return <AddIcon fontSize="large" style={{ color: 'green' }} />;

      default: return <h1>No project match</h1>
    }
  }

  useEffect(() => {
    setSelectedRoute(location.pathname);
  }, [location])

  const onSubmit = () => {
    
    if(user.friend_request_status === 'none') {
      addFriend(user.username, history);
    } else if (user.friend_request_status === 'receive') {
      acceptFriendRequest(user.username, history);
    } else if (user.friend_request_status === 'send') {
      cancelFriendRequest(user.username, history);
    }
    if(user.friendship_status) {
      setOpenChat(true);
      setSelectedFriend(user);
    }
  } 

  useEffect(() => {
    if(user.friendship_status) {
      setValue('Send Message');
      return;
    }
    if(user.friend_request_status === 'none') {

      setValue('Add friend');
      return;
    }

    if(user.friend_request_status === 'send') {
      setValue('Cancel Friend Request');
      return;
    }

    if(user.friend_request_status === 'receive') {
      setValue('Accept Friend Request');
      return;
    }
    
  }, [user.friend_request_status, user.friendship_status])

  return (
    <Paper style={{ margin: '10px' }} elevation={2}>
      <div style={{ display: "flex", flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '20px', cursor: 'pointer' }}>
            <Avatar onClick={() => history.push(`/profile/${user.username}`)} selected={selectedRoute === `/profile/${user.username}`}
            alt={user.first_name + " " + user.last_name} src={user.avatar || ''} className={classes.avatar_large} >
              {(user.first_name[0] + user.last_name[0]).toUpperCase()}
            </Avatar>
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding:'0 10px 0 0' }}>
          <BootstrapTooltip title={value} placement='bottom' >
            <IconButton style={{margin: '0', padding: '1px'}} onClick={onSubmit}>

              {user.friendship_status && <ChatIcon fontSize="large" style={{ color: '#104080' }} />}
              {!user.friendship_status &&
                Status(user.friend_request_status)}
            </IconButton>
          </BootstrapTooltip>
        </div>
      </div>
    </Paper>
  );
}

export default withRouter(UsersCard);