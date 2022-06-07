import React, { useState } from 'react'
import './FriendList.css'
import { withRouter } from 'react-router-dom';
import UsersCard from '../SearchUsers/UsersCard';
const FriendList = ({ friends, history }) => {

  return (
    <div className="friends-container" >
      {
        friends.map(friend => (
          <div key={friend.username} onClick={() => history.push(`/profile/${friend.username}`)}
            style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
              <div style={{ justifyContent: 'center', display: 'flex' }}>
                <img style={{ height: '100px', width: '100px', borderRadius: '5%' }}
                  src={friend.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} />
              </div>
              <div>
                <span>
                  {friend.first_name + " " + friend.last_name}
                </span>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  )
}

export default withRouter(FriendList);
