import express from 'express';
import {
    jobShowAll,
    jobShow,
    jobCreate,
    jobUpdate,
    jobDelete,
    jobShowCreate
} from '../controllers/jobs.js';

const router = express.Router();
router.route('/').get(jobShowAll).post(jobCreate);
router.get('/new', jobShowCreate);
router.get('/edit/:id', jobShow);
router.post('/update/:id', jobUpdate);
router.post('/delete/:id', jobDelete);

export default router;