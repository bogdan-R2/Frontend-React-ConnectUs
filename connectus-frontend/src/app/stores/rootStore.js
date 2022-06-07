import { createContext } from "react";

import {UserStore} from "./userStore";

class RootStore {
    userStore;
    constructor() {
        this.userStore = new UserStore(this);
    }
}

export const RootStoreContext = createContext(new RootStore());