import express, { Router } from 'express';

import  { getStatus } from "../controllers/statusController";

const statusRouter = Router();

statusRouter.get('/', getStatus);

export default statusRouter;