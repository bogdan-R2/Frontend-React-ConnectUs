import { Button, ButtonGroup, Icon, IconButton } from '@material-ui/core';
import React, { useContext } from 'react';
import './NotificationCard.css';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';
import CancelIcon from '@material-ui/icons/Cancel';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '../../stores/rootStore';
import { withRouter } from 'react-router';


const NotificationCard = observer(({friend: user, history}) => {

    const rootStore = useContext(RootStoreContext);
    const {acceptFriendRequest, declineFriendRequest} = rootStore.userStore;
    return (
        <div style={{width: '100%', height: '80px', display:'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft:'10px', paddingRight:'10px' }}>
            <div style={{display: 'flex'}}>
                <div className="c-avatar">
                    <img className='avatar_image' src={user.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} alt='avatar'/>
                </div>
                <div style={{flexGrow: 1,display:'flex', flexDirection: 'column', justifyContent: 'center', fontSize: '14px', paddingLeft:'15px', paddingRight: '5px'}}>
                    <strong>{user.username}</strong> has sent you a friend request
                </div>
                <div style={{ display:'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{display: 'flex'}}>
                    <IconButton style={{padding: '0px'}} onClick={() => acceptFriendRequest(user.username, history)}>
                            <CheckCircleSharpIcon  className="accept-icon" />
                        </IconButton>
                        <IconButton style={{padding: '0px'}} onClick={() => declineFriendRequest(user.username, history)}>
                            <CancelIcon className="decline-icon"/>
                        </IconButton>
                    </div>
                </div>
            </div>
            
        </div>
    )
});

export default withRouter(NotificationCard)
