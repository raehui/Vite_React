import React from 'react';
import { Button, Modal } from 'react-bootstrap';
/*
    show : Modal 을 띄울지 여부 (boolean)
    message : Modal 메세지 (string)
    onYes : Modal 의 확인 버튼을 눌렀을 때 호출될 함수 (function)

*/

function AlertModal({show, message, onYes}) {
    return (
       <Modal show={show}>
            <Modal.Header>알림</Modal.Header>
            <Modal.Body>
                {message}
            </Modal.Body>
            <Modal.Footer>
                <Button variant='success' onClick={onYes}>확인</Button>
            </Modal.Footer>
       </Modal>
    );
}

export default AlertModal;