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
  Textarea,
  Text,
  useToast,
  HStack,
  Radio,
  RadioGroup,
  Box
} from '@chakra-ui/react';
import { FaGlobeAsia, FaUserFriends, FaLock } from 'react-icons/fa';
import axios from 'axios';

const ModalChinhSuaBaiViet = ({ isOpen, onClose, post, onPostUpdated }) => {
  const [noiDung, setNoiDung] = useState('');
  const [cheDoRiengTu, setCheDoRiengTu] = useState('cong_khai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (post) {
      setNoiDung(post.noiDung || '');
      setCheDoRiengTu(post.cheDoRiengTu || 'cong_khai');
    }
  }, [post]);

  const cheDoOptions = [
    { value: 'cong_khai', label: 'Công khai', icon: FaGlobeAsia, desc: 'Mọi người có thể xem' },
    { value: 'ban_be', label: 'Bạn bè', icon: FaUserFriends, desc: 'Chỉ bạn bè có thể xem' },
    { value: 'rieng_tu', label: 'Riêng tư', icon: FaLock, desc: 'Chỉ mình tôi có thể xem' }
  ];

  const handleSubmit = async () => {
    if (!noiDung.trim()) {
      toast({
        title: 'Vui lòng nhập nội dung bài viết',
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
      const updateData = {
        noiDung: noiDung,
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
        title: 'Cập nhật bài viết thành công',
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
      console.error('Lỗi khi cập nhật bài viết:', error);
      toast({
        title: 'Cập nhật bài viết thất bại',
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
        setNoiDung(post.noiDung || '');
        setCheDoRiengTu(post.cheDoRiengTu || 'cong_khai');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent borderRadius="lg">
        <ModalHeader borderBottom="1px" borderColor="gray.200" pb={4}>
          Chỉnh sửa bài viết
        </ModalHeader>
        
        <ModalBody py={6}>
          <VStack spacing={6} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
                Nội dung bài viết:
              </Text>
              <Textarea
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                size="md"
                rows={4}
                resize="none"
                borderRadius="md"
              />
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.700">
                Quyền riêng tư:
              </Text>
              <RadioGroup value={cheDoRiengTu} onChange={setCheDoRiengTu}>
                <VStack spacing={3} align="stretch">
                  {cheDoOptions.map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <Radio key={option.value} value={option.value} colorScheme="blue">
                        <HStack spacing={2}>
                          <IconComponent size={16} />
                          <Box>
                            <Text fontSize="sm" fontWeight="medium">
                              {option.label}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              {option.desc}
                            </Text>
                          </Box>
                        </HStack>
                      </Radio>
                    );
                  })}
                </VStack>
              </RadioGroup>
            </Box>
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

export default ModalChinhSuaBaiViet; 