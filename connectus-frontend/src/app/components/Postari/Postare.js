import React, { useState, useEffect } from 'react'
import './Postare.css';
import { withRouter } from 'react-router-dom'
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import { User } from '../../api/agent';

const Postare = ({ postare, history, user }) => {
    const [comments, setComments] = useState(postare.comments);
    const [pag, setPag] = useState(0);
    const [message, setMessage] = useState('');
    const [like, setLike] = useState(postare.self_like);
    const [dis, setDis] = useState(false);
    const [diff, setDiff] = useState(0);

    const sendComment = async (message) => {
        User.sendComment(postare.post_id, message).then(response => {
            setComments([{
                text: message, username: user.username,
                avatar: user.avatar, comment_id: response.data.comment_id
            }, ...comments]);
            setPag(pag + 1);
        });
    }

    const likePost = async () => {
        setDis(true);
        User.like(postare.post_id, (like === 0 ? 1 : 0)).then(response => {
            setLike((like === 0 ? 1 : 0));
            setDis(false);
        })
    }

    useEffect(() => {
        if (postare.self_like === 1 && like === 0) {
            setDiff(-1);
        }
        if (postare.self_like === 1 && like === 1) {
            setDiff(0);
        }
        if (postare.self_like === 0 && like === 1) {
            setDiff(1);
        }
        if (postare.self_like === 0 && like === 0) {
            setDiff(0);
        }
    }, [like])

    return (
        <div>
            <div style={{ width: '500px', backgroundColor: 'white', marginBottom: '25px', borderTopLeftRadius: '15px', borderTopRightRadius: '15px' }}>
                <div className="post-header">
                    <div style={{ height: '60px', display: 'flex', margin: '0 15px' }}>
                        <div className="chat-avatar-post" onClick={() => history.push(`/profile/${postare.username}`)}>
                            <img
                                className='chat-avatar__image-post' src={postare.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} alt='avatar' />
                        </div>
                        <div onClick={() => history.push(`/profile/${postare.username}`)}
                            style={{
                                height: '100%', display: 'flex',
                                cursor: 'pointer',
                                flexDirection: 'column', justifyContent: 'center', marginLeft: '20px', fontSize: '20px', fontWeight: '600px'
                            }}>

                            <span>{postare.username}</span>
                        </div>

                    </div>

                </div>
                {
                    postare.text !== null &&
                    (<div style={{ width: '450px', textAlign: 'justify', margin: '10px 20px 10px 20px', overflowWrap: 'break-word', }}>
                        <p>{postare.text}</p>
                    </div>)
                }
                {
                    postare.media !== null &&
                    (<div style={{ height: '500px', width: '100%' }}>
                        <img height='100%' width="100%" src={postare.media} />
                    </div>)
                }

                <div style={{ marginTop: '25px', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <div>
                        <span>{postare.likes.length + diff} likes, {comments.length} Comments</span>
                        <br />
                        <div style={{ width: '90%', height: '1px', backgroundColor: 'grey' }}>

                        </div>

                    </div>

                </div>
                <div style={{ marginTop: '5px', marginBottom: '5px', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <Button
                        disabled={dis}
                        onClick={() => {
                            likePost();
                        }}
                        variant="contained" style={{ boxShadow: 'none', textTransform: 'none', backgroundColor: "#0000" }} startIcon={<ThumbUpIcon style={{ color: (like === 0 ? 'grey' : 'blue') }} />}>Like</Button>
                    <Button onClick={() => {
                        console.log(comments);
                        if (pag === 0) {
                            setPag(3);
                        }
                    }} variant="contained" style={{ boxShadow: 'none', textTransform: 'none', backgroundColor: '#0000' }} startIcon={<ChatBubbleIcon color="action" />}>Comment</Button>
                </div>
                {
                    pag !== 0 &&
                    (<div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>

                            <input style={{
                                width: '85%', marginLeft: '5px', marginRight: '5px',
                                border: 'none',
                                outline: 'none', paddingLeft: '25px', paddingRight: '25px',
                                marginBottom: '10px',
                                fontSize: '25px', backgroundColor: '#F0F2F5'
                            }} placeholder="Write your comment here..."
                                onChange={(e) => setMessage(e.target.value)} value={message}
                                onKeyPress={(e) => {
                                    if (e.charCode === 13) {
                                        if (message.length === 0) {
                                            return;
                                        }
                                        sendComment(message);
                                        setMessage('');
                                    }
                                }} />
                        </div>
                        {comments.slice(0, pag).map(comment => (
                            <div key={comment.comment_id} style={{ display: 'flex', flexDirection: 'row', }}>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <img onClick={() => history.push(`/profile/${comment.username}`)} style={{ cursor: 'pointer', marginLeft: '10px' }}
                                        className='chat-comment-post' src={comment.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-vector-user-profile-default-avatar-profile-vector-user-profile-profile-179376714.jpg'} alt='avatar' />

                                </div>
                                <span style={{ width: '90%', margin: '5px 5px', padding: '5px', borderRadius: '10px', backgroundColor: '#F0F2F5' }}>
                                    <strong onClick={() => history.push(`/profile/${comment.username}`)} style={{ cursor: 'pointer' }}>
                                        {comment.username}
                                    </strong><br />
                                    {comment.text}

                                </span>
                            </div>
                        ))}
                        {
                            pag < comments.length &&
                            <span onClick={() => {
                                setPag(pag + 3);
                            }} style={{ color: 'blue', cursor: 'pointer', marginLeft: '10px' }}> Load more...</span>
                        }
                    </div>)
                }
                {
                    pag === 3 && comments.length === 0 &&
                    <span style={{ marginLeft: '10px' }}>No comments yet</span>
                }
            </div>
        </div>
    )
}

export default withRouter(Postare);
