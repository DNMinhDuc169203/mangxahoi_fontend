import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@chakra-ui/react';
import { useNavigate } from "react-router-dom";

const DanhSachNguoiThichModal = ({ isOpen, onClose, baiVietId, soLuotThich }) => {
    const [danhSachNguoiThich, setDanhSachNguoiThich] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingKetBan, setLoadingKetBan] = useState({}); // { [id]: boolean }
    const [friendStatus, setFriendStatus] = useState({}); // { [id]: status }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const toast = useToast();
    const navigate = useNavigate();

    const trangThaiDaGuiLoiMoi = ['da_gui_loi_moi', 'cho_chap_nhan'];

    useEffect(() => {
        if (isOpen && baiVietId) {
            layDanhSachNguoiThich();
        }
    }, [isOpen, baiVietId]);

    const layDanhSachNguoiThich = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/network/api/bai-viet/${baiVietId}/luot-thich`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setDanhSachNguoiThich(response.data);
            const statusObj = {};
            await Promise.all(response.data.map(async (nguoiDung) => {
                if (user?.id !== nguoiDung.id) {
                    try {
                        const res = await axios.get(`http://localhost:8080/network/api/ket-ban/trang-thai/${nguoiDung.id}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        statusObj[nguoiDung.id] = res.data.status;
                    } catch {
                        statusObj[nguoiDung.id] = 'khong_quen';
                    }
                }
            }));
            setFriendStatus(statusObj);
        } catch (err) {
            console.error('Lỗi khi lấy danh sách người thích:', err);
            setError('Không thể tải danh sách người thích');
        } finally {
            setLoading(false);
        }
    };

    const handleKetBan = async (idNguoiNhan) => {
        setLoadingKetBan(prev => ({ ...prev, [idNguoiNhan]: true }));
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/network/api/ket-ban/loi-moi/${idNguoiNhan}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            toast({ title: 'Đã gửi lời mời kết bạn!', status: 'success', duration: 1500, isClosable: true, position: 'top' });
            setFriendStatus(prev => ({ ...prev, [idNguoiNhan]: 'da_gui_loi_moi' }));
        } catch (err) {
            toast({ title: 'Gửi lời mời kết bạn thất bại!', status: 'error', duration: 1500, isClosable: true, position: 'top' });
        } finally {
            setLoadingKetBan(prev => ({ ...prev, [idNguoiNhan]: false }));
        }
    };

    const handleHuyLoiMoi = async (idNguoiNhan) => {
        setLoadingKetBan(prev => ({ ...prev, [idNguoiNhan]: true }));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8080/network/api/ket-ban/danh-sach/loi-moi-gui', {
                headers: { 'Authorization': `Bearer ${token}` },
                params: { page: 0, size: 50 }
            });
            // Tìm lời mời dựa trên idNguoiNhan, không phải nguoiNhan.id
            const loiMoi = res.data.content?.find(lm => lm.idNguoiNhan === idNguoiNhan);
            if (!loiMoi) throw new Error('Không tìm thấy lời mời');
            await axios.delete(`http://localhost:8080/network/api/ket-ban/huy-loi-moi/${loiMoi.idLoiMoi}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast({ title: 'Đã hủy lời mời kết bạn!', status: 'success', duration: 1500, isClosable: true, position: 'top' });
            setFriendStatus(prev => ({ ...prev, [idNguoiNhan]: 'khong_quen' }));
        } catch (err) {
            console.error('Lỗi khi hủy lời mời:', err);
            toast({ title: 'Hủy lời mời kết bạn thất bại!', status: 'error', duration: 1500, isClosable: true, position: 'top' });
        } finally {
            setLoadingKetBan(prev => ({ ...prev, [idNguoiNhan]: false }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Người thích bài viết
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            {error}
                        </div>
                    ) : danhSachNguoiThich.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có ai thích bài viết này
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {danhSachNguoiThich.map((nguoiDung) => (
                                <div key={nguoiDung.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    {/* Avatar */}
                                    <div className="flex-shrink-0">
                                        {nguoiDung.anhDaiDien ? (
                                            <img
                                                src={nguoiDung.anhDaiDien}
                                                alt={nguoiDung.hoTen}
                                                className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                                onClick={() => navigate(`/profile/${nguoiDung.id}`)}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
                                                onClick={() => navigate(`/profile/${nguoiDung.id}`)}
                                            >
                                                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thông tin người dùng */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate cursor-pointer"
                                            onClick={() => navigate(`/profile/${nguoiDung.id}`)}
                                        >
                                            {nguoiDung.hoTen}
                                        </p>
                                        {nguoiDung.gioiThieu && (
                                            <p className="text-xs text-gray-500 truncate">
                                                {nguoiDung.gioiThieu}
                                            </p>
                                        )}
                                    </div>

                                    {/* Nút thao tác bạn bè */}
                                    {user?.id !== nguoiDung.id && (
                                        friendStatus[nguoiDung.id] === 'khong_quen' ? (
                                            <button
                                                className="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors disabled:opacity-50"
                                                onClick={() => handleKetBan(nguoiDung.id)}
                                                disabled={loadingKetBan[nguoiDung.id]}
                                            >
                                                {loadingKetBan[nguoiDung.id] ? 'Đang gửi...' : 'Thêm bạn'}
                                            </button>
                                        ) : trangThaiDaGuiLoiMoi.includes(friendStatus[nguoiDung.id]) ? (
                                            <button
                                                className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors disabled:opacity-50"
                                                onClick={() => handleHuyLoiMoi(nguoiDung.id)}
                                                disabled={loadingKetBan[nguoiDung.id]}
                                            >
                                                {loadingKetBan[nguoiDung.id] ? 'Đang hủy...' : 'Hủy lời mời'}
                                            </button>
                                        ) : null
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-4 text-center">
                    <p className="text-sm text-gray-500">
                        {danhSachNguoiThich.length} người đã thích bài viết này
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DanhSachNguoiThichModal; 