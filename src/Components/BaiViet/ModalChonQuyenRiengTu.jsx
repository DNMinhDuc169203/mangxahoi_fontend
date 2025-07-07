import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  useToast,
  HStack,
  Radio,
  RadioGroup,
  Box
} from '@chakra-ui/react';
import { FaGlobeAsia, FaUserFriends, FaLock } from 'react-icons/fa';
import axios from 'axios';

const ModalChonQuyenRiengTu = ({ isOpen, onClose, post, onPostUpdated }) => {
  const [cheDoRiengTu, setCheDoRiengTu] = useState('cong_khai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (post) {
      setCheDoRiengTu(post.cheDoRiengTu || 'cong_khai');
    }
  }, [post]);

  const cheDoOptions = [
    { value: 'cong_khai', label: 'Công khai', icon: FaGlobeAsia, desc: 'Mọi người có thể xem bài viết này' },
    { value: 'ban_be', label: 'Bạn bè', icon: FaUserFriends, desc: 'Chỉ bạn bè có thể xem bài viết này' },
    { value: 'rieng_tu', label: 'Riêng tư', icon: FaLock, desc: 'Chỉ mình tôi có thể xem bài viết này' }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const updateData = {
        noiDung: post.noiDung,
        cheDoRiengTu: cheDoRiengTu
      };

      await axios.put(
        `http://localhost:8080/network/api/bai-viet/${post.id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Fetch lại chi tiết bài viết mới nhất
      const res = await axios.get(
        `http://localhost:8080/network/api/bai-viet/${post.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;

      toast({
        title: 'Cập nhật quyền riêng tư thành công',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top'
      });

      if (onPostUpdated) {
        onPostUpdated(updated);
      }

      onClose();
    } catch (error) {
      console.error('Lỗi khi cập nhật quyền riêng tư:', error);
      toast({
        title: 'Cập nhật quyền riêng tư thất bại',
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
      // Reset form
      if (post) {
        setCheDoRiengTu(post.cheDoRiengTu || 'cong_khai');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent borderRadius="lg">
        <ModalHeader borderBottom="1px" borderColor="gray.200" pb={4}>
          Chỉnh sửa quyền riêng tư
        </ModalHeader>
        
        <ModalBody py={6}>
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600" mb={4}>
              Chọn ai có thể xem bài viết này:
            </Text>
            
            <RadioGroup value={cheDoRiengTu} onChange={setCheDoRiengTu}>
              <VStack spacing={4} align="stretch">
                {cheDoOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <Radio key={option.value} value={option.value} colorScheme="blue">
                      <HStack spacing={3} align="flex-start">
                        <Box mt={1}>
                          <IconComponent size={18} />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="medium">
                            {option.label}
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {option.desc}
                          </Text>
                        </Box>
                      </HStack>
                    </Radio>
                  );
                })}
              </VStack>
            </RadioGroup>
          </VStack>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor="gray.200" pt={4}>
          <Button variant="ghost" mr={3} onClick={handleClose} isDisabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Đang cập nhật..."
          >
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalChonQuyenRiengTu; 