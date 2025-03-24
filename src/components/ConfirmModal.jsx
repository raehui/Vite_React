import React from 'react';
import { Button, Modal } from 'react-bootstrap';

function ConfirmModal({show , message , onYes , onCancel}) {
    return (
        <Modal show={show}>
            <Modal.Header>알림</Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant='success' onClick={onYes}>확인</Button>
                <Button variant='warning' onClick={onCancel}>취소</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmModal;