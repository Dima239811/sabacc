    import { FC } from "react";
    import { Button } from "@/shared/ui";
    import { Modal } from "@/shared/ui/Modal/Modal";
    import cls from "./UserExistsModal.module.scss";

    interface UserExistsModalProps {
      isOpen: boolean;
      onClose: () => void;
    }

    export const UserExistsModal: FC<UserExistsModalProps> = ({ isOpen, onClose }) => (
      <Modal isOpen={isOpen} onClose={onClose} className={cls.UserExistsModal}>
        <h2>Ошибка</h2>
        <p>Пользователь с таким именем уже существует</p>
        <Button onClick={onClose}>Вернуться</Button>
      </Modal>
    );

    export default UserExistsModal;