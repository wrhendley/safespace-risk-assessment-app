// SuccessModal.tsx
// This reusable modal component displays a success message after a user action is completed.
// It can be customized with a title, message, and button text.

import React from 'react';
import { Modal, Button } from "react-bootstrap";

// Props for the SuccessModal component
interface SuccessModalProps {
    show: boolean;              // Whether the modal is visible
    onClose: () => void;        // Function to call when the modal is closed
    title?: string;             // Optional title for the modal (defaults to "Success!")
    message?: string;           // Optional body message (defaults to a generic success message)
    buttonText?: string;        // Optional text for the action button (defaults to "Continue")
}

const SuccessModal = ({
    show,
    onClose,
    title = "Success!",
    message = "Your action was completed successfully.",
    buttonText = "Continue"
}: SuccessModalProps) => {
    return (
        <Modal show={show} onHide={onClose} centered>
            <div className='modal-content success'>
                {/* Modal header with close button */}
                <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>

                {/* Modal message body */}
                <Modal.Body>{message}</Modal.Body>

                {/* Modal footer with action button */}
                <Modal.Footer>
                    <Button variant="success" onClick={onClose}>
                        {buttonText}
                    </Button>
                </Modal.Footer>
            </div>
        </Modal>
    );
};

export default SuccessModal;
