import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router'
import { RootStoreContext } from '../../stores/rootStore';
import FriendCard from './FriendCard';
import LoadingPage from './FriendsLoading';


const FriendList = observer(({history}) => {

    const rootStore = useContext(RootStoreContext);
    const {friendList, getFriends} = rootStore.userStore;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFriends().then(() => setLoading(false));
    },[getFriends]);


    
    if(loading) return (<LoadingPage />);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start'}}>
            <div style={{width: '80%'}}>
                {friendList.map(user => 
                    (<FriendCard key={user.username} user={user} />)
                )}
            </div>
        </div>
        
    )
})

export default withRouter(FriendList);