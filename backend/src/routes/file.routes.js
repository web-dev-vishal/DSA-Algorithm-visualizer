import { Router } from 'express';
import FileController from '../controllers/file.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate); // Authenticate for all uploads

// POST upload single file
router.post('/upload', upload.single('file'), FileController.uploadSingle);

// POST upload multiple files (up to 5 files)
router.post('/upload-multiple', upload.array('files', 5), FileController.uploadMultiple);

export default router;
