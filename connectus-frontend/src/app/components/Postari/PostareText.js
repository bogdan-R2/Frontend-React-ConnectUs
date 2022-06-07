import { makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import React from 'react'

const PostareText = observer(({text}) => {
    const useStyles = makeStyles(() => ({
        root: {
            flexGrow: 1,
        },
        scroll:{
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
    
    const classes = useStyles();
    

    return (
        <div>
            <div className={classes.scroll} style={{ height: '200px', overflowY: 'scroll' }}>
                <p style={{ fontSize: '12px' }}>
                    {text}
                </p>
            </div>
        </div>
    )
})

export default PostareText
