import { Modal, ModalOverlay, ModalContent, ModalBody, Button, VStack, Divider } from '@chakra-ui/react';

const ModalTuyChonBaiViet = ({ isOpen, onClose, isOwnPost, onEdit, onPrivacy, onDelete, onReport }) => {
  if (isOpen) {
    console.log('ModalTuyChonBaiViet opened');
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="xs" borderRadius="lg" overflow="hidden" zIndex={2000}>
        <ModalBody p={0}>
          <VStack spacing={0} align="stretch">
            {isOwnPost ? (
              <>
                <Button color="blue.600" variant="ghost" onClick={onEdit} w="100%" py={6} fontWeight="bold">Chỉnh sửa bài viết</Button>
                <Divider borderColor="gray.200" />
                <Button color="blue.600" variant="ghost" onClick={onPrivacy} w="100%" py={6} fontWeight="bold">Chỉnh sửa quyền riêng tư</Button>
                <Divider borderColor="gray.200" />
                <Button color="red.500" variant="ghost" onClick={onDelete} w="100%" py={6} fontWeight="bold">Xóa bài viết</Button>
                <Divider borderColor="gray.200" />
              </>
            ) : (
              <>
                <Button color="red.500" variant="ghost" onClick={onReport} w="100%" py={6} fontWeight="bold">Báo cáo bài viết</Button>
                <Divider borderColor="gray.200" />
              </>
            )}
            <Button variant="ghost" onClick={onClose} w="100%" py={6} fontWeight="bold">Hủy</Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalTuyChonBaiViet; 