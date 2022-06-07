import { ContactSupportOutlined } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect, useState } from 'react'
import { User } from '../../api/agent';
import { RootStoreContext } from '../../stores/rootStore';
import Postare from '../Postari/Postare';
import PostareText from '../Postari/PostareText.js';
import './FriendList.css'

const ProfilePosts = observer(({ posts, history, user }) => {

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {posts.map(post => (<Postare key={post.post_id} postare={post} history={history} user={user} />))}

            </div>
        </div>
    )
})

export default ProfilePosts
