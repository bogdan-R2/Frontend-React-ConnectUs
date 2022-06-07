import React, {useContext} from "react";
import {Redirect, Route} from 'react-router-dom';
import {observer} from "mobx-react-lite";
import {RootStoreContext} from "../stores/rootStore";


const PrivateRoute = observer(({ component: Component, ...rest }) => {
    const rootStore = useContext(RootStoreContext);
    const {user} = rootStore.userStore;

    return (
        <Route
            {...rest}
            render={props =>
                user ? (
                    <Component {...props} />
                ) : (
                    <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
                )
            }
        />
    )
});

export default PrivateRoute;