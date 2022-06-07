import React, { useContext } from 'react'
import { observer } from 'mobx-react-lite';
import { withRouter } from 'react-router'
import { RootStoreContext } from '../../stores/rootStore';
import UsersCard from './UsersCard';

const SearchUsers = observer(() => {

    const rootStore = useContext(RootStoreContext);
    const {searchedUsers} = rootStore.userStore;


    return (
        <div style={{ display: 'flex', alignItems: 'flex-start'}}>
            <div style={{width: '50%'}}>
                {searchedUsers.map(user => 
                    (<UsersCard key={user.username} user={user} />)
                )}
            </div>
        </div>
        
    )
})

export default withRouter(SearchUsers);
