import { Router } from 'express';
import ApiKeyController from '../controllers/apiKey.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createApiKeySchema, updateApiKeySchema } from '../validators/schemas.js';

const router = Router();

router.use(authenticate); // Apply authentication to all key routes

router.post('/', validate(createApiKeySchema), ApiKeyController.createKey);
router.get('/', ApiKeyController.getKeys);
router.patch('/:id', validate(updateApiKeySchema), ApiKeyController.updateKey);
router.delete('/:id', ApiKeyController.deleteKey);

export default router;
