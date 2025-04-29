import { Container } from 'react-bootstrap';
import React from 'react';

function LoadingPage() {
    return (
        <Container
        className="my-5 p-5 rounded flex-grow-1 d-flex justify-content-center align-items-center"
        >
        <div className="spinner" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
        </Container>
    );
}

export default LoadingPage;
