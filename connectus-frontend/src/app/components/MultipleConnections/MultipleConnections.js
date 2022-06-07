import { Button, Paper } from '@material-ui/core'
import React from 'react'
import './MultipleConnections.css'

const MultipleConnections = () => {
    return (
        <div className="center-screen">
            <Paper className="paper" elevation={10}>
                <p>
                You have logged in from another tab
                </p>
                <Button variant="contained"
                color="primary" onClick={() => window.location.reload()}>
                    Press here to log in again
                </Button>
            </Paper>
        </div>
    )
}

export default MultipleConnections;
