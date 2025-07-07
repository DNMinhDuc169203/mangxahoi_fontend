import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Radio,
  RadioGroup,
  Textarea,
  Text,
  useToast
} from '@chakra-ui/react';
import axios from 'axios';

const ModalBaoCaoBaiViet = ({ isOpen, onClose, postId, postTitle }) => {
  const [lyDo, setLyDo] = useState('spam');
  const [moTa, setMoTa] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const lyDoBaoCao = [
    { value: 'spam', label: 'Spam' },
    { value: 'quay_roi', label: 'Quấy rối' },
    { value: 'noi_dung_khong_phu_hop', label: 'Nội dung không phù hợp' },
    { value: 'tin_gia', label: 'Tin giả' },
    { value: 'khac', label: 'Khác' }
  ];

  const handleSubmit = async () => {
    if (!lyDo) {
      toast({
        title: 'Vui lòng chọn lý do báo cáo',
        status: 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top'
      });
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const baoCaoData = {
        lyDo: lyDo,
        moTa: moTa,
        baiViet: { id: postId }
      };

      await axios.post(
        'http://localhost:8080/network/api/bao-cao/guibaocao',
        baoCaoData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: 'Đã gửi báo cáo thành công',
        description: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });

      onClose();
      setLyDo('spam');
      setMoTa('');
    } catch (error) {
      console.error('Lỗi khi gửi báo cáo:', error);
      toast({
        title: 'Gửi báo cáo thất bại',
        description: 'Vui lòng thử lại sau',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setLyDo('spam');
      setMoTa('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="md" borderRadius="lg">
        <ModalHeader borderBottom="1px" borderColor="gray.200" pb={4}>
          Báo cáo bài viết
        </ModalHeader>
        
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600" mb={2}>
              Vui lòng chọn lý do báo cáo bài viết này:
            </Text>
            
            <RadioGroup value={lyDo} onChange={setLyDo}>
              <VStack spacing={3} align="stretch">
                {lyDoBaoCao.map((item) => (
                  <Radio key={item.value} value={item.value} colorScheme="red">
                    <Text fontSize="sm">{item.label}</Text>
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>

            <Text fontSize="sm" color="gray.600" mt={4}>
              Mô tả thêm (không bắt buộc):
            </Text>
            
            <Textarea
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
              placeholder="Mô tả chi tiết lý do báo cáo..."
              size="sm"
              rows={3}
              resize="none"
            />
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.200" pt={4}>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Đang gửi..."
          >
            Gửi báo cáo
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalBaoCaoBaiViet; 