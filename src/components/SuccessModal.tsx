// components/SuccessModal.tsx
import { Modal, Button } from "react-bootstrap";

interface SuccessModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
    buttonText?: string;
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
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{message}</Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={onClose}>
            {buttonText}
            </Button>
        </Modal.Footer>
        </Modal>
    );
};

export default SuccessModal;
