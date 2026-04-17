import { body, param, validationResult } from 'express-validator';

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

export const loginRules = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileRules = [
  param('id').isMongoId().withMessage('Invalid user id'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name length 2–100'),
  body('bio').optional().isString().isLength({ max: 500 }).withMessage('Bio max 500 characters'),
  body('privacySettings').optional().isObject(),
  body('privacySettings.profileVisibility')
    .optional()
    .isIn(['public', 'private', 'friends_only'])
    .withMessage('Invalid profile visibility'),
  body('privacySettings.showEmail').optional().isBoolean(),
  body('privacySettings.showBio').optional().isBoolean(),
];

export const getUserRules = [param('id').isMongoId().withMessage('Invalid user id')];

export const changePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/[A-Za-z]/)
    .withMessage('New password must contain at least one letter')
    .matches(/[0-9]/)
    .withMessage('New password must contain at least one number'),
];

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path || e.param, msg: e.msg })),
    });
  }
  next();
}
