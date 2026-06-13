import ContactMessage from '../models/ContactMessage.js';
import { ApiResponse } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

export class ContactController {
  // ── Submit Contact Message ─────────────────────────────────────────
  static async submitContact(req, res, next) {
    try {
      const { name, email, subject, message } = req.body;

      const contactMsg = new ContactMessage({
        name,
        email,
        subject,
        message
      });

      await contactMsg.save();
      logger.info(`New contact message submitted by ${name} (${email}): ${subject}`);

      return ApiResponse.success(res, {
        id: contactMsg._id,
        status: contactMsg.status
      }, 'Your message has been received. Our support team will get in touch shortly.', 201);
    } catch (err) {
      next(err);
    }
  }

  // ── Admin: List Messages ──────────────────────────────────────────
  static async adminGetMessages(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const filter = {};
      if (status) filter.status = status;

      const options = {
        skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
        limit: parseInt(limit, 10),
        sort: { createdAt: -1 }
      };

      const messages = await ContactMessage.find(filter, null, options);
      const totalDocs = await ContactMessage.countDocuments(filter);

      return ApiResponse.success(res, messages, 'Contact messages retrieved successfully', 200, {
        total: totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(totalDocs / parseInt(limit, 10))
      });
    } catch (err) {
      next(err);
    }
  }
}

export default ContactController;
