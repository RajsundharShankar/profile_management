import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import {
  getUser,
  updateProfile,
  uploadAvatar as uploadAvatarCtrl,
  changePassword,
} from '../controllers/userController.js';
import {
  getUserRules,
  updateProfileRules,
  changePasswordRules,
  validate,
} from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.put('/change-password', changePasswordRules, validate, changePassword);
router.post(
  '/upload-avatar',
  (req, res, next) => {
    uploadAvatar.single('avatar')(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  uploadAvatarCtrl
);
router.get('/:id', getUserRules, validate, getUser);
router.put('/:id', updateProfileRules, validate, updateProfile);

export default router;
