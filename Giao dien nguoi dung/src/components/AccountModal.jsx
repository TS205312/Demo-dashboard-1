import { UserCog } from 'lucide-react';
import Modal from './Modal';
import ProfilePage from './ProfilePage';

/**
 * AccountModal — quản lý tài khoản bác sĩ
 */
export default function AccountModal({ show, onClose, user, onUpdated, onNotify }) {
  return (
    <Modal show={show} onClose={onClose} title="Tài khoản của tôi" icon={UserCog} large>
      <ProfilePage user={user} onUpdated={onUpdated} onNotify={onNotify} />
    </Modal>
  );
}
