import { Paper, Typography } from '@material-ui/core';
import React, { useEffect } from 'react'
import './ChatFriendComponent.css';

const ChatFriendComponent = ({user, setSelectedFriend}) => {
    
    return (
        <div onClick={() => setSelectedFriend(user)}className='friend'>
        <div style={{ display: "flex", flexDirection: 'row' }}>
        <div style={{ display: 'flex', flexDirection: 'row', width:'100%', paddingLeft:'10px'}}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="chat-avatar">
                <img
                className='chat-avatar__image' src={user.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} alt='avatar'/>
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '10px' }}>
        <Typography style={{marginBottom: '0'}} color="textSecondary" gutterBottom>
            {user.username}
        </Typography>
        </div>
        <div style={{flexGrow: '1'}}>

        </div>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent:'center', marginRight: '10px'}}>
            <div className='chat-avatar__status' style={{backgroundColor: (!user.online? 'grey' : 'green')}}></div>
        </div>
        </div>
    </div>
</div>
    )
}

export default ChatFriendComponent
