// LoadingPage.tsx
// This page displays whenever another page is loading.

import React from 'react';
import { Container } from 'react-bootstrap';

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
