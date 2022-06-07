import { IconButton, Paper, Typography } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { RootStoreContext } from '../../stores/rootStore';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { withRouter } from 'react-router';
import './ChatComponent.css';
import ChatFriendComponent from './ChatFriendComponent';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SendIcon from '@material-ui/icons/Send';


const useStyles = makeStyles(() => ({
    scroll: {
        '&::-webkit-scrollbar': {
            width: '0.4em'
        },
        '&::-webkit-scrollbar-track': {
            boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
            webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,.1)',
        }
    }
}));

const ChatComponent = observer(({ history }) => {
    const rootStore = useContext(RootStoreContext);
    const { friendList, getFriends, selectedFriend, setSelectedFriend, openChat, setOpenChat, messages, user, sendMessage } = rootStore.userStore;
    const messagesEndRef = useRef(null)

    useEffect(() => {
        getFriends(history);
    }, []);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ block: "end" })
    }
    useEffect(() => {
        scrollToBottom()
        //console.log(selectedFriend);
    }, [messages]);

    const [message, setMessage] = useState('');

    const classes = useStyles();


    return (
        <Paper elevation={10} style={{
            position: 'fixed', bottom: '0', zIndex: '9999', right: '5vh', width: '50vh', height: (openChat ? '75vh' : '40px'),
        }}>
            <div className="header" onClick={() => {
                setOpenChat(!openChat);
                setSelectedFriend(null)
            }}>
                {
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                        Chat
                    </div>
                }
            </div>
            {
                openChat && selectedFriend === null &&
                <div className={classes.scroll} style={{ overflowY: 'scroll', height: '90%', width: '100%' }}>
                    {friendList.map(friend =>
                        <ChatFriendComponent key={friend.username} user={friend} setSelectedFriend={setSelectedFriend} />
                    )}
                </div>
            }
            {
                openChat && selectedFriend &&
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div className="sub-header">
                        <div style={{ display: 'flex', height: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', paddingLeft: '10px' }}>
                                <ArrowBackIcon onClick={() => setSelectedFriend(null)} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '10px' }}>
                                <div>
                                    <div className="chat-avatar-messenger">
                                        <img
                                            className='chat-avatar-messenger__image' src={selectedFriend.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} alt='avatar' />
                                    </div>
                                </div>

                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: '10px' }}>
                                <Typography style={{ marginBottom: '0' }} style={{ color: 'white' }} gutterBottom>
                                    {selectedFriend.username}
                                </Typography>
                            </div>
                            <div style={{ flexGrow: 1 }}>

                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', marginRight: '10px' }}>
                                <div className='onlinestatusinsidemessenger' style={{ backgroundColor: (!selectedFriend.online ? 'grey' : 'green') }}></div>
                            </div>

                        </div>

                    </div>
                    <div className="messages" style={{ height:'85%', backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
                        <div className={classes.scroll} style={{ height: '85%', overflowY: 'scroll' }}>

                            {messages.map((mesaj, index) =>
                                <div key={index} style={{ width: '100%', display: 'flex', justifyContent: (mesaj.user_id === user.user_id ? 'flex-end' : 'flex-start'), }}>
                                    <span style={{
                                        backgroundColor: (mesaj.user_id === user.user_id ? '#e2ffc7' : 'white'), maxWidth: '90%', marginTop: '7px',
                                        overflowWrap: 'break-word',
                                        marginLeft: (mesaj.user_id === user.user_id ? '0' : '10px'),
                                        marginRight: (mesaj.user_id === user.user_id ? '10px' : '0'),
                                        padding: '0 10px 0 10px', fontSize: '20px', fontWeight: '500',
                                        borderRadius: '1rem',
                                        color: 'black'
                                    }}>
                                        {mesaj.msg}
                                        {/* {mesaj.sent} */}
                                    </span>

                                </div>
                            )}
                            <div ref={messagesEndRef} />

                        </div>

                    </div>

                    <div style={{ width: '50vh', position: 'fixed', bottom: '5px' }}>
                        <div style={{ width: '100%', display: 'flex' }}>

                            <input style={{
                                flexGrow: 1, marginLeft: '5px', marginRight: '5px',
                                borderRadius: '2rem', border: 'none',
                                outline: 'none', paddingLeft: '25px', paddingRight: '25px',
                                fontSize: '20px'
                            }} onChange={(e) => setMessage(e.target.value)} value={message}
                                onKeyPress={(e) => {
                                    if (e.charCode === 13) {
                                        if (message.length === 0) {
                                            return;
                                        }
                                        sendMessage(message);
                                        setMessage('');
                                    }
                                }} />
                            <IconButton style={{ backgroundColor: '#114080' }} onClick={() => {
                                if (message.length === 0) {
                                    return;
                                }
                                sendMessage(message);
                                setMessage('');
                            }}>
                                <SendIcon style={{ fill: 'white' }} />
                            </IconButton>
                        </div>
                    </div>

                </div>
            }
        </Paper>

    )
});

export default withRouter(ChatComponent);
